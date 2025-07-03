import { NextResponse, NextRequest } from 'next/server';
import { PrismaClient } from '../../../generated/prisma';

const prisma = new PrismaClient();

/**
 * GET: Obtiene una lista paginada y filtrable de oficinas.
 * @param request - La solicitud Next.js.
 * @returns Una respuesta JSON con la lista de oficinas, el total y el número de páginas.
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1', 10);
    const pageSize = parseInt(searchParams.get('pageSize') || '7', 10);
    const search = searchParams.get('search') || '';

    const skip = (page - 1) * pageSize;

    const where = search
      ? { office_name: { contains: search, mode: 'insensitive' as const } }
      : {};

    const [offices, total] = await prisma.$transaction([
      prisma.offices.findMany({
        where,
        skip,
        take: pageSize,
        orderBy: {
          created_at: 'desc',
        },
      }),
      prisma.offices.count({ where }),
    ]);

    return NextResponse.json({
      offices,
      total,
      totalPages: Math.ceil(total / pageSize),
    });
  } catch (error) {
    console.error('Error fetching offices:', error);
    return NextResponse.json(
      { message: 'Error al obtener las oficinas.' },
      { status: 500 }
    );
  }
}

/**
 * POST: Crea una nueva oficina.
 * @param request - La solicitud Next.js con los datos de la oficina en el cuerpo.
 * @returns La oficina recién creada.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { company_id, office_name, office_status } = body;

    if (!company_id || !office_name) {
      return NextResponse.json(
        { message: 'Faltan campos requeridos: empresa y nombre de oficina.' },
        { status: 400 }
      );
    }

    const newOffice = await prisma.offices.create({
      data: {
        company_id,
        office_name,
        office_status: office_status !== undefined ? office_status : 1,
      },
    });

    return NextResponse.json(newOffice, { status: 201 });
  } catch (error) {
    console.error('Error creating office:', error);
    return NextResponse.json(
      { message: 'Error al crear la oficina.' },
      { status: 500 }
    );
  }
}

/**
 * PUT: Actualiza una oficina existente.
 * @param request - La solicitud Next.js con el ID y los datos a actualizar.
 * @returns La oficina actualizada.
 */
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, ...officeData } = body;

    if (!id) {
      return NextResponse.json({ message: 'El ID de la oficina es requerido.' }, { status: 400 });
    }

    const updatedOffice = await prisma.offices.update({
      where: { id },
      data: officeData,
    });

    return NextResponse.json(updatedOffice);
  } catch (error) {
    console.error('Error updating office:', error);
    return NextResponse.json(
      { message: 'Error al actualizar la oficina.' },
      { status: 500 }
    );
  }
}

/**
 * DELETE: Elimina una oficina.
 * @param request - La solicitud Next.js con el ID de la oficina a eliminar.
 * @returns Un mensaje de confirmación.
 */
export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json();
    const { id } = body;

    if (!id) {
      return NextResponse.json({ message: 'El ID de la oficina es requerido.' }, { status: 400 });
    }

    await prisma.offices.delete({
      where: { id },
    });

    return NextResponse.json({ message: 'Oficina eliminada con éxito.' });
  } catch (error: any) {
    console.error('Error deleting office:', error);
    if (error.code === 'P2003') { // Foreign key constraint violation
      return NextResponse.json(
        { message: 'No se puede eliminar la oficina porque tiene registros asociados (ej. empleados, usuarios).' },
        { status: 409 } // Conflict
      );
    }
    return NextResponse.json(
      { message: 'Error al eliminar la oficina.' },
      { status: 500 }
    );
  }
}