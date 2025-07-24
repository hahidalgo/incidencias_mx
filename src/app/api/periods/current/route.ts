import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@/generated/prisma';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
    try {
        const now = new Date();
        const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0);
        const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);

        const period = await prisma.period.findFirst({
            where: {
                periodStart: { lte: endOfDay },
                periodEnd: { gte: startOfDay },
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