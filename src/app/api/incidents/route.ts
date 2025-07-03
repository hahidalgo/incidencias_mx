import { NextResponse, NextRequest } from 'next/server';
import { PrismaClient } from '../../../generated/prisma';

const prisma = new PrismaClient();

/**
 * GET: Obtiene una lista paginada y filtrable de incidencias.
 * @param request - La solicitud Next.js.
 * @returns Una respuesta JSON con la lista de incidencias, el total y el número de páginas.
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1', 10);
    const pageSize = parseInt(searchParams.get('pageSize') || '7', 10);
    const search = searchParams.get('search') || '';

    const skip = (page - 1) * pageSize;

    const where = search
      ? {
          OR: [
            { incident_name: { contains: search, mode: 'insensitive' as const } },
            { incident_code: { contains: search, mode: 'insensitive' as const } },
          ],
        }
      : {};

    const [incidents, total] = await prisma.$transaction([
      prisma.incidents.findMany({
        where,
        skip,
        take: pageSize,
        orderBy: {
          created_at: 'desc',
        },
      }),
      prisma.incidents.count({ where }),
    ]);

    return NextResponse.json({
      incidents,
      total,
      totalPages: Math.ceil(total / pageSize),
    });
  } catch (error) {
    console.error('Error fetching incidents:', error);
    return NextResponse.json(
      { message: 'Error al obtener las incidencias.' },
      { status: 500 }
    );
  }
}

/**
 * POST: Crea una nueva incidencia.
 * @param request - La solicitud Next.js con los datos de la incidencia en el cuerpo.
 * @returns La incidencia recién creada.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { incident_code, incident_name, incident_status } = body;

    if (!incident_code || !incident_name) {
      return NextResponse.json(
        { message: 'Faltan campos requeridos: código y nombre de incidencia.' },
        { status: 400 }
      );
    }

    const newIncident = await prisma.incidents.create({
      data: {
        incident_code,
        incident_name,
        incident_status: incident_status !== undefined ? incident_status : 1,
      },
    });

    return NextResponse.json(newIncident, { status: 201 });
  } catch (error) {
    console.error('Error creating incident:', error);
    return NextResponse.json(
      { message: 'Error al crear la incidencia.' },
      { status: 500 }
    );
  }
}

/**
 * PUT: Actualiza una incidencia existente.
 * @param request - La solicitud Next.js con el ID y los datos a actualizar.
 * @returns La incidencia actualizada.
 */
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, ...incidentData } = body;

    if (!id) {
      return NextResponse.json({ message: 'El ID de la incidencia es requerido.' }, { status: 400 });
    }

    const updatedIncident = await prisma.incidents.update({
      where: { id },
      data: incidentData,
    });

    return NextResponse.json(updatedIncident);
  } catch (error) {
    console.error('Error updating incident:', error);
    return NextResponse.json(
      { message: 'Error al actualizar la incidencia.' },
      { status: 500 }
    );
  }
}

/**
 * DELETE: Elimina una incidencia.
 * @param request - La solicitud Next.js con el ID de la incidencia a eliminar.
 * @returns Un mensaje de confirmación.
 */
export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json();
    const { id } = body;

    if (!id) {
      return NextResponse.json({ message: 'El ID de la incidencia es requerido.' }, { status: 400 });
    }

    await prisma.incidents.delete({
      where: { id },
    });

    return NextResponse.json({ message: 'Incidencia eliminada con éxito.' });
  } catch (error: any) {
    console.error('Error deleting incident:', error);
    if (error.code === 'P2003') { // Foreign key constraint violation
      return NextResponse.json(
        { message: 'No se puede eliminar la incidencia porque tiene movimientos asociados.' },
        { status: 409 } // Conflict
      );
    }
    return NextResponse.json(
      { message: 'Error al eliminar la incidencia.' },
      { status: 500 }
    );
  }
}