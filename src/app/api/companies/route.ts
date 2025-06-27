import { NextResponse } from 'next/server';
import { PrismaClient } from '@/generated/prisma';

const prisma = new PrismaClient();

export async function GET() {
    try {
        const data = await prisma.companies.findMany();
        return NextResponse.json(data);
    } catch (error) {
        return NextResponse.json({ error: 'Error al obtener compañías', details: error }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const data = await prisma.companies.create({ data: body });
        return NextResponse.json({ message: 'Compañía creada exitosamente', data });
    } catch (error) {
        return NextResponse.json({ error: 'Error al crear compañía', details: error }, { status: 500 });
    }
}

export async function PUT(request: Request) {
    try {
        const body = await request.json();
        const { id, ...rest } = body;
        const data = await prisma.companies.update({ where: { id }, data: rest });
        return NextResponse.json({ message: 'Compañía actualizada exitosamente', data });
    } catch (error) {
        return NextResponse.json({ error: 'Error al actualizar compañía', details: error }, { status: 500 });
    }
}

export async function DELETE(request: Request) {
    try {
        const { id } = await request.json();
        await prisma.companies.delete({ where: { id } });
        return NextResponse.json({ message: 'Compañía eliminada exitosamente' });
    } catch (error) {
        return NextResponse.json({ error: 'Error al eliminar compañía', details: error }, { status: 500 });
    }
}
