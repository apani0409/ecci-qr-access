# Guía de Pruebas - Sistema ECCI Control

## Estado del Sistema

✅ **Todos los servicios están desplegados y funcionando:**
- **Backend (FastAPI)**: http://localhost:8000
- **Frontend (React)**: http://localhost:3000
- **PostgreSQL**: localhost:5432
- **Redis**: localhost:6379

## Características Implementadas

### 1. Sistema de Roles (Administrador, Profesor, Estudiante)
### 2. Autenticación Biométrica (WebAuthn)
### 3. Rate Limiting (10 requests/minuto por endpoint)
### 4. Cache con Redis
### 5. Sistema de Webhooks
### 6. Modo Oscuro (UI)

---

## Paso 1: Crear Usuario Administrador

```bash
# Desde la raíz del proyecto
docker-compose exec backend python -c "
from app.models.user import User
from app.core.database import get_db
from app.core.security import get_password_hash
from sqlalchemy.orm import Session
import uuid

db = next(get_db())

# Crear admin
admin = User(
    id=uuid.uuid4(),
    email='admin@ecci.edu',
    hashed_password=get_password_hash('admin123'),
    full_name='Administrador',
    carnet='ADMIN001',
    role='administrator',
    is_active=True
)

db.add(admin)
db.commit()
print(f'✅ Admin creado: {admin.email}')
"
```

## Paso 2: Probar el Backend

### 2.1 Verificar Health Check
```bash
curl http://localhost:8000/health
# Respuesta: {"status":"healthy"}
```

### 2.2 Login como Administrador
```bash
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@ecci.edu",
    "password": "admin123"
  }'
```

**Guarda el `access_token` de la respuesta para usarlo en las siguientes pruebas.**

### 2.3 Ver Documentación Interactiva
Abre en tu navegador:
- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

---

## Paso 3: Probar Características Avanzadas

### 3.1 Sistema de Roles

**Crear un Profesor** (requiere token de admin):
```bash
TOKEN="tu_access_token_aqui"

curl -X POST http://localhost:8000/api/users \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "profesor@ecci.edu",
    "password": "prof123",
    "full_name": "Profesor Test",
    "carnet": "PROF001",
    "role": "professor"
  }'
```

**Crear un Estudiante**:
```bash
curl -X POST http://localhost:8000/api/users \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "estudiante@ecci.edu",
    "password": "est123",
    "full_name": "Estudiante Test",
    "carnet": "2024001",
    "role": "student"
  }'
```

**Verificar permisos** - Intenta crear un dispositivo con un estudiante (debería fallar):
```bash
# 1. Login como estudiante
EST_TOKEN=$(curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"estudiante@ecci.edu","password":"est123"}' \
  | jq -r '.access_token')

# 2. Intenta crear dispositivo (debe dar error 403)
curl -X POST http://localhost:8000/api/devices \
  -H "Authorization: Bearer $EST_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Laptop Test",
    "device_type": "laptop",
    "mac_address": "AA:BB:CC:DD:EE:FF"
  }'
```

### 3.2 Rate Limiting

**Probar límite de peticiones** (10 por minuto):
```bash
# Hacer 12 peticiones rápidas
for i in {1..12}; do
  echo "Request $i:"
  curl -w "\nHTTP Status: %{http_code}\n" \
    -X GET http://localhost:8000/api/devices \
    -H "Authorization: Bearer $TOKEN"
  echo "---"
done

# Las últimas 2 deberían dar error 429 (Too Many Requests)
```

### 3.3 Sistema de Webhooks

**Crear un webhook**:
```bash
curl -X POST http://localhost:8000/api/webhooks \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Webhook de Prueba",
    "url": "https://webhook.site/XXXXX",
    "events": ["device.created", "access.granted"],
    "is_active": true
  }'
```

💡 **Tip**: Usa https://webhook.site para generar una URL temporal y ver las peticiones.

**Ver webhooks**:
```bash
curl -X GET http://localhost:8000/api/webhooks \
  -H "Authorization: Bearer $TOKEN"
```

**Probar webhook** - Crea un dispositivo para disparar el evento:
```bash
curl -X POST http://localhost:8000/api/devices \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Laptop Dell",
    "device_type": "laptop",
    "mac_address": "11:22:33:44:55:66"
  }'

# Verifica en webhook.site que llegó la notificación
```

### 3.4 Cache con Redis

