import { NextResponse } from 'next/server';
import { PrismaClient } from '@/generated/prisma';

const prisma = new PrismaClient();

export async function GET() {
    try {
        const data = await prisma.incidents.findMany();
        return NextResponse.json(data);
    } catch (error) {
        return NextResponse.json({ error: 'Error al obtener incidentes', details: error }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const data = await prisma.incidents.create({ data: body });
        return NextResponse.json({ message: 'Incidente creado exitosamente', data });
    } catch (error) {
        return NextResponse.json({ error: 'Error al crear incidente', details: error }, { status: 500 });
    }
}

export async function PUT(request: Request) {
    try {
        const body = await request.json();
        const { id, ...rest } = body;
        const data = await prisma.incidents.update({ where: { id }, data: rest });
        return NextResponse.json({ message: 'Incidente actualizado exitosamente', data });
    } catch (error) {
        return NextResponse.json({ error: 'Error al actualizar incidente', details: error }, { status: 500 });
    }
}

export async function DELETE(request: Request) {
    try {
        const { id } = await request.json();
        await prisma.incidents.delete({ where: { id } });
        return NextResponse.json({ message: 'Incidente eliminado exitosamente' });
    } catch (error) {
        return NextResponse.json({ error: 'Error al eliminar incidente', details: error }, { status: 500 });
    }
}
