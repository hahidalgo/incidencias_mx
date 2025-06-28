import { PrismaClient } from '../src/generated/prisma';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando seed de la base de datos...');

  // Crear empresa
  const company = await prisma.companies.create({
    data: {
      company_name: 'Empresa Ejemplo S.A.',
      company_status: 1,
    },
  });

  console.log('✅ Empresa creada:', company.company_name);

  // Crear oficina
  const office = await prisma.offices.create({
    data: {
      company_id: company.id,
      office_name: 'Telestar Culiacan',
      office_status: 1,
    },
  });

  console.log('✅ Oficina creada:', office.office_name);

  // Crear usuario con contraseña hasheada
  const hashedPassword = await bcrypt.hash('123456', 10);
  
  const user = await prisma.users.create({
    data: {
      company_id: company.id,
      office_id: office.id,
      user_name: 'Juan Pérez',
      user_email: 'juan.perez@ejemplo.com',
      user_password: hashedPassword,
      user_status: 1,
      user_rol: 1,
    },
  });

  console.log('✅ Usuario creado:', user.user_name);
  console.log('📧 Email para login:', user.user_email);
  console.log('🔑 Contraseña: 123456');

  // Crear empleado para movimientos
  const employee = await prisma.employees.create({
    data: {
      office_id: office.id,
      employee_code: 1001,
      employee_name: 'Juan Pérez',
      employee_type: 'Empleado',
      employee_status: 1,
    },
  });

  console.log('✅ Empleado creado:', employee.employee_name);

  // Crear algunas incidencias de ejemplo
  const incidents = await Promise.all([
    prisma.incidents.create({
      data: {
        incident_code: 'INC001',
        incident_name: 'Falla en el sistema',
        incident_status: 1,
      },
    }),
    prisma.incidents.create({
      data: {
        incident_code: 'INC002',
        incident_name: 'Problema de conectividad',
        incident_status: 1,
      },
    }),
    prisma.incidents.create({
      data: {
        incident_code: 'INC003',
        incident_name: 'Error en la aplicación',
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
  console.log('   Email: juan.perez@ejemplo.com');
  console.log('   Contraseña: 123456');
}

main()
  .catch((e) => {
    console.error('❌ Error durante el seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 