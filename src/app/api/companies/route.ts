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
        company_name: { contains: search, mode: 'insensitive' },
      }
    : {};

  try {
    const [companies, total] = await Promise.all([
      prisma.companies.findMany({
        where,
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy: { created_at: 'desc' },
      }),
      prisma.companies.count({ where }),
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
    const { company_name, company_status } = await request.json();
    if (!company_name || company_status === undefined) {
      return NextResponse.json({ message: 'Todos los campos son requeridos' }, { status: 400 });
    }
    const company = await prisma.companies.create({
      data: { company_name, company_status }
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
    const { id, company_name, company_status } = await request.json();
    if (!id || !company_name || company_status === undefined) {
      return NextResponse.json({ message: 'Todos los campos son requeridos' }, { status: 400 });
    }
    const company = await prisma.companies.update({
      where: { id },
      data: { company_name, company_status }
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
    await prisma.companies.delete({ where: { id } });
    
return NextResponse.json({ message: 'Compañía eliminada correctamente' });
  } catch (error) {
    return NextResponse.json({ message: 'Error al eliminar compañía' }, { status: 500 });
  }
} 