**Ver estadísticas de cache**:
```bash
# Conectarse a Redis
docker-compose exec redis redis-cli

# Ver todas las keys
127.0.0.1:6379> KEYS *

# Ver TTL de una key
127.0.0.1:6379> TTL rate_limit:devices_list:127.0.0.1

# Ver valor
127.0.0.1:6379> GET devices_cache_all

# Salir
127.0.0.1:6379> exit
```

**Probar cache de dispositivos**:
```bash
# Primera petición (guarda en cache)
time curl -X GET http://localhost:8000/api/devices \
  -H "Authorization: Bearer $TOKEN"

# Segunda petición (desde cache, más rápida)
time curl -X GET http://localhost:8000/api/devices \
  -H "Authorization: Bearer $TOKEN"
```

---

## Paso 4: Probar el Frontend

### 4.1 Acceder a la aplicación
Abre http://localhost:3000 en tu navegador.

### 4.2 Login
- **Email**: admin@ecci.edu
- **Password**: admin123

### 4.3 Probar Modo Oscuro
- Click en el botón de luna/sol en la barra de navegación
- El modo se guarda en localStorage

### 4.4 Gestión de Dispositivos
1. Ve a "Dispositivos"
2. Crea un nuevo dispositivo
3. Genera código QR
4. Edita/Elimina dispositivos

### 4.5 Escaneo QR
1. Ve a "Escanear QR"
2. Permite acceso a la cámara
3. Escanea un código QR generado
4. Verifica el registro de acceso

---

## Paso 5: Autenticación Biométrica (Opcional)

⚠️ **Requisito**: Navegador compatible con WebAuthn (Chrome, Firefox, Edge) y dispositivo con soporte biométrico.

### 5.1 Habilitar Biometría (Frontend)
1. Login como cualquier usuario
2. Ve a "Perfil"
3. Click en "Configurar Autenticación Biométrica"
4. Sigue las instrucciones del navegador
5. Registra tu huella/Face ID

### 5.2 Login con Biometría
1. Logout
2. En la página de login, click en "Usar Biometría"
3. Autoriza con tu huella/Face ID
4. Acceso sin contraseña ✅

---

## Paso 6: Verificar Logs y Monitoreo

### Backend Logs
```bash
docker-compose logs -f backend
```

### Ver Rate Limiting en acción
```bash
# Terminal 1: Ver logs del backend
docker-compose logs -f backend

# Terminal 2: Hacer peticiones rápidas
for i in {1..15}; do curl -X GET http://localhost:8000/api/devices \
  -H "Authorization: Bearer $TOKEN"; done
```

### Ver Webhook Logs
```bash
docker-compose exec -it backend python -c "
from app.core.database import get_db
from app.models.webhook import WebhookLog

db = next(get_db())
logs = db.query(WebhookLog).order_by(WebhookLog.created_at.desc()).limit(10).all()

for log in logs:
    print(f'{log.created_at} | {log.event} | Status: {log.response_status}')
"
```

---

## Arquitectura del Sistema

```
┌─────────────────┐
│   Frontend      │
│   (React)       │──┐
│   Port 3000     │  │
└─────────────────┘  │
                     │
┌─────────────────┐  │
│   Backend       │◄─┘
│   (FastAPI)     │──┬──► PostgreSQL (Port 5432)
│   Port 8000     │  │
└─────────────────┘  ├──► Redis (Port 6379)
                     │
                     └──► Webhooks Externos
```

---

## Troubleshooting

### El backend no arranca
```bash
docker-compose logs backend
docker-compose restart backend
```

### Error en migraciones
```bash
docker-compose exec backend alembic current
docker-compose exec backend alembic upgrade head
```

### Reset completo
```bash
docker-compose down -v
docker-compose up -d --build
docker-compose exec backend alembic upgrade head
# Recrear usuario admin (ver Paso 1)
```

### Puerto ocupado
```bash
# Ver qué usa el puerto 8000
sudo lsof -i :8000

# O cambiar el puerto en docker-compose.yml
ports:
  - "8001:8000"  # Usar 8001 en lugar de 8000
```

---

## Recursos Adicionales

- **Documentación API**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc
- **Collection Postman**: `postman_collection.json`
- **Logs Backend**: `docker-compose logs -f backend`
- **Logs Frontend**: `docker-compose logs -f frontend`

---

## Siguientes Pasos

1. ✅ Crear más usuarios de prueba
2. ✅ Probar todos los endpoints en Swagger
3. ✅ Configurar webhooks con servicios reales
4. ✅ Probar biometría en diferentes dispositivos
5. ✅ Testear modo oscuro en diferentes pantallas
6. ✅ Verificar rate limiting con diferentes IPs

---

**¡Sistema listo para demostración y pruebas! 🚀**
