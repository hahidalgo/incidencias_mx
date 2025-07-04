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

## 📑 Documentación de Endpoints Protegidos

### Usuarios (`/api/users`)
- **GET** `/api/users`
  - **Descripción:** Lista usuarios con paginación y búsqueda.
  - **Query params:** `page`, `pageSize`, `search`
  - **Respuesta:** `{ users, total, page, pageSize, totalPages }`
  - **Protección:** Requiere token válido.

- **POST** `/api/users`
  - **Descripción:** Crea un nuevo usuario.
  - **Body:**  
    - `user_name` (string, requerido)
    - `user_email` (string, requerido)
    - `user_password` (string, requerido)
    - `user_status` (int, requerido)
    - `user_rol` (int, requerido)
    - `company_id` (string, requerido)
    - `office_id` (string, requerido)
  - **Respuesta:** Usuario creado o error.
  - **Protección:** Requiere token válido.

- **PUT** `/api/users`
  - **Descripción:** Edita un usuario existente.
  - **Body:**  
    - `id` (string, requerido)
    - ... (los mismos campos que POST, menos la contraseña)
  - **Respuesta:** Usuario actualizado o error.
  - **Protección:** Requiere token válido.

- **DELETE** `/api/users`
  - **Descripción:** Elimina un usuario.
  - **Body:**  
    - `id` (string, requerido)
  - **Respuesta:** Mensaje de éxito o error.
  - **Protección:** Requiere token válido.

---

### Compañías (`/api/companies`)
- **GET** `/api/companies`
  - **Descripción:** Lista compañías con paginación y búsqueda.
  - **Query params:** `page`, `pageSize`, `search`
  - **Respuesta:** `{ companies, total, page, pageSize, totalPages }`
  - **Protección:** Requiere token válido.

- **POST** `/api/companies`
  - **Descripción:** Crea una nueva compañía.
  - **Body:**  
    - `company_name` (string, requerido)
    - `company_status` (int, requerido)
  - **Respuesta:** Compañía creada o error.
  - **Protección:** Requiere token válido.

- **PUT** `/api/companies`
  - **Descripción:** Edita una compañía.
  - **Body:**  
    - `id` (string, requerido)
    - `company_name` (string, requerido)
    - `company_status` (int, requerido)
  - **Respuesta:** Compañía actualizada o error.
  - **Protección:** Requiere token válido.

- **DELETE** `/api/companies`
  - **Descripción:** Elimina una compañía.
  - **Body:**  
    - `id` (string, requerido)
  - **Respuesta:** Mensaje de éxito o error.
  - **Protección:** Requiere token válido.

---

### Oficinas (`/api/offices`)
- **GET** `/api/offices`
  - **Descripción:** Lista oficinas con paginación y búsqueda.
  - **Query params:** `page`, `pageSize`, `search`
  - **Respuesta:** `{ offices, total, page, pageSize, totalPages }`
  - **Protección:** Requiere token válido.

- **POST** `/api/offices`
  - **Descripción:** Crea una nueva oficina.
  - **Body:**  
    - `company_id` (string, requerido)
    - `office_name` (string, requerido)
    - `office_status` (int, requerido)
  - **Respuesta:** Oficina creada o error.
  - **Protección:** Requiere token válido.

- **PUT** `/api/offices`
  - **Descripción:** Edita una oficina.
  - **Body:**  
    - `id` (string, requerido)
    - `company_id` (string, requerido)
    - `office_name` (string, requerido)
    - `office_status` (int, requerido)
  - **Respuesta:** Oficina actualizada o error.
  - **Protección:** Requiere token válido.

- **DELETE** `/api/offices`
  - **Descripción:** Elimina una oficina.
  - **Body:**  
    - `id` (string, requerido)
  - **Respuesta:** Mensaje de éxito o error.
  - **Protección:** Requiere token válido.

---

### Empleados (`/api/employees`)
- **GET** `/api/employees`
  - **Descripción:** Lista empleados con paginación y búsqueda.
  - **Query params:** `page`, `pageSize`, `search`
  - **Respuesta:** `{ employees, total, totalPages }`
  - **Protección:** Requiere token válido.

- **POST** `/api/employees`
  - **Descripción:** Crea un nuevo empleado.
  - **Body:**  
    - `office_id` (string, requerido)
    - `employee_code` (int, requerido)
    - `employee_name` (string, requerido)
    - `employee_type` (string, requerido)
    - `employee_status` (int, requerido)
  - **Respuesta:** Empleado creado o error.
  - **Protección:** Requiere token válido.

- **PUT** `/api/employees`
  - **Descripción:** Edita un empleado.
  - **Body:**  
    - `id` (string, requerido)
    - ... (los mismos campos que POST)
  - **Respuesta:** Empleado actualizado o error.
  - **Protección:** Requiere token válido.

- **DELETE** `/api/employees`
  - **Descripción:** Elimina un empleado.
  - **Body:**  
    - `id` (string, requerido)
  - **Respuesta:** Mensaje de éxito o error.
  - **Protección:** Requiere token válido.

