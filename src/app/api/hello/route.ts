import { NextResponse } from 'next/server';

export async function GET() {
    return NextResponse.json({ message: '¡Hola desde la API de Next.js!' });
}
