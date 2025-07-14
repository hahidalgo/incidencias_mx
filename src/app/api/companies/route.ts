import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@/generated/prisma';
import { verifyAuthToken } from '@/lib/auth';

const prisma = new PrismaClient();

function getTokenFromRequest(request: NextRequest) {
  return request.cookies.get('token')?.value;
}

// GET: Listar companies con paginación y búsqueda
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
        companyName: { contains: search, mode: 'insensitive' as const },
      }
    : {};

  try {
    const [companies, total] = await Promise.all([
      prisma.company.findMany({
        where,
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.company.count({ where }),
    ]);

    return NextResponse.json({
      companies,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    });
  } catch (error) {
    return NextResponse.json({ message: 'Error al obtener companies' }, { status: 500 });
  }
}

// POST: Crear una nueva compañía
export async function POST(request: NextRequest) {
  const token = getTokenFromRequest(request);
  if (!verifyAuthToken(token)) {
    return NextResponse.json({ message: 'No autorizado' }, { status: 401 });
  }
  try {
    const { companyName, companyStatus } = await request.json();
    if (!companyName || companyStatus === undefined) {
      return NextResponse.json({ message: 'Todos los campos son requeridos' }, { status: 400 });
    }
    const company = await prisma.company.create({
      data: { companyName, companyStatus }
    });
    
return NextResponse.json(company);
  } catch (error) {
    return NextResponse.json({ message: 'Error al crear compañía' }, { status: 500 });
  }
}

// PUT: Editar una compañía (requiere id en el body)
export async function PUT(request: NextRequest) {
  const token = getTokenFromRequest(request);
  if (!verifyAuthToken(token)) {
    return NextResponse.json({ message: 'No autorizado' }, { status: 401 });
  }
  try {
    const { id, companyName, companyStatus } = await request.json();
    if (!id || !companyName || companyStatus === undefined) {
      return NextResponse.json({ message: 'Todos los campos son requeridos' }, { status: 400 });
    }
    const company = await prisma.company.update({
      where: { id },
      data: { companyName, companyStatus }
    });
    
return NextResponse.json(company);
  } catch (error) {
    return NextResponse.json({ message: 'Error al editar compañía' }, { status: 500 });
  }
}

// DELETE: Eliminar una compañía (requiere id en el body)
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
    await prisma.company.delete({ where: { id } });
    
return NextResponse.json({ message: 'Compañía eliminada correctamente' });
  } catch (error) {
    return NextResponse.json({ message: 'Error al eliminar compañía' }, { status: 500 });
  }
} 