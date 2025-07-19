import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/prisma/client';
import jwt from 'jsonwebtoken';

export async function GET(req: NextRequest) {
  // Obtener el token del usuario logueado
  const token = req.cookies.get('token')?.value;
  if (!token) {
    return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
  }

  // Verificar el token y obtener el ID del usuario
  let userId: string | undefined = undefined;
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET!) as { id?: string, userEmail?: string };
    if (payload.id) {
      userId = payload.id;
    } else if (payload.userEmail) {
      const user = await prisma.user.findUnique({ where: { userEmail: payload.userEmail }, select: { id: true } });
      userId = user?.id;
    }
  } catch {
    return NextResponse.json({ error: 'Token inválido' }, { status: 401 });
  }

  if (!userId) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }

  const userOffices = await prisma.userOffice.findMany({
    where: { userId },
    include: { office: true },
  });

  const offices = userOffices.map((uo: any) => ({
    id: uo.office.id,
    officeName: uo.office.officeName,
  }));

  return NextResponse.json(offices);
} 