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
    const existing = await prisma.user.findFirst({
      where: { userEmail: user_email }
    });
    if (existing) {
      return NextResponse.json({ message: 'El usuario ya existe' }, { status: 409 });
    }

    // Hashea la contraseña
    const hashedPassword = await bcrypt.hash(user_password, 10);

    // Crea el usuario
    const user = await prisma.user.create({
      data: {
        companyId: company_id,
        userName: user_name,
        userEmail: user_email,
        userPassword: hashedPassword,
        userStatus: user_status,
        userRol: user_rol
      }
    });

    return NextResponse.json({
      message: 'Usuario creado exitosamente',
      user: {
        id: user.id,
        company_id: user.companyId,
        user_name: user.userName,
        user_email: user.userEmail,
        user_status: user.userStatus,
        user_rol: user.userRol
      }
    });
  } catch (error) {
    console.error('Error al registrar usuario:', error);
    const errorMessage = error instanceof Error ? error.message : 'Ocurrió un error inesperado';
    
    return NextResponse.json(
      { message: 'Error interno del servidor', error: errorMessage },
      { status: 500 }
    );
  }
} 