---

## 🧰 Ejemplos de Uso con Postman

### 1. Autenticación (Obtener token)

- **Endpoint:** `POST /api/auth/login`
- **Body (JSON):**
```json
{
  "email": "usuario@ejemplo.com",
  "password": "123456"
}
```
- **Nota:** El token JWT se almacena automáticamente en una cookie httpOnly. En Postman, revisa la pestaña "Cookies" tras el login exitoso.

---

### 2. Usar endpoints protegidos en Postman

**Importante:**
- Realiza primero el login para obtener la cookie de sesión.
- En cada petición protegida, asegúrate de que la cookie `token` esté presente (Postman la gestiona automáticamente si usas la misma colección o entorno).

---

### Usuarios

#### Obtener usuarios (GET)
- **Método:** GET
- **URL:** `http://localhost:3000/api/users?page=1&pageSize=10&search=juan`
- **Headers:** Ninguno especial (la cookie se envía automáticamente)

#### Crear usuario (POST)
- **Método:** POST
- **URL:** `http://localhost:3000/api/users`
- **Body (JSON):**
```json
{
  "user_name": "Juan Pérez",
  "user_email": "juan.perez@ejemplo.com",
  "user_password": "123456",
  "user_status": 1,
  "user_rol": 2,
  "company_id": "id-compania",
  "office_id": "id-oficina"
}
```

#### Editar usuario (PUT)
- **Método:** PUT
- **URL:** `http://localhost:3000/api/users`
- **Body (JSON):**
```json
{
  "id": "id-usuario",
  "user_name": "Juan Pérez Modificado",
  "user_email": "juan.perez@ejemplo.com",
  "user_status": 1,
  "user_rol": 2,
  "company_id": "id-compania",
  "office_id": "id-oficina"
}
```

#### Eliminar usuario (DELETE)
- **Método:** DELETE
- **URL:** `http://localhost:3000/api/users`
- **Body (JSON):**
```json
{
  "id": "id-usuario"
}
```

---

### Compañías

#### Obtener compañías (GET)
- **Método:** GET
- **URL:** `http://localhost:3000/api/companies?page=1&pageSize=10&search=soaint`

#### Crear compañía (POST)
- **Método:** POST
- **URL:** `http://localhost:3000/api/companies`
- **Body (JSON):**
```json
{
  "company_name": "Soaint México",
  "company_status": 1
}
```

#### Editar compañía (PUT)
- **Método:** PUT
- **URL:** `http://localhost:3000/api/companies`
- **Body (JSON):**
```json
{
  "id": "id-compania",
  "company_name": "Soaint México Modificado",
  "company_status": 1
}
```

#### Eliminar compañía (DELETE)
- **Método:** DELETE
- **URL:** `http://localhost:3000/api/companies`
- **Body (JSON):**
```json
{
  "id": "id-compania"
}
```

---

### Oficinas

#### Obtener oficinas (GET)
- **Método:** GET
- **URL:** `http://localhost:3000/api/offices?page=1&pageSize=10&search=principal`

#### Crear oficina (POST)
- **Método:** POST
- **URL:** `http://localhost:3000/api/offices`
- **Body (JSON):**
```json
{
  "company_id": "id-compania",
  "office_name": "Oficina Principal",
  "office_status": 1
}
```

#### Editar oficina (PUT)
- **Método:** PUT
- **URL:** `http://localhost:3000/api/offices`
- **Body (JSON):**
```json
{
  "id": "id-oficina",
  "company_id": "id-compania",
  "office_name": "Oficina Principal Modificada",
  "office_status": 1
}
```

#### Eliminar oficina (DELETE)
- **Método:** DELETE
- **URL:** `http://localhost:3000/api/offices`
- **Body (JSON):**
```json
{
  "id": "id-oficina"
}
```

---

### Empleados

#### Obtener empleados (GET)
- **Método:** GET
- **URL:** `http://localhost:3000/api/employees?page=1&pageSize=10&search=juan`

#### Crear empleado (POST)
- **Método:** POST
- **URL:** `http://localhost:3000/api/employees`
- **Body (JSON):**
```json
{
  "office_id": "id-oficina",
  "employee_code": 1001,
  "employee_name": "Juan Pérez",
  "employee_type": "Administrativo",
  "employee_status": 1
}
```

#### Editar empleado (PUT)
- **Método:** PUT
- **URL:** `http://localhost:3000/api/employees`
- **Body (JSON):**
```json
{
  "id": "id-empleado",
  "office_id": "id-oficina",
  "employee_code": 1001,
  "employee_name": "Juan Pérez Modificado",
  "employee_type": "Administrativo",
  "employee_status": 1
}
```

#### Eliminar empleado (DELETE)
- **Método:** DELETE
- **URL:** `http://localhost:3000/api/employees`
- **Body (JSON):**
```json
{
  "id": "id-empleado"
}
```

---

---
<p align="center">
  <img src="../assets/logo-soaint-azul.png" alt="Logo del Proyecto">
</p>
