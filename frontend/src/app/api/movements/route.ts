import { NextResponse, NextRequest } from "next/server";
import prisma from "@/prisma/client";
import { z } from 'zod';

// Esquema de validación para la creación y actualización de movimientos.
// Usamos `z.coerce.date()` para convertir el string de fecha que llega en el JSON a un objeto Date.
const movementSchema = z.object({
    employeeCode: z.coerce.number({ invalid_type_error: "El código de empleado debe ser un número." }).int().positive({ message: "El código de empleado es requerido y debe ser positivo." }),
    incidentCode: z.string().min(1, { message: "El código de la incidencia es requerido." }),
    incidenceDate: z.coerce.date({ message: "La fecha de incidencia es inválida." }),
    incidenceObservation: z.string().optional(),
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
                        employee: {
                            employee_name: { contains: search, mode: "insensitive" },
                        },
                    },
                    {
                        incident: {
                            incident_name: { contains: search, mode: "insensitive" },
                        },
                    },
                ],
            }
            : {};

        const [movements, total] = await prisma.$transaction([
            prisma.movements.findMany({
                where,
                skip,
                take: pageSize,
                include: {
                    employee: true,
                    incident: true,
                },
                orderBy: {
                    created_at: "desc",
                },
            }),
            prisma.movements.count({ where }),
        ]);

        return NextResponse.json({
            movements,
            total,
            totalPages: Math.ceil(total / pageSize),
        });
    } catch (error) {
        // Aunque tenemos un manejador de errores genérico, para GET es más simple
        // mantenerlo aquí ya que no necesita manejar ZodError.
        console.error("Error fetching movements:", error);
        
        return NextResponse.json(
            { message: "Error al obtener los movimientos." },
            { status: 500 }
        );
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
        const { employeeCode, incidentCode, incidenceDate, incidenceObservation } = movementSchema.parse(body);

        const movement = await prisma.movements.create({
            data: { 
                employee_code: employeeCode, 
                incident_code: incidentCode, 
                incidence_date: incidenceDate,
                incidence_observation: incidenceObservation || '',
                incidence_status: 1,
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
        const { employeeCode, incidentCode, incidenceDate, incidenceObservation } = movementSchema.parse(body);

        const movement = await prisma.movements.update({
            where: { id },
            data: { 
                employee_code: employeeCode, 
                incident_code: incidentCode, 
                incidence_date: incidenceDate,
                incidence_observation: incidenceObservation || '',
                incidence_status: 1,
            },
        });

        return NextResponse.json(movement);
    } catch (error) {
        return handleApiError(error, 'MOVEMENTS_PUT');
    }
}