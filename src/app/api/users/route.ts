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
          { userName: { contains: search, mode: 'insensitive' as const } },
          { userEmail: { contains: search, mode: 'insensitive' as const } },
        ],
      }
    : {};

  try {
    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy: { createdAt: 'desc' },
        include: {
          userOffices: true,
        },
      }),
      prisma.user.count({ where }),
    ]);

    // Mapear offices para SUPERVISOR_REGIONES
    const usersWithOffices = users.map(u => ({
      ...u,
      officeIds: u.userOffices ? u.userOffices.map(uo => uo.officeId) : [],
    }));

    return NextResponse.json({
      users: usersWithOffices,
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
    const body = await request.json();
    const { user_name, user_email, user_password, user_status, user_rol, company_id, office_id, office_ids } = body;
    if (!user_name || !user_email || !user_password || user_status === undefined || user_rol === undefined || !company_id) {
      console.error('Faltan campos requeridos:', body);

      return NextResponse.json({ message: 'Todos los campos son requeridos' }, { status: 400 });
    }
    const existing = await prisma.user.findFirst({ where: { userEmail: user_email } });
    if (existing) {
      console.error('Usuario ya existe:', user_email);

      return NextResponse.json({ message: 'El usuario ya existe' }, { status: 409 });
    }
    const hashedPassword = await bcrypt.hash(user_password, 10);
    const user = await prisma.user.create({
      data: {
        userName: user_name,
        userEmail: user_email,
        userPassword: hashedPassword,
        userStatus: user_status,
        userRol: user_rol,
        companyId: company_id,
      },
    });
    // Asociar oficinas si corresponde
    if (user_rol === 'SUPERVISOR_REGIONES' && Array.isArray(office_ids)) {
      for (const officeId of office_ids) {
        await prisma.userOffice.create({ data: { userId: user.id, officeId } });
      }
    } else if (office_id) {
      await prisma.userOffice.create({ data: { userId: user.id, officeId: office_id } });
    }

    return NextResponse.json(user);
  } catch (error) {
    console.error('Error en POST /api/users:', error);

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
    const { id, user_name, user_email, user_status, user_rol, company_id, office_id, office_ids } = await request.json();
    if (!id || !user_name || !user_email || user_status === undefined || user_rol === undefined || !company_id) {
      return NextResponse.json({ message: 'Todos los campos son requeridos' }, { status: 400 });
    }
    const user = await prisma.user.update({
      where: { id },
      data: {
        userName: user_name,
        userEmail: user_email,
        userStatus: user_status,
        userRol: user_rol,
        companyId: company_id,
      },
    });
    // Limpiar relaciones previas
    await prisma.userOffice.deleteMany({ where: { userId: id } });
    // Asociar oficinas si corresponde
    if (user_rol === 'SUPERVISOR_REGIONES' && Array.isArray(office_ids)) {
      for (const officeId of office_ids) {
        await prisma.userOffice.create({ data: { userId: id, officeId } });
      }
    } else if (office_id) {
      await prisma.userOffice.create({ data: { userId: id, officeId: office_id } });
    }
    
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
    await prisma.user.delete({ where: { id } });
    
return NextResponse.json({ message: 'Usuario eliminado correctamente' });
  } catch (error) {
    return NextResponse.json({ message: 'Error al eliminar usuario' }, { status: 500 });
  }
} 