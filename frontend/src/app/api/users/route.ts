import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@/generated/prisma';
import { verifyAuthToken } from '@/lib/auth';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

function getTokenFromRequest(request: NextRequest) {
  return request.cookies.get('token')?.value;
}

// GET: Listar usuarios con paginación y búsqueda
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
        OR: [
          { user_name: { contains: search, mode: 'insensitive' } },
          { user_email: { contains: search, mode: 'insensitive' } },
        ],
      }
    : {};

  try {
    const [users, total] = await Promise.all([
      prisma.users.findMany({
        where,
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy: { created_at: 'desc' },
      }),
      prisma.users.count({ where }),
    ]);

    return NextResponse.json({
      users,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    });
  } catch (error) {
    return NextResponse.json({ message: 'Error al obtener usuarios' }, { status: 500 });
  }
}

// POST: Crear un nuevo usuario
export async function POST(request: NextRequest) {
  const token = getTokenFromRequest(request);
  if (!verifyAuthToken(token)) {
    return NextResponse.json({ message: 'No autorizado' }, { status: 401 });
  }
  try {
    const { user_name, user_email, user_password, user_status, user_rol, company_id, office_id } = await request.json();
    if (!user_name || !user_email || !user_password || user_status === undefined || user_rol === undefined || !company_id || !office_id) {
      return NextResponse.json({ message: 'Todos los campos son requeridos' }, { status: 400 });
    }
    const existing = await prisma.users.findFirst({ where: { user_email } });
    if (existing) {
      return NextResponse.json({ message: 'El usuario ya existe' }, { status: 409 });
    }
    const hashedPassword = await bcrypt.hash(user_password, 10);
    const user = await prisma.users.create({
      data: { user_name, user_email, user_password: hashedPassword, user_status, user_rol, company_id, office_id }
    });
    
return NextResponse.json(user);
  } catch (error) {
    return NextResponse.json({ message: 'Error al crear usuario' }, { status: 500 });
  }
}

// PUT: Editar un usuario (requiere id en el body)
export async function PUT(request: NextRequest) {
  const token = getTokenFromRequest(request);
  if (!verifyAuthToken(token)) {
    return NextResponse.json({ message: 'No autorizado' }, { status: 401 });
  }
  try {
    const { id, user_name, user_email, user_status, user_rol, company_id, office_id } = await request.json();
    if (!id || !user_name || !user_email || user_status === undefined || user_rol === undefined || !company_id || !office_id) {
      return NextResponse.json({ message: 'Todos los campos son requeridos' }, { status: 400 });
    }
    const user = await prisma.users.update({
      where: { id },
      data: { user_name, user_email, user_status, user_rol, company_id, office_id }
    });
    
return NextResponse.json(user);
  } catch (error) {
    return NextResponse.json({ message: 'Error al editar usuario' }, { status: 500 });
  }
}

// DELETE: Eliminar un usuario (requiere id en el body)
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
    await prisma.users.delete({ where: { id } });
    
return NextResponse.json({ message: 'Usuario eliminado correctamente' });
  } catch (error) {
    return NextResponse.json({ message: 'Error al eliminar usuario' }, { status: 500 });
  }
} 