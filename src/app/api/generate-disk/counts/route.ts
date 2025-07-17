import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/prisma/client';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const ids = (searchParams.get('ids') || '').split(',').filter(Boolean);
  if (!ids.length) {
    return NextResponse.json({ counts: {} });
  }
  try {
    const counts = await prisma.movement.groupBy({
      by: ['periodId'],
      where: {
        periodId: { in: ids },
        incidenceStatus: 'ACTIVE',
      },
      _count: { id: true },
    });
    const result: Record<string, number> = {};
    counts.forEach((c) => {
      result[c.periodId] = c._count.id;
    });
    // Asegura que todos los periodos estén presentes aunque tengan 0
    ids.forEach((id) => {
      if (!(id in result)) result[id] = 0;
    });
    
    return NextResponse.json({ counts: result });
  } catch (e) {
    return NextResponse.json({ counts: {} }, { status: 500 });
  }
} 