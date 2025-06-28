# Sistema de Gestión de Incidencias MX

Un sistema moderno para la gestión de incidencias desarrollado con Next.js 15, Prisma, y shadcn/ui.

## 🚀 Características

- **Autenticación segura** con bcrypt
- **Interfaz moderna** con shadcn/ui y Tailwind CSS
- **Base de datos** MySQL con Prisma ORM
- **Gestión de incidencias** y movimientos
- **Panel de control** responsive
- **Tema oscuro/claro** integrado

## 📋 Prerrequisitos

- Node.js 18+ 
- MySQL
- npm o yarn

## 🛠️ Instalación

1. **Clonar el repositorio**
   ```bash
   git clone <tu-repositorio>
   cd incidencias_mx
   ```

2. **Instalar dependencias**
   ```bash
   npm install
   ```

3. **Configurar variables de entorno**
   ```bash
   cp .env.example .env
   ```
   
   Editar `.env` con tu configuración de base de datos:
   ```env
   DATABASE_URL="mysql://usuario:contraseña@localhost:3306/incidencias_mx"
   ```

4. **Configurar la base de datos**
   ```bash
   # Generar y ejecutar migraciones
   npx prisma migrate dev
   
   # Generar cliente de Prisma
   npx prisma generate
   
   # Insertar datos de prueba
   npm run seed
   ```

5. **Ejecutar el servidor de desarrollo**
   ```bash
   npm run dev
   ```

## 🔐 Credenciales de Prueba

Después de ejecutar el seed, puedes usar estas credenciales:

- **Email:** juan.perez@ejemplo.com
- **Contraseña:** 123456

## 📁 Estructura del Proyecto

```
src/
├── app/
│   ├── api/auth/login/     # Endpoint de autenticación
│   ├── (dashboard)/        # Panel de control (con navegación)
│   ├── login/              # Página de login (sin navegación)
│   └── layout.tsx          # Layout principal
├── generated/prisma/       # Cliente de Prisma generado
└── registry/              # Componentes de shadcn/ui
```

## 🗄️ Esquema de Base de Datos

- **companies:** Empresas
- **offices:** Oficinas
- **employees:** Empleados (con autenticación por email)
- **incidents:** Tipos de incidencias
- **movements:** Registro de movimientos/incidencias

## 🎨 Tecnologías Utilizadas

- **Frontend:** Next.js 15, React 19, TypeScript
- **UI:** shadcn/ui, Tailwind CSS, Radix UI
- **Backend:** Next.js API Routes
- **Base de datos:** MySQL con Prisma ORM
- **Autenticación:** bcrypt para hash de contraseñas
- **Formularios:** React Hook Form con Zod validation

## 🚀 Scripts Disponibles

- `npm run dev` - Servidor de desarrollo
- `npm run build` - Construir para producción
- `npm run start` - Servidor de producción
- `npm run seed` - Insertar datos de prueba
- `npm run lint` - Verificar código
- `npm run format` - Formatear código

## 🔧 Desarrollo

### Agregar nuevos componentes

```bash
npx shadcn@latest add [component-name]
```

### Generar migraciones

```bash
npx prisma migrate dev --name [nombre-migracion]
```

### Actualizar cliente de Prisma

```bash
npx prisma generate
```

## 📝 Notas

- El sistema está configurado para usar MySQL como base de datos
- Las contraseñas se hashean con bcrypt antes de almacenarse
- La autenticación se realiza usando el email del empleado
- La interfaz es completamente responsive y soporta tema oscuro
- Todos los formularios incluyen validación con Zod

## 🤝 Contribuir

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT - ver el archivo [LICENSE](LICENSE) para detalles.

---

<p style="text-align: center;"> With ❤️ from 🇮🇳 </p>
