# Advanced Features Documentation

## Características Avanzadas Implementadas

Este documento describe las características empresariales avanzadas implementadas en el sistema ECCI Control.

---

## 1. Sistema de Roles de Usuario (RBAC)

### Descripción
Sistema de control de acceso basado en roles con tres niveles de permisos.

### Roles Disponibles

#### **STUDENT** (Estudiante)
- **Permisos**: `access:read`, `device:create`, `device:read`, `device:update_own`
- **Descripción**: Usuario básico con acceso limitado a sus propios dispositivos
- **Casos de uso**: Estudiantes que registran y gestionan sus dispositivos

#### **SECURITY** (Personal de Seguridad)
- **Permisos**: `access:read`, `access:write`, `device:read`, `qr:scan`
- **Descripción**: Personal autorizado para escanear códigos QR y registrar accesos
- **Casos de uso**: Guardias de seguridad en puntos de control

#### **ADMIN** (Administrador)
- **Permisos**: `access:*`, `device:*`, `user:*`, `webhook:*`, `qr:*`
- **Descripción**: Acceso completo al sistema
- **Casos de uso**: Administradores del sistema

### Implementación

```python
from app.core.authorization import RoleChecker, PermissionChecker
from app.models.role import UserRole

# Proteger endpoint por rol
@router.get("/admin-only")
async def admin_endpoint(
    current_user: User = Depends(RoleChecker(UserRole.ADMIN))
):
    return {"message": "Admin access"}

# Proteger endpoint por permiso específico
@router.get("/devices")
async def list_devices(
    current_user: User = Depends(PermissionChecker("device:read"))
):
    return devices
```

### Endpoints

- **Registro con rol**: `POST /api/auth/register` (incluye campo `role`)
- **Usuario actual**: `GET /api/users/me` (incluye información de rol y permisos)

---

## 2. Autenticación Biométrica

### Descripción
Sistema de autenticación mediante huella dactilar o reconocimiento facial para dispositivos móviles.

### Flujo de Implementación

1. **Habilitar autenticación biométrica**
   ```bash
   POST /api/auth/biometric/enable
   {
     "public_key": "base64_encoded_public_key"
   }
   ```

2. **Login biométrico**
   ```bash
   POST /api/auth/biometric/login
   {
     "email": "usuario@example.com",
     "signature": "base64_encoded_signature"
   }
   ```

3. **Deshabilitar**
   ```bash
   POST /api/auth/biometric/disable
   ```

### Campos en Base de Datos

- `biometric_enabled`: Boolean - Indica si la autenticación biométrica está habilitada
- `biometric_public_key`: Text - Clave pública para verificación de firma

### Seguridad

- Las claves privadas **nunca** se almacenan en el servidor
- Cada dispositivo genera su par de claves público/privada
- La verificación se realiza mediante firma digital

---

## 3. Rate Limiting

### Descripción
Protección contra ataques de fuerza bruta y abuso de la API mediante límites de tasa.

### Límites Configurados

| Endpoint | Límite | Periodo |
|----------|--------|---------|
| `POST /api/auth/register` | 5 | 1 hora |
| `POST /api/auth/login` | 10 | 1 minuto |
| `POST /api/auth/biometric/login` | 10 | 1 minuto |

### Implementación

```python
from slowapi import Limiter
from slowapi.util import get_remote_address

limiter = Limiter(key_func=get_remote_address)

@router.post("/login")
@limiter.limit("10/minute")
async def login(request: Request):
    # Login logic
    pass
```

### Respuesta al Exceder Límite

```json
{
  "detail": "Rate limit exceeded: 10 per 1 minute"
}
```

**Código HTTP**: `429 Too Many Requests`

---

## 4. Sistema de Cache con Redis

### Descripción
Cache distribuido para mejorar el rendimiento de consultas frecuentes.

### Configuración

```env
REDIS_URL=redis://localhost:6379/0
```

### Uso

#### Decorador de Cache

```python
from app.core.redis_cache import cached

@cached(ttl=300, key_builder=lambda device_id: f"device:{device_id}")
async def get_device(device_id: int):
    # Esta función se cachea por 5 minutos
    return db.query(Device).get(device_id)
```

#### Invalidación Manual

```python
from app.core.redis_cache import cache

# Invalidar cache específico
await cache.delete("device:123")

# Invalidar patrón
await cache.delete_pattern("device:*")

# Limpiar todo
await cache.clear()
```

### Ventajas

- ⚡ Reducción de latencia en consultas frecuentes
- 📊 Menor carga en la base de datos
- 🔄 Escalabilidad mejorada
- 💾 Persistencia opcional con AOF

---

## 5. Sistema de Webhooks

### Descripción
Notificaciones en tiempo real de eventos del sistema a URLs externas.

### Eventos Disponibles

- `access.granted`: Acceso concedido a un área
- `access.denied`: Acceso denegado
- `device.created`: Nuevo dispositivo registrado
- `device.updated`: Dispositivo actualizado
- `device.deleted`: Dispositivo eliminado

### Gestión de Webhooks

#### Crear Webhook

```bash
POST /api/webhooks
{
  "name": "Notificaciones Slack",
  "url": "https://hooks.slack.com/services/T00000000/B00000000/XXXXXXXXXXXX",
  "events": ["access.granted", "access.denied"],
  "secret": "mi_secreto_super_seguro"
}
```

