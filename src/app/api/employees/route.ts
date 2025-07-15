import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@/generated/prisma';
import { verifyAuthToken } from '@/lib/auth';

const prisma = new PrismaClient();

function getTokenFromRequest(request: NextRequest) {
  return request.cookies.get('token')?.value;
}

// GET: Listar todos los empleados con paginación y búsqueda
export async function GET(request: NextRequest) {
  const token = getTokenFromRequest(request);
  if (!verifyAuthToken(token)) {
    return NextResponse.json({ message: 'No autorizado' }, { status: 401 });
  }

  const { searchParams } = request.nextUrl;
  const page = parseInt(searchParams.get('page') || '1', 10);
  const pageSize = parseInt(searchParams.get('pageSize') || '10', 10);
  const search = searchParams.get('search') || '';
  const officeId = searchParams.get('officeId'); // Nuevo parámetro

  const skip = (page - 1) * pageSize;

  try {
    const whereClause = {
      ...(search
        ? {
          OR: [
            { employeeName: { contains: search, mode: 'insensitive' as const } },
            { employeeType: { contains: search, mode: 'insensitive' as const } },
          ],
        }
        : {}),
      ...(officeId ? { officeId } : {}), // Cambiado a string
    };

    const [employees, total] = await prisma.$transaction([
      prisma.employee.findMany({
        where: whereClause,
        include: {
          office: { select: { officeName: true } },
        },
        skip,
        take: pageSize,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.employee.count({ where: whereClause }),
    ]);

    return NextResponse.json({ employees, total, totalPages: Math.ceil(total / pageSize) });
  } catch (error) {
    console.log(error);

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
    const employee = await prisma.employee.create({
      data: {
        officeId: office_id,
        employeeCode: employee_code,
        employeeName: employee_name,
        employeeType: employee_type,
        employeeSundayBonus: 0, // Valor por defecto
        employeeStatus: employee_status
      },
      include: { office: { select: { officeName: true } } }
    });

    return NextResponse.json(employee);
  } catch (error) {
    return NextResponse.json({ message: 'Error al crear empleado' }, { status: 500 });
  }
}

// PUT: Editar un empleado (requiere id en el body)
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
    const employee = await prisma.employee.update({
      where: { id },
      data: {
        officeId: office_id,
        employeeCode: employee_code,
        employeeName: employee_name,
        employeeType: employee_type,
        employeeSundayBonus: 0, // Valor por defecto
        employeeStatus: employee_status
      },
      include: { office: { select: { officeName: true } } }
    });

    return NextResponse.json(employee);
  } catch (error) {
    return NextResponse.json({ message: 'Error al editar empleado' }, { status: 500 });
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
    await prisma.employee.delete({ where: { id } });

    return NextResponse.json({ message: 'Empleado eliminado correctamente' });
  } catch (error) {
    return NextResponse.json({ message: 'Error al eliminar empleado' }, { status: 500 });
  }
} 