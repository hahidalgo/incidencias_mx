import { NextResponse } from 'next/server';
import { PrismaClient } from '@/generated/prisma';

const prisma = new PrismaClient();

export async function GET() {
    try {
        const data = await prisma.employees.findMany();
        return NextResponse.json(data);
    } catch (error) {
        return NextResponse.json({ error: 'Error al obtener empleados', details: error }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const data = await prisma.employees.create({ data: body });
        return NextResponse.json({ message: 'Empleado creado exitosamente', data });
    } catch (error) {
        return NextResponse.json({ error: 'Error al crear empleado', details: error }, { status: 500 });
    }
}

export async function PUT(request: Request) {
    try {
        const body = await request.json();
        const { id, ...rest } = body;
        const data = await prisma.employees.update({ where: { id }, data: rest });
        return NextResponse.json({ message: 'Empleado actualizado exitosamente', data });
    } catch (error) {
        return NextResponse.json({ error: 'Error al actualizar empleado', details: error }, { status: 500 });
    }
}

export async function DELETE(request: Request) {
    try {
        const { id } = await request.json();
        await prisma.employees.delete({ where: { id } });
        return NextResponse.json({ message: 'Empleado eliminado exitosamente' });
    } catch (error) {
        return NextResponse.json({ error: 'Error al eliminar empleado', details: error }, { status: 500 });
    }
}
