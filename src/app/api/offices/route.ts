import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@/generated/prisma';
import { verifyAuthToken } from '@/lib/auth';

const prisma = new PrismaClient();

function getTokenFromRequest(request: NextRequest) {
  return request.cookies.get('token')?.value;
}

// GET: Listar todas las oficinas
export async function GET(request: NextRequest) {
  const token = getTokenFromRequest(request);
  if (!verifyAuthToken(token)) {
    return NextResponse.json({ message: 'No autorizado' }, { status: 401 });
  }
  try {
    const offices = await prisma.offices.findMany();
    
return NextResponse.json(offices);
  } catch (error) {
    return NextResponse.json({ message: 'Error al obtener oficinas' }, { status: 500 });
  }
}

// POST: Crear una nueva oficina
export async function POST(request: NextRequest) {
  const token = getTokenFromRequest(request);
  if (!verifyAuthToken(token)) {
    return NextResponse.json({ message: 'No autorizado' }, { status: 401 });
  }
  try {
    const { company_id, office_name, office_status } = await request.json();
    if (!company_id || !office_name || office_status === undefined) {
      return NextResponse.json({ message: 'Todos los campos son requeridos' }, { status: 400 });
    }
    const office = await prisma.offices.create({
      data: { company_id, office_name, office_status }
    });
    
return NextResponse.json(office);
  } catch (error) {
    return NextResponse.json({ message: 'Error al crear oficina' }, { status: 500 });
  }
}

// PUT: Editar una oficina (requiere id en el body)
export async function PUT(request: NextRequest) {
  const token = getTokenFromRequest(request);
  if (!verifyAuthToken(token)) {
    return NextResponse.json({ message: 'No autorizado' }, { status: 401 });
  }
  try {
    const { id, company_id, office_name, office_status } = await request.json();
    if (!id || !company_id || !office_name || office_status === undefined) {
      return NextResponse.json({ message: 'Todos los campos son requeridos' }, { status: 400 });
    }
    const office = await prisma.offices.update({
      where: { id },
      data: { company_id, office_name, office_status }
    });
    
return NextResponse.json(office);
  } catch (error) {
    return NextResponse.json({ message: 'Error al editar oficina' }, { status: 500 });
  }
}

// DELETE: Eliminar una oficina (requiere id en el body)
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
    await prisma.offices.delete({ where: { id } });
    
return NextResponse.json({ message: 'Oficina eliminada correctamente' });
  } catch (error) {
    return NextResponse.json({ message: 'Error al eliminar oficina' }, { status: 500 });
  }
} 