import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@/generated/prisma';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    const {
      company_id,
      office_id,
      user_name,
      user_email,
      user_password,
      user_status,
      user_rol
    } = await request.json();

    // Validar campos obligatorios
    if (!company_id || !office_id || !user_name || !user_email || !user_password || user_status === undefined || user_rol === undefined) {
      return NextResponse.json({ message: 'Todos los campos son requeridos' }, { status: 400 });
    }

    // Verifica si el usuario ya existe
    const existing = await prisma.users.findFirst({
      where: { user_email: user_email }
    });
    if (existing) {
      return NextResponse.json({ message: 'El usuario ya existe' }, { status: 409 });
    }

    // Hashea la contraseña
    const hashedPassword = await bcrypt.hash(user_password, 10);

    // Crea el usuario
    const user = await prisma.users.create({
      data: {
        company_id,
        office_id,
        user_name,
        user_email,
        user_password: hashedPassword,
        user_status,
        user_rol
      }
    });

    return NextResponse.json({
      message: 'Usuario creado exitosamente',
      user: {
        id: user.id,
        company_id: user.company_id,
        office_id: user.office_id,
        user_name: user.user_name,
        user_email: user.user_email,
        user_status: user.user_status,
        user_rol: user.user_rol
      }
    });
  } catch (error) {
    return NextResponse.json({ message: 'Error interno del servidor' }, { status: 500 });
  }
} 