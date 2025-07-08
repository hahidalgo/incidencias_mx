import { PrismaClient } from '../src/generated/prisma';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando seed de la base de datos...');

  // Crear empresa
  const company = await prisma.companies.create({
    data: {
      company_name: 'Telestar S.A.',
      company_status: 1,
    },
  });

  console.log('✅ Empresa creada:', company.company_name);

  // Crear oficina
  const office = await prisma.offices.create({
    data: {
      company_id: company.id,
      office_name: 'Culiacan',
      office_status: 1,
    },
  });

  console.log('✅ Oficina creada:', office.office_name);

  const office1= await prisma.offices.create({
    data: {
      company_id: company.id,
      office_name: 'Durango',
      office_status: 1,
    },
  });

  console.log('✅ Oficina creada:', office1.office_name);

  const office2 = await prisma.offices.create({
    data: {
      company_id: company.id,
      office_name: 'Merida',
      office_status: 1,
    },
  });

  console.log('✅ Oficina creada:', office2.office_name);

  // Crear usuario con contraseña hasheada
  const hashedPassword = await bcrypt.hash('123456', 10);
  
  const user = await prisma.users.create({
    data: {
      company_id: company.id,
      user_name: 'System Administrator',
      user_email: 'superadmin@localhost.dev',
      user_password: hashedPassword,
      user_status: 1,
      user_rol: 101,
    },
  });

  console.log('✅ Usuario creado:', user.user_name);

  // Asociar el usuario a la primera oficina para que el login funcione correctamente
  await prisma.user_offices.create({
    data: {
      user_id: user.id,
      office_id: office.id,
    },
  });
  console.log(`✅ Usuario ${user.user_name} asociado a la oficina ${office.office_name}`);

  console.log('📧 Email para login:', user.user_email);
  console.log('🔑 Contraseña: 123456');

  // Crear empleado para movimientos
  const employee = await prisma.employees.create({
    data: {
      office_id: office.id,
      employee_code: 1001,
      employee_name: 'Juan Pérez',
      employee_type: 'SIND',
      employee_bonus_dom: 0,
      employee_status: 1,
    },
  });

  console.log('✅ Empleado creado:', employee.employee_name);

  // Crear empleado para movimientos
  const employee01= await prisma.employees.create({
    data: {
      office_id: office.id,
      employee_code: 1002,
      employee_name: 'Luis Suarez',
      employee_type: 'SIND',
      employee_bonus_dom: 0,
      employee_status: 1,
    },
  });

  console.log('✅ Empleado creado:', employee01.employee_name);

  // Crear empleado para movimientos
  const employee02 = await prisma.employees.create({
    data: {
      office_id: office.id,
      employee_code: 1003,
      employee_name: 'Manuel Garcia',
      employee_type: 'CONF',
      employee_bonus_dom: 0,
      employee_status: 1,
    },
  });

  console.log('✅ Empleado creado:', employee02.employee_name);

  // Crear algunas incidencias de ejemplo
  const incidents = await Promise.all([
    prisma.incidents.create({
      data: {
        incident_code: '005',
        incident_name: 'Descansos Trabajados',
        incident_status: 1,
      },
    }),
    prisma.incidents.create({
      data: {
        incident_code: '008',
        incident_name: 'Prima Dominical',
        incident_status: 1,
      },
    }),
    prisma.incidents.create({
      data: {
        incident_code: '009',
        incident_name: 'Dias Devueltos',
        incident_status: 1,
      },
    }),
    prisma.incidents.create({
      data: {
        incident_code: '215',
        incident_name: 'Faltas',
        incident_status: 1,
      },
    }),
  ]);

  console.log('✅ Incidencias creadas:', incidents.length);

  // Crear algunos movimientos de ejemplo
  const movements = await Promise.all([
    prisma.movements.create({
      data: {
        employee_code: employee.employee_code,
        incident_code: incidents[0].incident_code,
        incidence_date: new Date(),
        incidence_observation: 'Se reportó una falla en el sistema principal',
        incidence_status: 1,
      },
    }),
    prisma.movements.create({
      data: {
        employee_code: employee.employee_code,
        incident_code: incidents[1].incident_code,
        incidence_date: new Date(),
        incidence_observation: 'Problemas de conectividad en la red',
        incidence_status: 1,
      },
    }),
  ]);

  console.log('✅ Movimientos creados:', movements.length);

  console.log('🎉 Seed completado exitosamente!');
  console.log('\n📋 Credenciales para probar el login:');
  console.log(`   Email: ${user.user_email}`);
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