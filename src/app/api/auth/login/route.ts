import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@/generated/prisma';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    // Validar que se proporcionen los campos requeridos
    if (!email || !password) {
      
      return NextResponse.json(
        { message: 'Email y contraseña son requeridos' },
        { status: 400 }
      );
    }

    // Buscar el usuario por email
    const user = await prisma.users.findFirst({
      where: {
        user_email: email,
        user_status: 1, // Asumiendo que 1 es activo
      },
    });

    if (!user) {
      
      return NextResponse.json(
        { message: 'Credenciales inválidas' },
        { status: 401 }
      );
    }

    // Verificar la contraseña
    const isPasswordValid = await bcrypt.compare(password, user.user_password);

    if (!isPasswordValid) {
      
      return NextResponse.json(
        { message: 'Credenciales inválidas' },
        { status: 401 }
      );
    }

    // Crear la sesión del usuario
    const userSession = {
      id: user.id,
      name: user.user_name,
      email: user.user_email,
      role: user.user_rol,
      companyId: user.company_id,
      officeId: user.office_id,
    };

    // Generar JWT
    if (!process.env.JWT_SECRET) {
      return NextResponse.json({ message: 'Configuración de JWT faltante' }, { status: 500 });
    }
    const token = jwt.sign(userSession, process.env.JWT_SECRET, { expiresIn: '1d' });

    // Crear respuesta y setear cookie httpOnly
    const response = NextResponse.json({
      message: 'Login exitoso',
      user: userSession,
    });
    response.cookies.set('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24, // 1 día
    });
    
return response;

  } catch (error) {
    console.error('Error en login:', error);
    
    return NextResponse.json(
      { message: 'Error interno del servidor' },
      { status: 500 }
    );
  }
} 