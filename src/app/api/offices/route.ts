import { NextResponse } from 'next/server';
import { PrismaClient } from '@/generated/prisma';

const prisma = new PrismaClient();

export async function GET() {
    try {
        const data = await prisma.offices.findMany();
        return NextResponse.json(data);
    } catch (error) {
        return NextResponse.json({ error: 'Error al obtener oficinas', details: error }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const data = await prisma.offices.create({ data: body });
        return NextResponse.json({ message: 'Oficina creada exitosamente', data });
    } catch (error) {
        return NextResponse.json({ error: 'Error al crear oficina', details: error }, { status: 500 });
    }
}

export async function PUT(request: Request) {
    try {
        const body = await request.json();
        const { id, ...rest } = body;
        const data = await prisma.offices.update({ where: { id }, data: rest });
        return NextResponse.json({ message: 'Oficina actualizada exitosamente', data });
    } catch (error) {
        return NextResponse.json({ error: 'Error al actualizar oficina', details: error }, { status: 500 });
    }
}

export async function DELETE(request: Request) {
    try {
        const { id } = await request.json();
        await prisma.offices.delete({ where: { id } });
        return NextResponse.json({ message: 'Oficina eliminada exitosamente' });
    } catch (error) {
        return NextResponse.json({ error: 'Error al eliminar oficina', details: error }, { status: 500 });
    }
}
