import { NextResponse, NextRequest } from "next/server";
import prisma from "@/prisma/client";
import { z } from 'zod';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import jwt from 'jsonwebtoken';

// Esquema de validación para la creación y actualización de movimientos.
// Usamos `z.coerce.date()` para convertir el string de fecha que llega en el JSON a un objeto Date.
const movementSchema = z.object({
    period_id: z.string().uuid({ message: "El ID del período debe ser un UUID válido." }),
    employee_id: z.string().uuid({ message: "El ID del empleado debe ser un UUID válido." }),
    incident_id: z.string().uuid({ message: "El ID de la incidencia debe ser un UUID válido." }),
    incidence_date: z.coerce.date({ message: "La fecha de incidencia es inválida." }),
    incidence_observation: z.string().optional(),
});



/**
 * Valida que todos los registros relacionados existan y estén activos
 */
async function validateRelatedRecords(periodId: string, employeeId: string, incidentId: string) {
    const [period, employee, incident] = await Promise.all([
        prisma.period.findUnique({
            where: { id: periodId },
            select: { id: true, periodStart: true, periodEnd: true, periodStatus: true }
        }),
        prisma.employee.findUnique({
            where: { id: employeeId },
            select: { id: true, employeeStatus: true }
        }),
        prisma.incident.findUnique({
            where: { id: incidentId },
            select: { id: true, incidentStatus: true }
        })
    ]);

    if (!period) {
        throw new Error("El período especificado no existe.");
    }

    if (period.periodStatus !== 'ACTIVE') {
        throw new Error("El período especificado no está activo.");
    }

    if (!employee) {
        throw new Error("El empleado especificado no existe.");
    }

    if (employee.employeeStatus !== 'ACTIVE') {
        throw new Error("El empleado especificado no está activo.");
    }

    if (!incident) {
        throw new Error("La incidencia especificada no existe.");
    }

    if (incident.incidentStatus !== 'ACTIVE') {
        throw new Error("La incidencia especificada no está activa.");
    }

    return { period, employee, incident };
}

/**
 * Valida que la fecha de incidencia esté dentro del rango del período
 */
function validateIncidenceDate(incidenceDate: Date, periodStart: Date, periodEnd: Date) {
    if (incidenceDate < periodStart || incidenceDate > periodEnd) {
        throw new Error("La fecha de incidencia debe estar dentro del rango del período seleccionado.");
    }
}

/**
 * Verifica si ya existe un movimiento duplicado para el mismo empleado, incidencia y período
 */
async function checkDuplicateMovement(periodId: string, employeeId: string, incidentId: string, excludeId?: string) {
    const whereClause: any = {
        periodId,
        employeeId,
        incidentId,
        incidenceStatus: 'ACTIVE'
    };

    if (excludeId) {
        whereClause.id = { not: excludeId };
    }

    const existingMovement = await prisma.movement.findFirst({
        where: whereClause
    });

    if (existingMovement) {
        throw new Error("Ya existe un movimiento activo para este empleado, incidencia y período.");
    }
}

/**
 * Obtiene las oficinas del usuario logueado
 */
async function getUserOffices(userId: string) {
    const userOffices = await prisma.userOffice.findMany({
        where: { userId },
        include: {
            office: {
                select: { id: true, officeName: true }
            }
        }
    });
    
    return userOffices.map(uo => uo.office.id);
}

/**
 * Maneja los errores de la API de forma centralizada.
 * @param error - El error capturado.
 * @param context - Un string que identifica el contexto del error (ej. 'MOVEMENTS_POST').
 * @returns Una respuesta JSON con el mensaje de error apropiado.
 */
function handleApiError(error: unknown, context: string): NextResponse {
    console.error(`[${context}]`, error);

    if (error instanceof z.ZodError) {
        return NextResponse.json(
            { message: "Datos de entrada inválidos", errors: error.errors },
            { status: 400 }
        );
    }

    if (error instanceof PrismaClientKnownRequestError) {
        // Ejemplo: Falla de llave foránea
        if (error.code === 'P2003') {
            return NextResponse.json(
                { message: `Error de referencia: El registro relacionado en '${error.meta?.field_name}' no fue encontrado.` },
                { status: 404 }
            );
        }
    }

    // Manejar errores de validación personalizados
    if (error instanceof Error) {
        return NextResponse.json(
            { message: error.message },
            { status: 400 }
        );
    }

    return NextResponse.json(
        { message: "Error interno del servidor." },
        { status: 500 }
    );
}

/**
 * GET: Obtiene una lista paginada y filtrable de movimientos de incidencias.
 * Solo devuelve movimientos de empleados que pertenezcan a las oficinas del usuario logueado.
 * @param request - La solicitud Next.js.
 * @returns Una respuesta JSON con la lista de movimientos, el total y el número de páginas.
 */
