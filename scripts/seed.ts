import { PrismaClient } from '../src/generated/prisma';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando seed de la base de datos...');

  // Crear empresa
  const company = await prisma.company.create({
    data: {
      companyName: 'Telestar S.A.',
      companyStatus: 'ACTIVE',
    },
  });

  console.log('✅ Empresa creada:', company.companyName);

  // Crear oficina
  const office = await prisma.office.create({
    data: {
      companyId: company.id,
      officeName: 'Culiacan',
      officeStatus: 'ACTIVE',
    },
  });

  console.log('✅ Oficina creada:', office.officeName);

  const office1 = await prisma.office.create({
    data: {
      companyId: company.id,
      officeName: 'Durango',
      officeStatus: 'ACTIVE',
    },
  });

  console.log('✅ Oficina creada:', office1.officeName);

  const office2 = await prisma.office.create({
    data: {
      companyId: company.id,
      officeName: 'Merida',
      officeStatus: 'ACTIVE',
    },
  });

  console.log('✅ Oficina creada:', office2.officeName);

  // Crear usuario con contraseña hasheada
  const hashedPassword = await bcrypt.hash('123456', 10);

  const user = await prisma.user.create({
    data: {
      companyId: company.id,
      userName: 'System Administrator',
      userEmail: 'superadmin@localhost.dev',
      userPassword: hashedPassword,
      userStatus: 'ACTIVE',
      userRol: 'SUPER_ADMIN',
    },
  });

  console.log('✅ Usuario creado:', user.userName);

  // Asociar el usuario a la primera oficina para que el login funcione correctamente
  await prisma.userOffice.create({
    data: {
      userId: user.id,
      officeId: office.id,
    },
  });
  console.log(`✅ Usuario ${user.userName} asociado a la oficina ${office.officeName}`);

  console.log('📧 Email para login:', user.userEmail);
  console.log('🔑 Contraseña: 123456');

  // Crear empleado para movimientos
  const employee = await prisma.employee.create({
    data: {
      officeId: office.id,
      employeeCode: 1001,
      employeeName: 'Juan Pérez',
      employeeType: 'SIND',
      employeeSundayBonus: 0,
      employeeStatus: 'ACTIVE',
    },
  });

  console.log('✅ Empleado creado:', employee.employeeName);

  // Crear empleado para movimientos
  const employee01 = await prisma.employee.create({
    data: {
      officeId: office.id,
      employeeCode: 1002,
      employeeName: 'Luis Suarez',
      employeeType: 'SIND',
      employeeSundayBonus: 0,
      employeeStatus: 'ACTIVE',
    },
  });

  console.log('✅ Empleado creado:', employee01.employeeName);

  // Crear empleado para movimientos
  const employee02 = await prisma.employee.create({
    data: {
      officeId: office.id,
      employeeCode: 1003,
      employeeName: 'Manuel Garcia',
      employeeType: 'CONF',
      employeeSundayBonus: 0,
      employeeStatus: 'ACTIVE',
    },
  });

  console.log('✅ Empleado creado:', employee02.employeeName);

  // Crear algunas incidencias de ejemplo
  const incidents = await Promise.all([
    prisma.incident.create({
      data: {
        incidentCode: '005',
        incidentName: 'Descansos Trabajados',
        incidentStatus: 'ACTIVE',
      },
    }),
    prisma.incident.create({
      data: {
        incidentCode: '008',
        incidentName: 'Prima Dominical',
        incidentStatus: 'ACTIVE',
      },
    }),
    prisma.incident.create({
      data: {
        incidentCode: '009',
        incidentName: 'Dias Devueltos',
        incidentStatus: 'ACTIVE',
      },
    }),
    prisma.incident.create({
      data: {
        incidentCode: '215',
        incidentName: 'Faltas',
        incidentStatus: 'ACTIVE',
      },
    }),
  ]);

  console.log('✅ Incidencias creadas:', incidents.length);

  console.log('🎉 Seed completado exitosamente!');
  console.log('\n📋 Credenciales para probar el login:');
  console.log(`   Email: ${user.userEmail}`);
  console.log('   Contraseña: 123456');
}

async function runSeed() {
  try {
    await main();
  } catch (e) {
    console.error('❌ Error durante el seed:', e);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

runSeed();