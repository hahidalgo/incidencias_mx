import { NextResponse, NextRequest } from "next/server";
import prisma from "@/prisma/client";
import { z } from 'zod';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';

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

    return NextResponse.json(
        { message: "Error interno del servidor." },
        { status: 500 }
    );
}

/**
 * GET: Obtiene una lista paginada y filtrable de movimientos de incidencias.
 * @param request - La solicitud Next.js.
 * @returns Una respuesta JSON con la lista de movimientos, el total y el número de páginas.
 */
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const page = parseInt(searchParams.get("page") || "1", 10);
        const pageSize = parseInt(searchParams.get("pageSize") || "10", 10);
        const search = searchParams.get("search") || "";

        const skip = (page - 1) * pageSize;

        const where = search
            ? {
                OR: [
                    {
                        employee: { // Búsqueda en el nombre del empleado relacionado
                            employeeName: { contains: search, mode: "insensitive" },
                        }
                    },
                    {
                        incident: { // Búsqueda en el nombre de la incidencia relacionada
                            incidentName: { contains: search, mode: "insensitive" },
                        }
                    },
                ],
            }
            : {};

        const [movements, total] = await prisma.$transaction([
            prisma.movement.findMany({
                where,
                skip,
                take: pageSize,
                include: {
                    employee: true,
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

        const movement = await prisma.movement.create({
            data: {
                periodId: period_id,
                employeeId: employee_id,
                incidentId: incident_id,
                incidenceDate: incidence_date,
                incidenceObservation: incidence_observation || '',
                incidenceStatus: 'ACTIVE', // Usar el enum definido en Prisma
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

        const body = await request.json();
        const { period_id, employee_id, incident_id, incidence_date, incidence_observation } = movementSchema.parse(body);

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
        });

        return NextResponse.json(movement);
    } catch (error) {
        return handleApiError(error, 'MOVEMENTS_PUT');
    }
}