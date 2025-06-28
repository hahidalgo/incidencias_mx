import { NextResponse } from 'next/server';
import { PrismaClient } from '@/generated/prisma';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { employee_code, password } = body;

        // 1. Validar que los campos necesarios fueron enviados
        if (!employee_code || !password) {
            return NextResponse.json({ error: 'El código de empleado y la contraseña son requeridos' }, { status: 400 });
        }

        // 2. Convertir y validar que employee_code es un número entero
        const employeeCodeInt = parseInt(employee_code, 10);
        if (isNaN(employeeCodeInt)) {
            return NextResponse.json({ error: 'El código de empleado debe ser un número válido' }, { status: 400 });
        }

        // 3. Buscar al usuario en la base de datos con el código numérico
        const user = await prisma.employees.findFirst({ where: { employee_code: employeeCodeInt } });
        console.log('Usuario encontrado:', user);
        if (!user) {
            return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 });
        }
        const valid = await bcrypt.compare(password, user.password);
        if (!valid) {
            return NextResponse.json({ error: 'Contraseña incorrecta' }, { status: 401 });
        }
        const { password: _, ...userWithoutPassword } = user;
        return NextResponse.json({ message: 'Autenticación exitosa', user: userWithoutPassword });
    } catch (error) {
        console.error("Error en la autenticación:", error); // Loguear el error real en el servidor
        return NextResponse.json({ error: 'Ocurrió un error interno en el servidor' }, { status: 500 });
    }
}
