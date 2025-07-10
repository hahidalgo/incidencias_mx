import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@/generated/prisma';
import { verifyAuthToken } from '@/lib/auth';

const prisma = new PrismaClient();

function getTokenFromRequest(request: NextRequest) {
  return request.cookies.get('token')?.value;
}

// GET: Listar offices con paginación y búsqueda
export async function GET(request: NextRequest) {
  const token = getTokenFromRequest(request);
  if (!verifyAuthToken(token)) {
    return NextResponse.json({ message: 'No autorizado' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get('page') || '1', 10);
  const pageSize = parseInt(searchParams.get('pageSize') || '10', 10);
  const search = searchParams.get('search') || '';

  const where = search
    ? {
        officeName: { contains: search, mode: 'insensitive' },
      }
    : {};

  try {
    const [offices, total] = await Promise.all([
      prisma.office.findMany({
        where,
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.office.count({ where }),
    ]);

    return NextResponse.json({
      offices,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    });
  } catch (error) {
    return NextResponse.json({ message: 'Error al obtener offices' }, { status: 500 });
  }
}

// POST: Crear una nueva oficina
export async function POST(request: NextRequest) {
  const token = getTokenFromRequest(request);
  if (!verifyAuthToken(token)) {

    return NextResponse.json({ message: 'No autorizado' }, { status: 401 });
  }
  try {
    const { company_id, office_name, office_status } = await request.json();
    if (!company_id || !office_name || office_status === undefined) {
      return NextResponse.json({ message: 'Todos los campos son requeridos' }, { status: 400 });

    }
    const office = await prisma.office.create({
      data: {
        companyId: company_id,
        officeName: office_name,
        officeStatus: office_status
      }
    });

    return NextResponse.json(office);
  } catch (error) {
    return NextResponse.json({ message: 'Error al crear oficina' }, { status: 500 });
  }
}

// PUT: Actualizar una oficina (requiere id en el body)
export async function PUT(request: NextRequest) {
  const token = getTokenFromRequest(request);
  if (!verifyAuthToken(token)) {

    return NextResponse.json({ message: 'No autorizado' }, { status: 401 });
  }
  try {
    const { id, company_id, office_name, office_status } = await request.json();
    if (!id || !company_id || !office_name || office_status === undefined) {

      return NextResponse.json({ message: 'Todos los campos son requeridos' }, { status: 400 });
    }
    const office = await prisma.office.update({
      where: { id },
      data: {
        companyId: company_id,
        officeName: office_name,
        officeStatus: office_status
      }
    });

    return NextResponse.json(office);
  } catch (error) {
    return NextResponse.json({ message: 'Error al actualizar oficina' }, { status: 500 });
  }
}

// DELETE: Eliminar una oficina (requiere id en el body)
export async function DELETE(request: NextRequest) {
  const token = getTokenFromRequest(request);
  if (!verifyAuthToken(token)) {
    return NextResponse.json({ message: 'No autorizado' }, { status: 401 });
  }
  try {
    const { id } = await request.json();
    if (!id) {
      return NextResponse.json({ message: 'El id es requerido' }, { status: 400 });
    }
    await prisma.office.delete({ where: { id } });
    
    return NextResponse.json({ message: 'Oficina eliminada correctamente' });
  } catch (error) {
    return NextResponse.json({ message: 'Error al eliminar oficina' }, { status: 500 });
  }
} 