export async function GET(request: NextRequest) {
    try {
        // Obtener el token del usuario logueado
        const token = request.cookies.get('token')?.value;
        if (!token) {
            return NextResponse.json(
                { message: "No autenticado" },
                { status: 401 }
            );
        }

        // Verificar el token y obtener el ID del usuario
        const payload = jwt.verify(token, process.env.JWT_SECRET!) as { id?: string, userEmail?: string };
        if (!payload.id && !payload.userEmail) {
            return NextResponse.json(
                { message: "Token inválido" },
                { status: 401 }
            );
        }

        // Obtener el usuario y sus oficinas
        let user = null;
        if (payload.id) {
            user = await prisma.user.findUnique({
                where: { id: payload.id },
                select: { id: true, userRol: true }
            });
        } else {
            user = await prisma.user.findUnique({
                where: { userEmail: payload.userEmail! },
                select: { id: true, userRol: true }
            });
        }

        if (!user) {
            return NextResponse.json(
                { message: "Usuario no encontrado" },
                { status: 404 }
            );
        }

        // Si es SUPER_ADMIN, puede ver todos los movimientos
        let userOfficeIds: string[] = [];
        if (user.userRol !== 'SUPER_ADMIN') {
            userOfficeIds = await getUserOffices(user.id);
            if (userOfficeIds.length === 0) {
                return NextResponse.json(
                    { message: "No tienes oficinas asignadas" },
                    { status: 403 }
                );
            }
        }

        const { searchParams } = new URL(request.url);
        const page = parseInt(searchParams.get("page") || "1", 10);
        const pageSize = parseInt(searchParams.get("pageSize") || "10", 10);
        const search = searchParams.get("search") || "";
        const periodId = searchParams.get("periodId");
        const officeId = searchParams.get("officeId");

        const skip = (page - 1) * pageSize;

        let where: any = search
            ? {
                OR: [
                    {
                        employee: {
                            is: { employeeName: { contains: search, mode: 'insensitive' as const } }
                        }
                    },
                    {
                        incident: {
                            is: { incidentName: { contains: search, mode: 'insensitive' as const } }
                        }
                    },
                ],
            }
            : {};

        // Filtrar por período si se especifica
        if (periodId) {
            where = { ...where, periodId };
        }

        // Filtrar por officeId si se especifica
        if (officeId && officeId !== 'all') {
            where = {
                ...where,
                employee: {
                    ...where.employee,
                    officeId: officeId
                }
            };
        } else if (user.userRol !== 'SUPER_ADMIN') {
            // Filtrar por oficinas del usuario (excepto para SUPER_ADMIN)
            where = {
                ...where,
                employee: {
                    ...where.employee,
                    officeId: { in: userOfficeIds }
                }
            };
        }

        const [movements, total] = await prisma.$transaction([
            prisma.movement.findMany({
                where,
                skip,
                take: pageSize,
                include: {
                    employee: {
                        include: {
                            office: {
                                select: { id: true, officeName: true }
                            }
                        }
                    },
                    incident: true,
                },
                orderBy: {
                    createdAt: "desc",
                },
            }),
            prisma.movement.count({ where }),
        ]);

        return NextResponse.json({
            movements,
            total,
            totalPages: Math.ceil(total / pageSize),
        });
    } catch (error) {
        return handleApiError(error, 'MOVEMENTS_GET');
    }
}

/**
 * POST: Crea un nuevo movimiento de incidencia.
 * @param request - La solicitud Next.js con los datos del movimiento en el cuerpo.
 * @returns Una respuesta JSON con el movimiento creado o un mensaje de error.
 */
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { period_id, employee_id, incident_id, incidence_date, incidence_observation } = movementSchema.parse(body);

        // Validar registros relacionados
        const { period } = await validateRelatedRecords(period_id, employee_id, incident_id);

        // Validar fecha de incidencia
        validateIncidenceDate(incidence_date, period.periodStart, period.periodEnd);

        // Verificar duplicados
        await checkDuplicateMovement(period_id, employee_id, incident_id);

        const movement = await prisma.movement.create({
            data: {
                periodId: period_id,
                employeeId: employee_id,
                incidentId: incident_id,
                incidenceDate: incidence_date,
                incidenceObservation: incidence_observation || '',
                incidenceStatus: 'ACTIVE', // Usar el enum definido en Prisma
            },
            include: {
                employee: true,
                incident: true,
                period: true,
            },
        });

        return NextResponse.json(movement, { status: 201 });
    } catch (error) {
        return handleApiError(error, 'MOVEMENTS_POST');
    }
}

/**
 * PUT: Actualiza un movimiento de incidencia existente.
 * @param request - La solicitud Next.js con el ID del movimiento en los searchParams y los datos a actualizar en el cuerpo.
 * @returns Una respuesta JSON con el movimiento actualizado o un mensaje de error.
 */
export async function PUT(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');
        if (!id) {
            return NextResponse.json(
                { message: "El ID del movimiento es requerido." }, 
                { status: 400 }
            );
        }

        // Verificar que el movimiento existe
        const existingMovement = await prisma.movement.findUnique({
            where: { id },
            select: { id: true, incidenceStatus: true }
        });

        if (!existingMovement) {
            return NextResponse.json(
                { message: "El movimiento especificado no existe." },
                { status: 404 }
            );
        }

        const body = await request.json();
        const { period_id, employee_id, incident_id, incidence_date, incidence_observation } = movementSchema.parse(body);

        // Validar registros relacionados
        const { period } = await validateRelatedRecords(period_id, employee_id, incident_id);

        // Validar fecha de incidencia
        validateIncidenceDate(incidence_date, period.periodStart, period.periodEnd);

        // Verificar duplicados (excluyendo el movimiento actual)
        await checkDuplicateMovement(period_id, employee_id, incident_id, id);

        const movement = await prisma.movement.update({
            where: { id },
            data: {
                periodId: period_id,
                employeeId: employee_id,
                incidentId: incident_id,
                incidenceDate: incidence_date,
                incidenceObservation: incidence_observation || '',
                incidenceStatus: 'ACTIVE', // Usar el enum definido en Prisma
            },
            include: {
                employee: true,
                incident: true,
                period: true,
            },
        });

        return NextResponse.json(movement);
    } catch (error) {
        return handleApiError(error, 'MOVEMENTS_PUT');
    }
}