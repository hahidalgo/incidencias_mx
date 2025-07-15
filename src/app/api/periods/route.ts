import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@/generated/prisma';

const prisma = new PrismaClient();

// GET: Listar periodos con paginación y búsqueda
export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1', 10);
    const pageSize = parseInt(searchParams.get('pageSize') || '10', 10);
    const search = searchParams.get('search') || '';

    const where = search
        ? { periodName: { contains: search, mode: 'insensitive' as const } }
        : {};

    try {
        const [periods, total] = await Promise.all([
            prisma.period.findMany({
                where,
                skip: (page - 1) * pageSize,
                take: pageSize,
                orderBy: { createdAt: 'desc' },
            }),
            prisma.period.count({ where }),
        ]);

        return NextResponse.json({
            periods,
            total,
            page,
            pageSize,
            totalPages: Math.ceil(total / pageSize),
        });
    } catch (error) {
        return NextResponse.json({ message: 'Error al obtener periodos' }, { status: 500 });
    }
}

// POST: Crear un nuevo periodo
export async function POST(request: NextRequest) {
    try {
        const { period_name, period_start, period_end, period_status } = await request.json();
        if (!period_name || !period_start || !period_end || period_status === undefined) {
            return NextResponse.json({ message: 'Todos los campos son requeridos' }, { status: 400 });
        }
        const period = await prisma.period.create({
            data: {
                periodName: period_name,
                periodStart: new Date(period_start),
                periodEnd: new Date(period_end),
                periodStatus: period_status,
            },
        });

        return NextResponse.json(period, { status: 201 });
    } catch (error) {
        return NextResponse.json({ message: 'Error al crear periodo' }, { status: 500 });
    }
}

// PUT: Editar un periodo (requiere id en el body)
export async function PUT(request: NextRequest) {
    try {
        const { id, period_name, period_start, period_end, period_status } = await request.json();
        if (!id || !period_name || !period_start || !period_end || period_status === undefined) {
            return NextResponse.json({ message: 'Todos los campos son requeridos' }, { status: 400 });
        }
        const period = await prisma.period.update({
            where: { id },
            data: {
                periodName: period_name,
                periodStart: new Date(period_start),
                periodEnd: new Date(period_end),
                periodStatus: period_status,
            },
        });

        return NextResponse.json(period);
    } catch (error) {
        return NextResponse.json({ message: 'Error al editar periodo' }, { status: 500 });
    }
}

// DELETE: Eliminar un periodo (requiere id en el body)
export async function DELETE(request: NextRequest) {
    try {
        const { id } = await request.json();
        if (!id) {
            return NextResponse.json({ message: 'El id es requerido' }, { status: 400 });
        }
        await prisma.period.delete({ where: { id } });

        return NextResponse.json({ message: 'Periodo eliminado correctamente' });
    } catch (error) {
        return NextResponse.json({ message: 'Error al eliminar periodo' }, { status: 500 });
    }
}

// Nuevo endpoint para obtener el periodo actual
export async function GET_CURRENT(request: NextRequest) {
    try {
        const now = new Date();
        const period = await prisma.period.findFirst({
            where: {
                periodStart: { lte: now },
                periodEnd: { gte: now },
                periodStatus: 'ACTIVE',
            },
            orderBy: { periodStart: 'desc' },
        });
        if (!period) {
            return NextResponse.json({ message: 'No hay periodo actual' }, { status: 404 });
        }

        return NextResponse.json(period);
    } catch (error) {
        return NextResponse.json({ message: 'Error al obtener el periodo actual' }, { status: 500 });
    }
} 