#### Listar Webhooks

```bash
GET /api/webhooks
```

#### Actualizar Webhook

```bash
PUT /api/webhooks/{webhook_id}
{
  "is_active": false
}
```

#### Ver Logs

```bash
GET /api/webhooks/{webhook_id}/logs?limit=50
```

### Payload de Webhook

```json
{
  "event": "access.granted",
  "timestamp": "2024-01-15T10:30:00Z",
  "data": {
    "user_id": 123,
    "device_id": 456,
    "location": "Edificio A"
  }
}
```

### Seguridad - Verificación de Firma HMAC

Cada webhook incluye un header `X-Webhook-Signature` que puedes verificar:

```python
import hmac
import hashlib

def verify_webhook(payload: bytes, signature: str, secret: str):
    expected = hmac.new(
        secret.encode(),
        payload,
        hashlib.sha256
    ).hexdigest()
    return hmac.compare_digest(signature, expected)
```

### Reintentos Automáticos

- El sistema reintenta automáticamente webhooks fallidos
- Máximo 3 intentos con backoff exponencial
- Los logs registran todos los intentos y errores

---

## 6. Modo Oscuro (Dark Mode)

### Descripción
Interfaz con soporte para tema claro y oscuro, con persistencia de preferencias.

### Características

- 🌙 Modo oscuro completo en toda la aplicación
- 💾 Persistencia en localStorage
- 🎨 Transiciones suaves entre temas
- 📱 Respeta preferencias del sistema operativo
- ⚡ Sin parpadeo al cargar

### Uso

El toggle de tema aparece automáticamente en la barra de navegación.

### Implementación Técnica

```jsx
// Usar el tema en cualquier componente
import { useTheme } from '../contexts/ThemeContext';

function MyComponent() {
  const { theme, toggleTheme } = useTheme();
  
  return (
    <div className="bg-white dark:bg-gray-800">
      <p className="text-gray-900 dark:text-gray-100">
        Tema actual: {theme}
      </p>
    </div>
  );
}
```

### Clases Tailwind para Dark Mode

```jsx
<div className="bg-white dark:bg-gray-800">
  <h1 className="text-gray-900 dark:text-white">Título</h1>
  <p className="text-gray-600 dark:text-gray-400">Texto</p>
  <button className="bg-blue-600 dark:bg-blue-700 hover:bg-blue-700 dark:hover:bg-blue-800">
    Botón
  </button>
</div>
```

---

## Migración de Base de Datos

Para aplicar los cambios de base de datos necesarios:

```bash
cd backend
alembic upgrade head
```

Esto creará:
- Columna `role` en tabla `users`
- Columnas `biometric_enabled` y `biometric_public_key` en `users`
- Tabla `webhooks`
- Tabla `webhook_logs`

---

## Variables de Entorno Requeridas

```env
# Redis
REDIS_URL=redis://localhost:6379/0

# Rate Limiting (opcional, usa defaults si no se especifica)
RATE_LIMIT_ENABLED=true

# Webhooks (opcional)
WEBHOOK_TIMEOUT=10
```

---

## Docker Compose

El archivo `docker-compose.yml` ahora incluye:

- **PostgreSQL**: Base de datos principal
- **Redis**: Cache y rate limiting
- **Backend**: API FastAPI
- **Frontend**: Aplicación React

```bash
# Iniciar todos los servicios
docker-compose up -d

# Ver logs
docker-compose logs -f

# Detener servicios
docker-compose down
```

---

## Testing

Prueba las nuevas características:

```bash
# Backend
cd backend
pytest tests/ -v --cov=app

# Frontend  
cd frontend
npm run dev
```

---

## Ejemplos de Uso

### 1. Crear un usuario Admin

```bash
curl -X POST http://localhost:8000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@university.edu",
    "password": "AdminPass123!",
    "full_name": "Admin Usuario",
    "student_id": "ADMIN001",
    "role": "admin"
  }'
```

### 2. Configurar Webhook para Slack

```bash
curl -X POST http://localhost:8000/api/webhooks \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Slack Notifications",
    "url": "https://hooks.slack.com/services/YOUR/WEBHOOK/URL",
    "events": ["access.granted", "access.denied"],
    "secret": "your-secret-key"
  }'
```

### 3. Habilitar Autenticación Biométrica

```bash
# Desde la app móvil, generar par de claves
# Luego:
curl -X POST http://localhost:8000/api/auth/biometric/enable \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "public_key": "BASE64_ENCODED_PUBLIC_KEY"
  }'
```

---

## Recursos Adicionales

- [Documentación FastAPI](https://fastapi.tiangolo.com/)
- [Redis Docs](https://redis.io/documentation)
- [Tailwind Dark Mode](https://tailwindcss.com/docs/dark-mode)
- [HMAC Signatures](https://www.freecodecamp.org/news/what-is-hmac/)

---

## Soporte

Para problemas o preguntas, consulta los logs:

```bash
# Backend logs
docker-compose logs backend

# Redis logs
docker-compose logs redis

# Ver logs específicos de webhooks
tail -f backend/logs/app.log | grep webhook
```
