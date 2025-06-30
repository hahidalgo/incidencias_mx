import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@/generated/prisma';
import { verifyAuthToken } from '@/lib/auth';

const prisma = new PrismaClient();

function getTokenFromRequest(request: NextRequest) {
  return request.cookies.get('token')?.value;
}

// GET: Listar todos los empleados
export async function GET(request: NextRequest) {
  const token = getTokenFromRequest(request);
  if (!verifyAuthToken(token)) {
    return NextResponse.json({ message: 'No autorizado' }, { status: 401 });
  }
  try {
    const employees = await prisma.employees.findMany();
    return NextResponse.json(employees);
  } catch (error) {
    return NextResponse.json({ message: 'Error al obtener empleados' }, { status: 500 });
  }
}

// POST: Crear un nuevo empleado
export async function POST(request: NextRequest) {
  const token = getTokenFromRequest(request);
  if (!verifyAuthToken(token)) {
    return NextResponse.json({ message: 'No autorizado' }, { status: 401 });
  }
  try {
    const { office_id, employee_code, employee_name, employee_type, employee_status } = await request.json();
    if (!office_id || !employee_code || !employee_name || !employee_type || employee_status === undefined) {
      return NextResponse.json({ message: 'Todos los campos son requeridos' }, { status: 400 });
    }
    const employee = await prisma.employees.create({
      data: {
        office_id,
        employee_code,
        employee_name,
        employee_type,
        employee_status
      }
    });
    return NextResponse.json(employee);
  } catch (error) {
    return NextResponse.json({ message: 'Error al crear empleado' }, { status: 500 });
  }
}

// PUT: Actualizar un empleado (requiere id en el body)
export async function PUT(request: NextRequest) {
  const token = getTokenFromRequest(request);
  if (!verifyAuthToken(token)) {
    return NextResponse.json({ message: 'No autorizado' }, { status: 401 });
  }
  try {
    const { id, office_id, employee_code, employee_name, employee_type, employee_status } = await request.json();
    if (!id || !office_id || !employee_code || !employee_name || !employee_type || employee_status === undefined) {
      return NextResponse.json({ message: 'Todos los campos son requeridos' }, { status: 400 });
    }
    const employee = await prisma.employees.update({
      where: { id },
      data: {
        office_id,
        employee_code,
        employee_name,
        employee_type,
        employee_status
      }
    });
    return NextResponse.json(employee);
  } catch (error) {
    return NextResponse.json({ message: 'Error al actualizar empleado' }, { status: 500 });
  }
}

// DELETE: Eliminar un empleado (requiere id en el body)
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
    await prisma.employees.delete({ where: { id } });
    return NextResponse.json({ message: 'Empleado eliminado correctamente' });
  } catch (error) {
    return NextResponse.json({ message: 'Error al eliminar empleado' }, { status: 500 });
  }
} 