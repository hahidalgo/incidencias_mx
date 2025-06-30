# Sistema de Gestión de Incidencias MX

Un sistema moderno para la gestión de incidencias desarrollado con Next.js 15, Prisma, y shadcn/ui.

## 🚀 Características

- **Autenticación segura** con JWT y cookies httpOnly
- **Manejo de sesiones** propio (no NextAuth)
- **Interfaz moderna** con shadcn/ui, Tailwind CSS y Lucide React para íconos
- **Base de datos** MySQL con Prisma ORM
- **Gestión de incidencias** y movimientos
- **Panel de control** responsive
- **Tema oscuro/claro** integrado
- **Preparado para Docker**

## 📋 Prerrequisitos

- Node.js 18+ 
- MySQL
- npm o yarn
- (Opcional) Docker

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
   
   Crea un archivo `.env.local` en la raíz del proyecto y agrega:
   ```env
   DATABASE_URL="mysql://usuario:contraseña@localhost:3306/incidencias_mx"
   JWT_SECRET=tu_valor_secreto_unico_y_largo
   ```
   > Puedes generar un valor seguro para JWT_SECRET con: `openssl rand -hex 64`

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

6. **(Opcional) Usar Docker**
   ```bash
   docker build -t incidencias-mx .
   docker run -p 3000:3000 --env-file .env.local incidencias-mx
   ```

## 🔐 Credenciales de Prueba

Después de ejecutar el seed, puedes usar estas credenciales:

- **Email:** juan.perez@ejemplo.com
- **Contraseña:** 123456

## 📁 Estructura del Proyecto

```
src/
├── app/
│   ├── api/auth/login/     # Endpoint de login (POST)
│   ├── api/auth/logout/    # Endpoint de logout (POST)
│   ├── api/auth/me/        # Endpoint para obtener usuario autenticado (GET)
│   ├── (dashboard)/        # Panel de control (con navegación)
│   ├── login/              # Página de login (sin navegación)
│   └── layout.tsx          # Layout principal
├── components/             # Componentes reutilizables y de UI
├── prisma/                 # Esquema y migraciones de base de datos
├── public/                 # Recursos estáticos
└── registry/               # Componentes de shadcn/ui
```

## 🗄️ Esquema de Base de Datos

- **companies:** Empresas
- **offices:** Oficinas
- **employees:** Empleados (con autenticación por email)
- **incidents:** Tipos de incidencias
- **movements:** Registro de movimientos/incidencias

## 🎨 Tecnologías Utilizadas

- **Frontend:** Next.js 15, React 19, TypeScript
- **UI:** shadcn/ui, Tailwind CSS, Radix UI, Lucide React
- **Backend:** Next.js API Routes
- **Base de datos:** MySQL con Prisma ORM
- **Autenticación:** JWT y cookies httpOnly, bcrypt para hash de contraseñas
- **Formularios:** React Hook Form con Zod validation

## 🔐 Autenticación y Manejo de Sesión

- El login se realiza vía `/api/auth/login` (POST), que valida credenciales y genera un JWT guardado en una cookie httpOnly.
- El usuario autenticado se obtiene consultando `/api/auth/me` (GET), que lee y valida el JWT.
- El logout se realiza vía `/api/auth/logout` (POST), que elimina la cookie de sesión.
- El dashboard y la barra de navegación muestran el usuario activo y permiten cerrar sesión.
- Las rutas protegidas verifican la sesión y redirigen a `/login` si no hay usuario autenticado.

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
- La autenticación se realiza usando JWT y cookies httpOnly
- La interfaz es completamente responsive y soporta tema oscuro
- Todos los formularios incluyen validación con Zod
- El proyecto está preparado para ejecutarse en Docker

## 🤝 Como Contribuir

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT - ver el archivo [LICENSE](LICENSE) para detalles.

---
<p align="center">
  <img src="assets/logo-soaint-azul.png" alt="Logo del Proyecto">
</p>

## 📚 Ejemplos de Uso de la API

### 1. Login

**Request:**
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "juan.perez@ejemplo.com",
  "password": "123456"
}
```
**Respuesta exitosa:**
```json
{
  "message": "Login exitoso",
  "user": {
    "id": 1,
    "name": "Juan Pérez",
    "email": "juan.perez@ejemplo.com",
    "role": "empleado",
    "companyId": 1,
    "officeId": 1
  }
}
```
> El JWT se almacena automáticamente en una cookie httpOnly.

### 2. Obtener usuario autenticado

**Request:**
```http
GET /api/auth/me
```
**Respuesta exitosa:**
```json
{
  "user": {
    "id": 1,
    "name": "Juan Pérez",
    "email": "juan.perez@ejemplo.com",
    "role": "empleado",
    "companyId": 1,
    "officeId": 1
  }
}
```

### 3. Logout

**Request:**
```http
POST /api/auth/logout
```
**Respuesta:**
```json
{
  "message": "Logout exitoso"
}
```
> El JWT se elimina de la cookie y la sesión se cierra.

---

## 🔄 Diagrama de Flujo de Autenticación

```mermaid
graph TD;
  A[Usuario ingresa credenciales en /login] --> B[POST /api/auth/login];
  B -->|Credenciales válidas| C[Backend genera JWT y lo guarda en cookie httpOnly];
  C --> D[Redirección a /dashboard];
  D --> E[Frontend consulta /api/auth/me];
  E -->|JWT válido| F[Renderiza usuario y contenido];
  E -->|JWT inválido o ausente| G[Redirige a /login];
  F --> H[Usuario navega por la app];
  H --> I[Usuario hace logout];
  I --> J[POST /api/auth/logout];
  J --> K[Cookie eliminada, redirección a /login];
```

---

## 📑 Documentación de Endpoints de Autenticación

### POST `/api/auth/login`
- **Descripción:** Inicia sesión, valida credenciales y crea una cookie de sesión.
- **Body:**
  - `email` (string, requerido)
  - `password` (string, requerido)
- **Respuesta:**
  - 200: `{ message, user }`
  - 400/401: `{ message }`

### GET `/api/auth/me`
- **Descripción:** Devuelve el usuario autenticado si el JWT es válido.
- **Respuesta:**
  - 200: `{ user }`
  - 401: `{ message }`

### POST `/api/auth/logout`
- **Descripción:** Cierra la sesión eliminando la cookie del JWT.
- **Respuesta:**
  - 200: `{ message }`

---

## 🛡️ Ejemplo de Protección de Rutas en Frontend (Next.js)

Para proteger una página, verifica la sesión al cargar el componente:

```tsx
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function PaginaProtegida() {
  const [user, setUser] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const checkSession = async () => {
      const res = await fetch('/api/auth/me');
      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
      } else {
        router.push('/login');
      }
    };
    checkSession();
  }, []);

  if (!user) {
    return <div>Cargando...</div>;
  }

  return <div>Contenido protegido para {user.name}</div>;
}
```

---