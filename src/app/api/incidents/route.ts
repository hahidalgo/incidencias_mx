import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@/generated/prisma';
import { verifyAuthToken } from '@/lib/auth';

const prisma = new PrismaClient();

function getTokenFromRequest(request: NextRequest) {
  return request.cookies.get('token')?.value;
}

// GET: Listar todos los incidentes
export async function GET(request: NextRequest) {
  const token = getTokenFromRequest(request);
  if (!verifyAuthToken(token)) {
    return NextResponse.json({ message: 'No autorizado' }, { status: 401 });
  }
  try {
    const incidents = await prisma.incidents.findMany();
    
return NextResponse.json(incidents);
  } catch (error) {
    return NextResponse.json({ message: 'Error al obtener incidentes' }, { status: 500 });
  }
}

// POST: Crear un nuevo incidente
export async function POST(request: NextRequest) {
  const token = getTokenFromRequest(request);
  if (!verifyAuthToken(token)) {
    return NextResponse.json({ message: 'No autorizado' }, { status: 401 });
  }
  try {
    const { incident_code, incident_name, incident_status } = await request.json();
    if (!incident_code || !incident_name || incident_status === undefined) {
      return NextResponse.json({ message: 'Todos los campos son requeridos' }, { status: 400 });
    }
    const incident = await prisma.incidents.create({
      data: {
        incident_code,
        incident_name,
        incident_status
      }
    });
    
return NextResponse.json(incident);
  } catch (error) {
    return NextResponse.json({ message: 'Error al crear incidente' }, { status: 500 });
  }
}

// PUT: Actualizar un incidente (requiere id en el body)
export async function PUT(request: NextRequest) {
  const token = getTokenFromRequest(request);
  if (!verifyAuthToken(token)) {
    return NextResponse.json({ message: 'No autorizado' }, { status: 401 });
  }
  try {
    const { id, incident_code, incident_name, incident_status } = await request.json();
    if (!id || !incident_code || !incident_name || incident_status === undefined) {
      return NextResponse.json({ message: 'Todos los campos son requeridos' }, { status: 400 });
    }
    const incident = await prisma.incidents.update({
      where: { id },
      data: {
        incident_code,
        incident_name,
        incident_status
      }
    });
    
return NextResponse.json(incident);
  } catch (error) {
    return NextResponse.json({ message: 'Error al actualizar incidente' }, { status: 500 });
  }
}

// DELETE: Eliminar un incidente (requiere id en el body)
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
    await prisma.incidents.delete({ where: { id } });
    
return NextResponse.json({ message: 'Incidente eliminado correctamente' });
  } catch (error) {
    return NextResponse.json({ message: 'Error al eliminar incidente' }, { status: 500 });
  }
} 