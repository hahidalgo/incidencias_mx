import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@/generated/prisma';
import { verifyAuthToken } from '@/lib/auth';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();

function getTokenFromRequest(request: NextRequest) {
  return request.cookies.get('token')?.value;
}

/**
 * Obtiene las oficinas del usuario logueado
 */
async function getUserOffices(userId: string) {
    const userOffices = await prisma.userOffice.findMany({
        where: { userId },
        include: {
            office: {
                select: { id: true, officeName: true }
            }
        }
    });
    
    return userOffices.map(uo => uo.office.id);
}

// GET: Listar todos los empleados con paginación y búsqueda
// Solo devuelve empleados de las oficinas del usuario logueado
export async function GET(request: NextRequest) {
  try {
    // Obtener el token del usuario logueado
    const token = getTokenFromRequest(request);
    if (!token) {
      return NextResponse.json({ message: 'No autenticado' }, { status: 401 });
    }

    // Verificar el token y obtener el ID del usuario
    const payload = jwt.verify(token, process.env.JWT_SECRET!) as { id?: string, userEmail?: string };
    if (!payload.id && !payload.userEmail) {
      return NextResponse.json({ message: 'Token inválido' }, { status: 401 });
    }

    // Obtener el usuario y sus oficinas
    let user = null;
    if (payload.id) {
      user = await prisma.user.findUnique({
        where: { id: payload.id },
        select: { id: true, userRol: true }
      });
    } else {
      user = await prisma.user.findUnique({
        where: { userEmail: payload.userEmail! },
        select: { id: true, userRol: true }
      });
    }

    if (!user) {
      return NextResponse.json({ message: 'Usuario no encontrado' }, { status: 404 });
    }

    // Si es SUPER_ADMIN, puede ver todos los empleados
    let userOfficeIds: string[] = [];
    if (user.userRol !== 'SUPER_ADMIN') {
      userOfficeIds = await getUserOffices(user.id);
      if (userOfficeIds.length === 0) {
        return NextResponse.json(
          { message: 'No tienes oficinas asignadas' },
          { status: 403 }
        );
      }
    }

    const { searchParams } = request.nextUrl;
    const page = parseInt(searchParams.get('page') || '1', 10);
    const pageSize = parseInt(searchParams.get('pageSize') || '10', 10);
    const search = searchParams.get('search') || '';
    const officeId = searchParams.get('officeId');

    const skip = (page - 1) * pageSize;

    const whereClause: any = {
      ...(search
        ? {
          OR: [
            { employeeName: { contains: search, mode: 'insensitive' as const } },
            { employeeType: { contains: search, mode: 'insensitive' as const } },
          ],
        }
        : {}),
      ...(officeId ? { officeId } : {}),
    };

    // Filtrar por oficinas del usuario (excepto para SUPER_ADMIN)
    if (user.userRol !== 'SUPER_ADMIN') {
      whereClause.officeId = { in: userOfficeIds };
    }

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
    console.error('Error al obtener empleados:', error);
    
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
