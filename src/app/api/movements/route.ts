import { NextResponse } from 'next/server';
import { PrismaClient } from '@/generated/prisma';

const prisma = new PrismaClient();

export async function GET() {
    try {
        const data = await prisma.movements.findMany();
        return NextResponse.json(data);
    } catch (error) {
        return NextResponse.json({ error: 'Error al obtener movimientos', details: error }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const data = await prisma.movements.create({ data: body });
        return NextResponse.json({ message: 'Movimiento creado exitosamente', data });
    } catch (error) {
        return NextResponse.json({ error: 'Error al crear movimiento', details: error }, { status: 500 });
    }
}

export async function PUT(request: Request) {
    try {
        const body = await request.json();
        const { id, ...rest } = body;
        const data = await prisma.movements.update({ where: { id }, data: rest });
        return NextResponse.json({ message: 'Movimiento actualizado exitosamente', data });
    } catch (error) {
        return NextResponse.json({ error: 'Error al actualizar movimiento', details: error }, { status: 500 });
    }
}

export async function DELETE(request: Request) {
    try {
        const { id } = await request.json();
        await prisma.movements.delete({ where: { id } });
        return NextResponse.json({ message: 'Movimiento eliminado exitosamente' });
    } catch (error) {
        return NextResponse.json({ error: 'Error al eliminar movimiento', details: error }, { status: 500 });
    }
}
