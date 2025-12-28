"""
Backend README - ECCI Control System

Sistema de Control de Acceso y Registro de Dispositivos para Estudiantes Universitarios
"""

# ECCI Control System - Backend

Sistema completo de control de acceso y registro de dispositivos para estudiantes universitarios, desarrollado con **FastAPI**, **PostgreSQL** y **SQLAlchemy**.

## 🚀 Stack Tecnológico

- **Framework**: FastAPI 0.104.1
- **Base de Datos**: PostgreSQL
- **ORM**: SQLAlchemy 2.0
- **Migraciones**: Alembic
- **Autenticación**: JWT (JSON Web Tokens)
- **Validaciones**: Pydantic
- **QR Codes**: qrcode + Pillow
- **Server**: Uvicorn

## 📁 Estructura del Proyecto

```
backend/
├── app/
│   ├── api/
│   │   └── endpoints/
│   │       ├── auth.py          # Login, registro, autenticación
│   │       ├── users.py         # Perfil de usuario
│   │       ├── devices.py       # CRUD de dispositivos
│   │       └── access.py        # Registro de accesos
│   ├── core/
│   │   ├── config.py            # Configuración de la aplicación
│   │   ├── database.py          # Conexión a BD y sesiones
│   │   └── security.py          # JWT y hash de contraseñas
│   ├── models/
│   │   ├── user.py              # Modelo de Usuario
│   │   ├── device.py            # Modelo de Dispositivo
│   │   └── access_record.py     # Modelo de Registro de Acceso
│   ├── schemas/
│   │   ├── user.py              # Esquemas Pydantic de Usuario
│   │   ├── device.py            # Esquemas Pydantic de Dispositivo
│   │   └── access_record.py     # Esquemas de Acceso
│   ├── services/
│   │   ├── user_service.py      # Lógica de Usuario
│   │   ├── device_service.py    # Lógica de Dispositivo
│   │   ├── access_service.py    # Lógica de Acceso
│   │   └── qr_service.py        # Generación de QR
│   ├── utils/
│   │   ├── dependencies.py      # Dependencias FastAPI
│   │   └── models.py            # Modelos de respuesta
│   └── main.py                  # Aplicación principal
├── alembic/
│   ├── versions/
│   │   └── 001_initial.py       # Migración inicial
│   ├── env.py                   # Configuración de Alembic
│   └── __init__.py
├── .env.example                 # Ejemplo de variables de entorno
├── alembic.ini                  # Configuración de Alembic
├── requirements.txt             # Dependencias
├── init_db.py                   # Script de inicialización
└── README.md                    # Este archivo
```

## 📋 Requisitos Previos

- Python 3.9+
- PostgreSQL 12+
- pip (gestor de paquetes)

## 🔧 Instalación

### 1. Clonar o configurar el proyecto

```bash
cd backend
```

### 2. Crear entorno virtual

```bash
python -m venv venv
source venv/bin/activate  # En Windows: venv\Scripts\activate
```

### 3. Instalar dependencias

```bash
pip install -r requirements.txt
```

### 4. Configurar variables de entorno

Copiar el archivo `.env.example` a `.env` y actualizar los valores:

```bash
cp .env.example .env
```

Editar `.env`:

```env
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/ecci_control
SQLALCHEMY_DATABASE_URL=postgresql://user:password@localhost:5432/ecci_control

# JWT
SECRET_KEY=your-super-secret-key-change-in-production
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

# API
DEBUG=True
```

### 5. Crear base de datos PostgreSQL

```bash
createdb ecci_control
```

O usando psql:

```sql
CREATE DATABASE ecci_control;
```

### 6. Ejecutar migraciones

```bash
alembic upgrade head
```

### 7. Inicializar base de datos con datos de ejemplo

```bash
python init_db.py
```

## 🚀 Ejecutar la Aplicación

```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

La API estará disponible en: `http://localhost:8000`

### Documentación Interactiva

- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

## 📚 Endpoints Principales

### Autenticación

#### Registro
```bash
POST /auth/register
Content-Type: application/json

{
  "email": "student@university.edu",
  "password": "SecurePassword123!",
  "full_name": "Juan García",
  "student_id": "2023001"
}

Response:
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer",
  "user": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "email": "student@university.edu",
    "full_name": "Juan García",
    "student_id": "2023001",
    "is_active": true,
    "created_at": "2024-01-15T10:30:00+00:00",
    "updated_at": "2024-01-15T10:30:00+00:00"
  }
}
```

#### Login
```bash
POST /auth/login
Content-Type: application/json

{
  "email": "student@university.edu",
  "password": "SecurePassword123!"
}

Response: [Token response - mismo que registro]
```

#### Obtener Perfil Actual
```bash
GET /auth/me
Authorization: Bearer {access_token}

Response: [User data]
```

### Dispositivos

#### Crear Dispositivo
```bash
POST /devices/
Authorization: Bearer {access_token}
Content-Type: application/json

{
  "name": "MacBook Pro",
  "device_type": "laptop",
  "serial_number": "C02AB123DE45"
}

Response:
{
  "device": {
    "id": "550e8400-e29b-41d4-a716-446655440001",
    "user_id": "550e8400-e29b-41d4-a716-446655440000",
    "name": "MacBook Pro",
    "device_type": "laptop",
    "serial_number": "C02AB123DE45",
    "qr_data": "550e8400-e29b-41d4-a716-446655440002",
    "qr_code": "data:image/png;base64,...",
    "created_at": "2024-01-15T10:30:00+00:00",
    "updated_at": "2024-01-15T10:30:00+00:00"
  },
  "qr_image_base64": "data:image/png;base64,..."
}
```

