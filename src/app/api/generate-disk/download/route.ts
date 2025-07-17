import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/prisma/client';

function toCsv(rows: Array<{periodName: string, employeeCode: number, incidentCode: string}>): string {
  const header = 'nombre_periodo,codigo_empleado,codigo_incidencia';
  const data = rows.map(r => `${r.periodName},${r.employeeCode},${r.incidentCode}`).join('\n');
  return `${header}\n${data}`;
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const periodId = searchParams.get('periodId');
  if (!periodId) {
    return NextResponse.json({ message: 'Falta el parámetro periodId' }, { status: 400 });
  }
  try {
    const period = await prisma.period.findUnique({ where: { id: periodId } });
    if (!period) {
      return NextResponse.json({ message: 'Periodo no encontrado' }, { status: 404 });
    }
    const movimientos = await prisma.movement.findMany({
      where: { periodId, incidenceStatus: 'ACTIVE' },
      include: {
        employee: true,
        incident: true,
      },
    });
    const rows = movimientos.map(m => ({
      periodName: period.periodName,
      employeeCode: m.employee.employeeCode,
      incidentCode: m.incident.incidentCode,
    }));
    const csv = toCsv(rows);
    return new NextResponse(csv, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="periodo_${period.periodName}.csv"`,
      },
    });
  } catch (e) {
    return NextResponse.json({ message: 'Error generando el archivo' }, { status: 500 });
  }
} 