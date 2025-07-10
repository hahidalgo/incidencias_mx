import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@/generated/prisma';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  const token = request.cookies.get('token')?.value;
  if (!token) {
    return NextResponse.json({ message: 'No autenticado' }, { status: 401 });
  }
  if (!process.env.JWT_SECRET) {
    return NextResponse.json({ message: 'Configuración de JWT faltante' }, { status: 500 });
  }
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET) as { id?: string, userEmail?: string };

    // Buscar el usuario por id (preferido) o por email
    let user = null;
    if (payload.id) {
      user = await prisma.user.findUnique({
        where: { id: payload.id },
        select: {
          id: true,
          userName: true,
          userEmail: true,
          userStatus: true,
          userRol: true,
          companyId: true,
          createdAt: true,
          updatedAt: true,
        }
      });
    } else if (payload.userEmail) {
      user = await prisma.user.findUnique({
        where: { userEmail: payload.userEmail },
        select: {
          id: true,
          userName: true,
          userEmail: true,
          userStatus: true,
          userRol: true,
          companyId: true,
          createdAt: true,
          updatedAt: true,
        }
      });
    }

    if (!user) {
      return NextResponse.json({ message: 'Usuario no encontrado' }, { status: 404 });
    }

    return NextResponse.json({ user });
  } catch (e) {
    return NextResponse.json({ message: 'Token inválido' }, { status: 401 });
  }
} 