#### Obtener Dispositivos del Usuario
```bash
GET /devices/
Authorization: Bearer {access_token}

Response: [List of devices]
```

#### Obtener Dispositivo Específico
```bash
GET /devices/{device_id}
Authorization: Bearer {access_token}

Response: [Device data]
```

#### Actualizar Dispositivo
```bash
PUT /devices/{device_id}
Authorization: Bearer {access_token}
Content-Type: application/json

{
  "name": "MacBook Pro 14 inch",
  "device_type": "laptop"
}

Response: [Updated device]
```

#### Obtener QR del Dispositivo
```bash
GET /devices/{device_id}/qr
Authorization: Bearer {access_token}

Response:
{
  "device_id": "550e8400-e29b-41d4-a716-446655440001",
  "qr_data": "550e8400-e29b-41d4-a716-446655440002",
  "qr_image_base64": "data:image/png;base64,..."
}
```

#### Eliminar Dispositivo
```bash
DELETE /devices/{device_id}
Authorization: Bearer {access_token}
```

### Registro de Accesos

#### Escanear QR (Registrar Acceso)
```bash
POST /access/scan
Content-Type: application/json

{
  "qr_data": "550e8400-e29b-41d4-a716-446655440002",
  "access_type": "entrada",
  "location": "Puerta Entrada Principal"
}

Response:
{
  "id": "550e8400-e29b-41d4-a716-446655440003",
  "device_id": "550e8400-e29b-41d4-a716-446655440001",
  "user_id": "550e8400-e29b-41d4-a716-446655440000",
  "access_type": "entrada",
  "timestamp": "2024-01-15T10:30:00+00:00",
  "location": "Puerta Entrada Principal"
}
```

#### Obtener Historial de Accesos del Usuario
```bash
GET /access/history?limit=100
Authorization: Bearer {access_token}

Response: [List of access records]
```

#### Obtener Historial de Accesos por Dispositivo
```bash
GET /access/device/{device_id}/history?limit=100
Authorization: Bearer {access_token}

Response: [List of access records]
```

## 🔐 Seguridad

- **JWT para autenticación**: Tokens con expiración configurable
- **Hash de contraseñas**: Usando bcrypt
- **CORS configurado**: Ajustar `allow_origins` en producción
- **Índices en BD**: Para queries rápidas
- **Validaciones Pydantic**: En todos los inputs

## 🗄️ Estructura de Base de Datos

### Tabla: users
- `id` (UUID): Identificador único
- `email` (String): Correo único
- `password_hash` (String): Contraseña hasheada
- `full_name` (String): Nombre completo
- `student_id` (String): ID de estudiante único
- `is_active` (Boolean): Estado del usuario
- `created_at`, `updated_at` (DateTime): Timestamps

### Tabla: devices
- `id` (UUID): Identificador único
- `user_id` (UUID): FK a users
- `name` (String): Nombre del dispositivo
- `device_type` (String): Tipo (laptop, phone, tablet)
- `serial_number` (String): Número de serie único
- `qr_code` (String): Imagen QR en base64
- `qr_data` (String): Datos QR únicos (UUID)
- `created_at`, `updated_at` (DateTime): Timestamps

### Tabla: access_records
- `id` (UUID): Identificador único
- `device_id` (UUID): FK a devices
- `user_id` (UUID): FK a users
- `access_type` (Enum): entrada / salida
- `timestamp` (DateTime): Momento del acceso
- `location` (String): Ubicación (opcional)

## 📝 Ejemplos de Uso

### Script de Login

```bash
# Registrar nuevo usuario
curl -X POST "http://localhost:8000/auth/register" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@university.edu",
    "password": "TestPassword123!",
    "full_name": "Test User",
    "student_id": "2024001"
  }'

# Respuesta contiene access_token

# Login con credenciales
curl -X POST "http://localhost:8000/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@university.edu",
    "password": "TestPassword123!"
  }'
```

### Script de Dispositivos

```bash
TOKEN="tu_access_token_aqui"

# Crear dispositivo
curl -X POST "http://localhost:8000/devices/" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Mi Laptop",
    "device_type": "laptop",
    "serial_number": "ABC123XYZ"
  }'

# Listar dispositivos
curl -X GET "http://localhost:8000/devices/" \
  -H "Authorization: Bearer $TOKEN"
```

## 🧪 Testing

Para testing, considerar agregar:
- pytest
- pytest-asyncio
- httpx

```bash
pip install pytest pytest-asyncio httpx
pytest
```

## 📦 Deployment

### Usando Gunicorn en Producción

```bash
pip install gunicorn

gunicorn \
  --workers 4 \
  --worker-class uvicorn.workers.UvicornWorker \
  --bind 0.0.0.0:8000 \
  app.main:app
```

### Variables de Entorno para Producción

```env
DEBUG=False
SECRET_KEY=your-production-secret-key-very-long-and-random
SQLALCHEMY_DATABASE_URL=postgresql://prod_user:prod_password@prod_host:5432/ecci_prod
ACCESS_TOKEN_EXPIRE_MINUTES=60
```

## 🤝 Contribución

Para contribuir al proyecto:

1. Crear una rama para la feature: `git checkout -b feature/nueva-feature`
2. Hacer commits descriptivos: `git commit -m "Add: nueva feature"`
3. Push a la rama: `git push origin feature/nueva-feature`
4. Crear un Pull Request

## 📄 Licencia

Este proyecto está bajo la licencia MIT.

## ✉️ Soporte

Para dudas o problemas, contactar al equipo de desarrollo.

---

**Última actualización**: Enero 2024
**Versión**: 1.0.0
