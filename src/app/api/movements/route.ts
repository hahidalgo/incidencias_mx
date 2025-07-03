import { NextResponse, NextRequest } from "next/server";
import prisma from "@/prisma/client";

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
                            employee_name: { contains: search, mode: "insensitive" as const },
                        },
                    },
                    {
                        incident: {
                            incident_name: { contains: search, mode: "insensitive" as const },
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
        console.error("Error fetching movements:", error);

        return NextResponse.json(
            { message: "Error al obtener los movimientos." },
            { status: 500 }
        );
    }
}