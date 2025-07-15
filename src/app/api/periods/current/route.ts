import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@/generated/prisma';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
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