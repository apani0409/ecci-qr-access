# ECCI Control System - Documentación Completa

Sistema integral de **Control de Acceso y Registro de Dispositivos** para Estudiantes Universitarios.

## 📋 Tabla de Contenidos

1. [Introducción](#introducción)
2. [Stack Tecnológico](#stack-tecnológico)
3. [Características](#características)
4. [Instalación Rápida](#instalación-rápida)
5. [Estructura del Proyecto](#estructura-del-proyecto)
6. [Guía de Uso](#guía-de-uso)
7. [Endpoints API](#endpoints-api)
8. [Ejemplo de Flujo Completo](#ejemplo-de-flujo-completo)

## Introducción

ECCI Control es un sistema web moderno para gestionar el acceso de estudiantes a través de dispositivos registrados. Utiliza códigos QR únicos para cada dispositivo, permitiendo un registro automatizado de entradas y salidas.

### Objetivos
- ✅ Registro seguro de usuarios
- ✅ Gestión de dispositivos personales
- ✅ Generación automática de códigos QR
- ✅ Registro de accesos en tiempo real
- ✅ Historial completo de movimientos
- ✅ Interfaz amigable y responsiva

## Stack Tecnológico

### Backend
```
FastAPI 0.104.1         ← Framework web moderno
PostgreSQL 12+          ← Base de datos relacional
SQLAlchemy 2.0          ← ORM Python
Alembic                 ← Migraciones de BD
JWT (python-jose)       ← Autenticación
Pydantic 2.5            ← Validación de datos
qrcode + Pillow         ← Generación de QR
Uvicorn                 ← Servidor ASGI
```

### Frontend
```
React 18.2              ← Librería UI
Vite 5.0                ← Build tool rápido
Tailwind CSS 3.3        ← Utilidades CSS
React Router 6.20       ← Enrutamiento
Zustand 4.4             ← State management
Axios 1.6               ← HTTP client
Heroicons 2.0           ← Iconos
```

### DevOps
```
Docker                  ← Containerización
PostgreSQL Docker       ← BD en contenedor
Alembic CLI             ← Migraciones
```

## Características

### 👤 Autenticación y Usuarios
- [x] Registro con validación de email único
- [x] Login seguro con JWT
- [x] Tokens con expiración configurable
- [x] Contraseñas hasheadas con bcrypt
- [x] Perfil de usuario con información personal

### 📱 Gestión de Dispositivos
- [x] Crear dispositivos con serial number único
- [x] Generación automática de QR único por dispositivo
- [x] Visualización de QR en base64
- [x] Editar información del dispositivo
- [x] Eliminar dispositivos
- [x] Listar dispositivos del usuario

### 🔐 Códigos QR
- [x] Generación automática en formato PNG
- [x] Conversión a base64 para visualización
- [x] Datos QR únicos (UUID)
- [x] Descarga de imágenes QR
- [x] Visualización en diferentes pantallas

### 📊 Registro de Accesos
- [x] Escaneo de códigos QR
- [x] Registro de entrada/salida
- [x] Timestamp automático
- [x] Ubicación opcional
- [x] Historial completo por usuario
- [x] Historial por dispositivo

### 🛡️ Seguridad
- [x] Validación JWT en todas las rutas protegidas
- [x] Verificación de propiedad de dispositivos
- [x] Hash de contraseñas
- [x] CORS configurable
- [x] Índices en BD para performance
- [x] Validación Pydantic en inputs

## Instalación Rápida

### Opción 1: Instalación Manual

#### Backend

```bash
# 1. Crear BD
createdb ecci_control

# 2. Navegar al backend
cd backend

# 3. Crear entorno virtual
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# 4. Instalar dependencias
pip install -r requirements.txt

# 5. Configurar .env
cp .env.example .env
# Editar con credenciales reales

# 6. Migraciones
alembic upgrade head

# 7. Inicializar datos
python init_db.py

# 8. Ejecutar
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

#### Frontend

```bash
# 1. Navegar a frontend
cd frontend

# 2. Instalar dependencias
npm install

# 3. Variables de entorno (opcional)
echo 'VITE_API_URL=http://localhost:8000' > .env.local

# 4. Ejecutar
npm run dev
```

### Opción 2: Docker (Próximamente)

```bash
docker-compose up -d
```

## Estructura del Proyecto

```
ecci-control/
├── backend/
│   ├── app/
│   │   ├── api/
│   │   │   └── endpoints/
│   │   │       ├── auth.py         # Login, registro
│   │   │       ├── users.py        # Perfil
│   │   │       ├── devices.py      # CRUD dispositivos
│   │   │       └── access.py       # QR y accesos
│   │   ├── core/
│   │   │   ├── config.py           # Configuración
│   │   │   ├── database.py         # Conexión BD
│   │   │   └── security.py         # JWT, hash
│   │   ├── models/
│   │   │   ├── user.py             # Modelo User
│   │   │   ├── device.py           # Modelo Device
│   │   │   └── access_record.py    # Modelo AccessRecord
│   │   ├── schemas/                # Pydantic schemas
│   │   ├── services/               # Lógica de negocio
│   │   ├── utils/                  # Helpers
│   │   └── main.py                 # App principal
│   ├── alembic/
│   │   ├── versions/               # Migraciones
│   │   └── env.py
│   ├── init_db.py                  # Script inicialización
│   ├── requirements.txt            # Dependencias
│   └── README.md
│
├── frontend/
│   ├── src/
│   │   ├── components/             # Componentes React
│   │   ├── pages/                  # Páginas principales
│   │   ├── services/               # Llamadas API
│   │   ├── stores/                 # Estado (Zustand)
│   │   ├── styles/                 # CSS global
│   │   ├── App.jsx                 # Componente raíz
│   │   └── main.jsx                # Entry point
│   ├── public/                     # Archivos estáticos
│   ├── vite.config.js              # Config Vite
│   ├── tailwind.config.js          # Config Tailwind
│   ├── package.json                # Dependencias npm
│   └── README.md
│
├── wireframes/                     # Diseños UI
│   ├── file1.png
│   └── file2.png
│
└── README.md                       # Este archivo
```

## Guía de Uso

### Flujo: Nuevo Usuario

```
1. Ir a /register
2. Llenar formulario (email, contraseña, nombre, ID estudiante)
3. Sistema crea usuario y genera JWT automáticamente
4. Redirige a /home
5. Usuario logueado ✅
```

### Flujo: Crear Dispositivo

```
1. En /devices click "+ Nuevo Dispositivo"
2. Llenar:
   - Nombre: "MacBook Pro"
   - Tipo: "laptop"
   - Serial: "C02AB123DE45"
3. Sistema:
   - Genera UUID único (qr_data)
   - Crea código QR en base64
   - Guarda en BD
4. Mostrar QR para descargar/visualizar ✅
```

### Flujo: Registrar Acceso

```
1. Ir a /scan
2. Escanear o pegar código QR
3. Seleccionar: entrada o salida
4. Opcional: añadir ubicación
5. Click "Registrar Acceso"
6. Sistema:
   - Busca dispositivo por qr_data
   - Crea AccessRecord con timestamp
   - Responde con confirmación
7. Historial actualizado ✅
```

### Flujo: Ver Historial

```
1. En /home click "Ir al Historial"
2. Ver tabla con:
   - Dispositivo
   - Tipo de acceso
   - Fecha y hora
   - Ubicación
3. Filtrar por dispositivo si lo desea
```

## Endpoints API

### 🔐 Autenticación (Sin token)

```http
POST /auth/register
Content-Type: application/json

{
  "email": "student@university.edu",
  "password": "SecurePassword123!",
  "full_name": "Juan García",
  "student_id": "2023001"
}

Response 201:
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer",
  "user": {...}
}
```

```http
POST /auth/login
Content-Type: application/json

{
  "email": "student@university.edu",
  "password": "SecurePassword123!"
}

Response 200: [mismo formato que register]
```

```http
GET /auth/me
Authorization: Bearer {token}

Response 200: {user data}
```

### 👤 Usuarios (Con token)

```http
GET /users/me
Authorization: Bearer {token}

Response 200: {user data}
```

### 📱 Dispositivos (Con token)

```http
POST /devices/
Authorization: Bearer {token}
Content-Type: application/json

{
  "name": "MacBook Pro",
  "device_type": "laptop",
  "serial_number": "C02AB123DE45"
}

Response 201:
{
  "device": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "user_id": "...",
    "name": "MacBook Pro",
    "device_type": "laptop",
    "serial_number": "C02AB123DE45",
    "qr_data": "550e8400-e29b-41d4-a716-446655440001",
    "qr_code": "data:image/png;base64,..."
  },
  "qr_image_base64": "data:image/png;base64,..."
}
```

```http
GET /devices/
Authorization: Bearer {token}

Response 200: [
  {device1},
  {device2},
  ...
]
```

```http
GET /devices/{device_id}
Authorization: Bearer {token}

Response 200: {device data}
```

```http
PUT /devices/{device_id}
Authorization: Bearer {token}
Content-Type: application/json

{
  "name": "MacBook Pro 14",
  "device_type": "laptop"
}

Response 200: {updated device}
```

```http
DELETE /devices/{device_id}
Authorization: Bearer {token}

Response 204: (no content)
```

```http
GET /devices/{device_id}/qr
Authorization: Bearer {token}

Response 200:
{
  "device_id": "...",
  "qr_data": "550e8400-...",
  "qr_image_base64": "data:image/png;base64,..."
}
```

### 📊 Acceso (Escaneo)

```http
POST /access/scan
Content-Type: application/json
(SIN autenticación - permite escaneo anónimo)

{
  "qr_data": "550e8400-e29b-41d4-a716-446655440001",
  "access_type": "entrada",
  "location": "Puerta Principal"
}

Response 201:
{
  "id": "...",
  "device_id": "...",
  "user_id": "...",
  "access_type": "entrada",
  "timestamp": "2024-01-15T10:30:00+00:00",
  "location": "Puerta Principal"
}
```

```http
GET /access/history?limit=100
Authorization: Bearer {token}

Response 200: [
  {access_record1},
  {access_record2},
  ...
]
```

```http
GET /access/device/{device_id}/history?limit=100
Authorization: Bearer {token}

Response 200: [access records para device]
```

## Ejemplo de Flujo Completo

### Paso 1: Registrar Usuario

```bash
curl -X POST "http://localhost:8000/auth/register" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "carlos@university.edu",
    "password": "MyPassword123!",
    "full_name": "Carlos Mendez",
    "student_id": "2024001"
  }'

# Respuesta:
# {
#   "access_token": "eyJ0eXAi...",
#   "token_type": "bearer",
#   "user": {
#     "id": "123e4567-e89b-12d3-a456-426614174000",
#     "email": "carlos@university.edu",
#     ...
#   }
# }
```

### Paso 2: Crear Dispositivo

```bash
TOKEN="eyJ0eXAi..."

curl -X POST "http://localhost:8000/devices/" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Dell XPS 15",
    "device_type": "laptop",
    "serial_number": "CN12345XYZ"
  }'

# Respuesta:
# {
#   "device": {
#     "id": "device-uuid",
#     "qr_data": "qr-uuid",
#     "qr_code": "data:image/png;base64,iVBORw0K..."
#   },
#   ...
# }
```

### Paso 3: Escanear QR (Registrar Acceso)

```bash
# Nota: No necesita autenticación, permite escaneo libre

curl -X POST "http://localhost:8000/access/scan" \
  -H "Content-Type: application/json" \
  -d '{
    "qr_data": "qr-uuid-del-paso-2",
    "access_type": "entrada",
    "location": "Puerta Principal"
  }'

# Respuesta:
# {
#   "id": "access-record-id",
#   "device_id": "device-uuid",
#   "user_id": "user-uuid",
#   "access_type": "entrada",
#   "timestamp": "2024-01-15T14:35:22.123456+00:00",
#   "location": "Puerta Principal"
# }
```

### Paso 4: Ver Historial

```bash
TOKEN="eyJ0eXAi..."

curl -X GET "http://localhost:8000/access/history?limit=10" \
  -H "Authorization: Bearer $TOKEN"

# Respuesta: Array con los últimos 10 accesos del usuario
```

## 🔍 Datos Demo

Para testing, usar las credenciales pre-cargadas:

| Email | Password | ID Estudiante | Nombre |
|-------|----------|---------------|---------|
| juan@university.edu | SecurePassword123! | 2023001 | Juan García López |
| maria@university.edu | SecurePassword456! | 2023002 | María Rodríguez Silva |

**Ejecución**: `python init_db.py`

## 📊 Modelos de Base de Datos

### Tabla: users
```sql
- id (UUID) PRIMARY KEY
- email (VARCHAR 255) UNIQUE NOT NULL
- password_hash (VARCHAR 255) NOT NULL
- full_name (VARCHAR 255) NOT NULL
- student_id (VARCHAR 20) UNIQUE NOT NULL
- is_active (BOOLEAN) DEFAULT true
- created_at, updated_at (TIMESTAMP WITH TZ)
```

### Tabla: devices
```sql
- id (UUID) PRIMARY KEY
- user_id (UUID) FK → users.id
- name (VARCHAR 255) NOT NULL
- device_type (VARCHAR 50) NOT NULL
- serial_number (VARCHAR 255) UNIQUE NOT NULL
- qr_code (VARCHAR 1000) -- base64
- qr_data (VARCHAR 500) UNIQUE NOT NULL
- created_at, updated_at (TIMESTAMP WITH TZ)
```

### Tabla: access_records
```sql
- id (UUID) PRIMARY KEY
- device_id (UUID) FK → devices.id
- user_id (UUID) FK → users.id
- access_type (ENUM: entrada, salida) NOT NULL
- timestamp (TIMESTAMP WITH TZ) NOT NULL
- location (VARCHAR 255)
```

## 🚀 Próximas Mejoras

- [ ] Autenticación OAuth2
- [ ] Integración con LDAP/Active Directory
- [ ] Reportes y estadísticas
- [ ] Notificaciones en tiempo real (WebSocket)
- [ ] Exportar historial (CSV, PDF)
- [ ] Múltiples ubicaciones
- [ ] Roles y permisos (admin, user)
- [ ] Integración con sistemas de puertas inteligentes

## 📄 Licencia

MIT License

## ✉️ Soporte

Para soporte o dudas: dev@university.edu

---

**Versión**: 1.0.0  
**Última actualización**: Enero 2024  
**Estado**: Production Ready ✅
