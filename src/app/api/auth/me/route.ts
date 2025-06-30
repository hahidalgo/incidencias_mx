import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

export async function GET(request: NextRequest) {
  const token = request.cookies.get('token')?.value;
  if (!token) {
    return NextResponse.json({ message: 'No autenticado' }, { status: 401 });
  }
  if (!process.env.JWT_SECRET) {
    return NextResponse.json({ message: 'Configuración de JWT faltante' }, { status: 500 });
  }
  try {
    const user = jwt.verify(token, process.env.JWT_SECRET);
    
    return NextResponse.json({ user });
  } catch (e) {
    return NextResponse.json({ message: 'Token inválido' }, { status: 401 });
  }
} 