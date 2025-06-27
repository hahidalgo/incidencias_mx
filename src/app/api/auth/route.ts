import { NextResponse } from 'next/server';
import { PrismaClient } from '@/generated/prisma';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

export async function POST(request: Request) {
    try {
        const { employee_code, password } = await request.json();
        // Cambiado a findFirst para buscar por employee_code
        const user = await prisma.employees.findFirst({ where: { employee_code } });
        if (!user) {
            return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 });
        }
        // user no puede ser null aquí
        const valid = await bcrypt.compare(password, user!.password);
        if (!valid) {
            return NextResponse.json({ error: 'Contraseña incorrecta' }, { status: 401 });
        }
        // Puedes agregar aquí la generación de un token JWT si lo necesitas
        return NextResponse.json({ message: 'Autenticación exitosa', user });
    } catch (error) {
        return NextResponse.json({ error: 'Error en la autenticación', details: error }, { status: 500 });
    }
}
