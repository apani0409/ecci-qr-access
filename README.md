# 🎓 ECCI Control System

<div align="center">

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)
![Python](https://img.shields.io/badge/python-3.11+-blue.svg)
![FastAPI](https://img.shields.io/badge/FastAPI-0.104.1-009688.svg)
![React](https://img.shields.io/badge/React-18.2-61dafb.svg)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15-336791.svg)

**Sistema integral de control de acceso y registro de dispositivos para instituciones educativas**

[Características](#-características) •
[Tecnologías](#-stack-tecnológico) •
[Instalación](#-instalación-rápida) •
[Uso](#-uso) •
[API](#-api-documentation) •
[Screenshots](#-screenshots)

</div>

---

## 📖 Descripción

ECCI Control es una **solución full-stack moderna** para la gestión digital de acceso estudiantil mediante dispositivos electrónicos registrados. El sistema reemplaza los métodos tradicionales de registro manual con una plataforma automatizada que utiliza **códigos QR únicos** para cada dispositivo, permitiendo un control de acceso eficiente y trazable.

### 🎯 Problema que Resuelve

Las instituciones educativas tradicionales dependen de registros manuales en papel para el control de entrada/salida de dispositivos electrónicos, lo que resulta en:
- ❌ Procesos lentos y propensos a errores
- ❌ Falta de trazabilidad histórica
- ❌ Gestión ineficiente de información
- ❌ Dificultad para generar reportes

### ✅ Solución

ECCI Control digitaliza completamente este proceso mediante:
- ✅ Registro automatizado con códigos QR
- ✅ Historial completo de accesos por dispositivo y usuario
- ✅ Gestión centralizada de dispositivos
- ✅ Interfaz intuitiva multiplataforma (Web + Mobile)
- ✅ Sistema seguro con autenticación JWT

---

## 🎨 Diseño y Prototipo

Puedes ver el prototipo interactivo de la aplicación en Figma:

**[📱 Ver Prototipo en Figma](https://www.figma.com/proto/EyG6lHbArhBr6V12YopBLP/QR-access?node-id=0-1&t=ObsTjXozztvs68S2-1)**

El prototipo incluye:
- Flujos completos de usuario
- Diseño de todas las pantallas principales
- Interacciones y navegación
- Sistema de diseño con componentes reutilizables

---

## ✨ Características

### 🔐 Autenticación y Seguridad

- **JWT Authentication** - Sistema robusto de tokens con refresh automático
- **Password Hashing** - bcrypt para almacenamiento seguro de contraseñas
- **Role-Based Access Control (RBAC)** - Sistema de roles (Admin, Security, Student)
- **Biometric Authentication** - Autenticación mediante huella dactilar o reconocimiento facial
- **Rate Limiting** - Protección contra ataques de fuerza bruta
- **CORS Configurado** - Políticas de seguridad para producción

### 📱 Gestión de Dispositivos
- Creación y registro de dispositivos personales
- Generación automática de códigos QR únicos
- Soporte para múltiples tipos de dispositivos (laptop, tablet, smartphone)
- Actualización de información del dispositivo
- Eliminación segura con validación de permisos
- Visualización y descarga de códigos QR

### 📊 Registro de Accesos
- Escaneo de códigos QR para entrada/salida
- Timestamp automático con zona horaria UTC
- Registro de ubicación opcional
- Historial completo por usuario
- Historial específico por dispositivo
- Consultas optimizadas con límites configurables

### 🚀 Características Empresariales Avanzadas
- **Redis Cache** - Cache distribuido para alto rendimiento
- **Webhook System** - Notificaciones en tiempo real a sistemas externos
- **Dark Mode** - Interfaz con soporte de tema claro/oscuro
- **Comprehensive Logging** - Sistema de logs estructurados con rotación
- **Error Handling** - Manejo robusto de errores y excepciones personalizadas

### 🎨 Interfaces Multiplataforma
- **Frontend Web**: React + Vite + Tailwind CSS
- **Mobile App**: React Native + Expo
- Diseño responsivo y moderno
- UX optimizada para flujos rápidos
- Integración completa con backend

---

## 🛠 Stack Tecnológico

### Backend
```
🐍 FastAPI 0.104.1         → Framework web moderno y rápido
🗄️ PostgreSQL 15+          → Base de datos relacional robusta
🔗 SQLAlchemy 2.0          → ORM Python con soporte async
📦 Alembic                 → Migraciones de base de datos
🔒 JWT + Bcrypt            → Autenticación y seguridad
⚡ Redis 7                 → Cache distribuido y rate limiting
🎣 Webhooks + HMAC         → Sistema de notificaciones externas
✅ Pydantic 2.5            → Validación de datos con type hints
📱 QRCode + Pillow         → Generación de códigos QR
🐌 Slowapi                 → Rate limiting middleware
🚀 Uvicorn                 → Servidor ASGI de alto rendimiento
🧪 Pytest                  → Testing y cobertura de código
```

### Frontend
```
⚛️ React 18.2              → Biblioteca UI declarativa
⚡ Vite 5.0                → Build tool ultrarrápido
🎨 Tailwind CSS 3.3        → Framework CSS utility-first
🧭 React Router 6.20       → Enrutamiento SPA
🐻 Zustand 4.4             → State management minimalista
🌐 Axios 1.6               → Cliente HTTP con interceptores
🎯 Heroicons 2.0           → Iconos SVG optimizados
```

### Mobile
```
📱 React Native            → Framework multiplataforma
🎪 Expo                    → Toolchain y SDK completo
🧭 React Navigation        → Navegación nativa
📸 Expo Camera             → Escaneo de códigos QR
```

### DevOps
```
🐳 Docker                  → Containerización
🐘 PostgreSQL Container    → Base de datos en contenedor
📝 Alembic CLI             → Gestión de migraciones
🔧 Docker Compose          → Orquestación multi-contenedor
```

---

## 🚀 Instalación Rápida

### Prerrequisitos

- Python 3.11+
- Node.js 18+
- Docker & Docker Compose (recomendado)
- PostgreSQL 15+ (si no usas Docker)

### Opción 1: Docker (Recomendado)

```bash
# 1. Clonar el repositorio
git clone https://github.com/tu-usuario/ecci-control.git
cd ecci-control

# 2. Configurar variables de entorno
cp .env.example .env
# Editar .env y configurar SECRET_KEY

# 3. Levantar todos los servicios
docker-compose up -d

# 4. El sistema estará disponible en:
# - Backend: http://localhost:8000
# - Frontend: http://localhost:3000
# - API Docs: http://localhost:8000/docs
```

### Opción 2: Instalación Manual

#### Backend

```bash
cd backend

# Crear entorno virtual
python -m venv venv
source venv/bin/activate  # En Windows: venv\Scripts\activate

# Instalar dependencias
pip install -r requirements.txt

# Configurar variables de entorno
cp .env.example .env
# Editar .env con tus configuraciones

# Ejecutar migraciones
alembic upgrade head

# Iniciar servidor
uvicorn app.main:app --reload
```

#### Frontend

```bash
cd frontend

# Instalar dependencias
npm install

# Configurar variables de entorno
cp .env.example .env

# Iniciar servidor de desarrollo
npm run dev
```

#### Mobile (Opcional)

```bash
cd mobile2

# Instalar dependencias
npm install

# Configurar API URL en src/constants/api.js

# Iniciar Expo
npm start
```

---

## 📚 Uso

### 1. Registro e Inicio de Sesión

```bash
# Registrar nuevo usuario
curl -X POST http://localhost:8000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "estudiante@ejemplo.com",
    "password": "Password123!",
    "full_name": "Juan Pérez",
    "student_id": "2024001",
    "career": "Ingeniería de Sistemas"
  }'

# Iniciar sesión
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "estudiante@ejemplo.com",
    "password": "Password123!"
  }'
```

### 2. Gestión de Dispositivos

```bash
# Crear dispositivo (requiere autenticación)
curl -X POST http://localhost:8000/api/devices/ \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Mi Laptop HP",
    "device_type": "laptop",
    "serial_number": "HP-SN-2024-001"
  }'

# Listar mis dispositivos
curl -X GET http://localhost:8000/api/devices/ \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### 3. Registro de Accesos

```bash
# Registrar entrada (escaneo de QR)
curl -X POST http://localhost:8000/api/access/record \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "qr_data": "DEVICE_QR_UUID",
    "access_type": "entrada",
    "location": "Edificio Principal"
  }'

# Ver historial de accesos
curl -X GET http://localhost:8000/api/access/history \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

---

## 📖 API Documentation

### Documentación Interactiva

Una vez que el backend esté ejecutándose, accede a:

- **Swagger UI**: [http://localhost:8000/docs](http://localhost:8000/docs)
- **ReDoc**: [http://localhost:8000/redoc](http://localhost:8000/redoc)

### Principales Endpoints

#### Autenticación
- `POST /api/auth/register` - Registrar nuevo usuario
- `POST /api/auth/login` - Iniciar sesión

#### Usuarios
- `GET /api/users/me` - Obtener perfil actual

#### Dispositivos
- `POST /api/devices/` - Crear dispositivo
- `GET /api/devices/` - Listar dispositivos del usuario
- `GET /api/devices/{id}` - Obtener dispositivo específico
- `PUT /api/devices/{id}` - Actualizar dispositivo
- `DELETE /api/devices/{id}` - Eliminar dispositivo
- `GET /api/devices/{id}/qr` - Obtener código QR

#### Accesos
- `POST /api/access/record` - Registrar acceso
- `GET /api/access/history` - Historial del usuario
- `GET /api/access/device/{id}` - Historial por dispositivo

---

## 🧪 Testing

### Backend

```bash
cd backend

# Ejecutar todos los tests
pytest

# Con cobertura de código
pytest --cov=app --cov-report=html

# Ver reporte de cobertura
open htmlcov/index.html
```

### Tests Incluidos
- ✅ Tests de autenticación (registro, login)
- ✅ Tests de gestión de dispositivos (CRUD completo)
- ✅ Tests de registro de accesos
- ✅ Tests de autorización y permisos
- ✅ Tests de validación de datos

---

## 🏗 Estructura del Proyecto

```
ecci-control/
├── backend/                    # API FastAPI
│   ├── app/
│   │   ├── api/
│   │   │   └── endpoints/     # Endpoints de la API
│   │   ├── core/              # Configuración, seguridad, logging
│   │   ├── models/            # Modelos SQLAlchemy
│   │   ├── schemas/           # Schemas Pydantic
│   │   ├── services/          # Lógica de negocio
│   │   └── utils/             # Utilidades
│   ├── alembic/               # Migraciones de BD
│   ├── tests/                 # Tests unitarios
│   └── requirements.txt
│
├── frontend/                   # Aplicación React
│   ├── src/
│   │   ├── components/        # Componentes reutilizables
│   │   ├── pages/             # Páginas/vistas
│   │   ├── services/          # Servicios API
│   │   ├── stores/            # State management
│   │   └── styles/            # Estilos globales
│   └── package.json
│
├── mobile2/                    # App React Native
│   ├── src/
│   │   ├── screens/           # Pantallas
│   │   ├── components/        # Componentes móviles
│   │   ├── navigation/        # Navegación
│   │   └── services/          # Servicios API
│   └── package.json
│
├── docker-compose.yml          # Orquestación Docker
└── README.md
```

---

## 🔒 Seguridad

### Características de Seguridad Implementadas

- ✅ **Autenticación JWT**: Tokens seguros con expiración
- ✅ **Hashing de Contraseñas**: Bcrypt con salt
- ✅ **Validación de Datos**: Pydantic schemas en todos los endpoints
- ✅ **CORS Configurables**: Orígenes permitidos configurables
- ✅ **Autorización por Recurso**: Verificación de propiedad
- ✅ **SQL Injection Protection**: ORM SQLAlchemy
- ✅ **Rate Limiting**: Configurable en producción
- ✅ **Logging Completo**: Trazabilidad de acciones

### Recomendaciones para Producción

```bash
# 1. Generar SECRET_KEY segura
openssl rand -hex 32

# 2. Usar variables de entorno
export SECRET_KEY="tu-clave-generada"
export ENVIRONMENT="production"
export DEBUG="False"

# 3. Configurar CORS restrictivo
export CORS_ORIGINS="https://tu-dominio.com"

# 4. Usar HTTPS
# Implementar certificados SSL/TLS

# 5. Configurar base de datos segura
# Usar contraseñas fuertes y conexiones SSL
```

---

## 📊 Base de Datos

### Diagrama ER

```
┌─────────────┐         ┌──────────────┐         ┌────────────────┐
│    User     │────────<│   Device     │────────<│ Access Record  │
├─────────────┤         ├──────────────┤         ├────────────────┤
│ id (PK)     │         │ id (PK)      │         │ id (PK)        │
│ email       │         │ user_id (FK) │         │ device_id (FK) │
│ password    │         │ name         │         │ user_id (FK)   │
│ full_name   │         │ device_type  │         │ access_type    │
│ student_id  │         │ serial_number│         │ timestamp      │
│ career      │         │ qr_data      │         │ location       │
│ created_at  │         │ qr_code      │         └────────────────┘
└─────────────┘         │ created_at   │
                        └──────────────┘
```

### Migraciones

```bash
# Crear nueva migración
alembic revision --autogenerate -m "descripción"

# Aplicar migraciones
alembic upgrade head

# Revertir última migración
alembic downgrade -1
```

---

## 🚢 Despliegue

### Docker Production

```bash
# Build para producción
docker-compose -f docker-compose.prod.yml build

# Desplegar
docker-compose -f docker-compose.prod.yml up -d
```

### Plataformas Recomendadas

- **Backend**: Railway, Render, DigitalOcean, AWS
- **Frontend**: Vercel, Netlify, Cloudflare Pages
- **Base de Datos**: Supabase, Railway, AWS RDS
- **Mobile**: Expo EAS Build + App Stores

---

## 📝 Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo [LICENSE](LICENSE) para más detalles.

---

## 👨‍💻 Autor

**Alessandro Pani**

---

##  Enfoque

Este proyecto fue desarrollado como una solución real para digitalizar el control de acceso en instituciones educativas, mejorando significativamente la eficiencia operativa y la trazabilidad de dispositivos.

---

<div align="center">

**⭐ Si este proyecto te pareció útil, considera darle una estrella ⭐**

</div>
