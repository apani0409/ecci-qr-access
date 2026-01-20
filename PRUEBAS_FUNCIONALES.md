# Guía de Pruebas Funcionales - ECCI Control System

## ✅ Sistema Operativo

Todos los contenedores están funcionando:
- **PostgreSQL**: ✓ Conectado y migraciones aplicadas
- **Redis**: ✓ Conectado y activo para cache
- **Backend (FastAPI)**: ✓ Corriendo en http://localhost:8000
- **Frontend (React)**: ✓ Corriendo en http://localhost:3000

## 📋 Credenciales de Prueba

### Usuario Administrador
- **Email**: `admin@ecci.edu`
- **Password**: `admin123`
- **Role**: `admin`

## 🧪 Pruebas de las 6 Características Implementadas

### 1️⃣ Sistema de Roles (RBAC)

**Roles disponibles:**
- `admin`: Acceso completo al sistema
- `security`: Gestión de accesos y dispositivos
- `student`: Acceso básico

**Prueba 1: Login con Admin**
```bash
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@ecci.edu","password":"admin123"}'
```

**Respuesta esperada:**
```json
{
  "access_token": "eyJ...",
  "token_type": "bearer",
  "user": {
    "role": "admin",
    ...
  }
}
```

**Prueba 2: Crear usuario con rol student**
```bash
TOKEN="<tu_token_del_login>"

curl -X POST http://localhost:8000/api/auth/register \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "email": "estudiante1@ecci.edu",
    "password": "password123",
    "full_name": "Juan Pérez",
    "student_id": "EST001",
    "role": "student"
  }'
```

**Prueba 3: Crear usuario con rol security**
```bash
curl -X POST http://localhost:8000/api/auth/register \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "email": "seguridad1@ecci.edu",
    "password": "password123",
    "full_name": "Ana García",
    "student_id": "SEC001",
    "role": "security"
  }'
```

### 2️⃣ Autenticación Biométrica

**Prueba 1: Habilitar biometría para un usuario**
```bash
curl -X POST http://localhost:8000/api/users/me/biometric/enable \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "biometric_signature": "fingerprint_hash_abc123xyz",
    "device_id": "mobile_device_001"
  }'
```

**Prueba 2: Login biométrico**
```bash
curl -X POST http://localhost:8000/api/auth/biometric \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@ecci.edu",
    "biometric_signature": "fingerprint_hash_abc123xyz",
    "device_id": "mobile_device_001"
  }'
```

**Respuesta esperada:**
```json
{
  "access_token": "eyJ...",
  "token_type": "bearer",
  "user": {
    "biometric_enabled": true,
    ...
  }
}
```

### 3️⃣ Rate Limiting

**Límites configurados:**
- **Registro**: 5 intentos por hora por IP
- **Login**: 10 intentos por minuto por IP
- **Login biométrico**: 10 intentos por minuto por IP

**Prueba: Exceder el límite de login**
```bash
# Ejecuta este comando 11 veces seguidas
for i in {1..11}; do
  echo "Intento $i:"
  curl -X POST http://localhost:8000/api/auth/login \
    -H "Content-Type: application/json" \
    -d '{"email":"admin@ecci.edu","password":"wrong_password"}'
  echo ""
done
```

**Respuesta esperada después del intento 10:**
```json
{
  "detail": "Rate limit exceeded: 10 per 1 minute"
}
```

### 4️⃣ Cache con Redis

El cache se aplica automáticamente a estas operaciones:
- Lista de dispositivos
- Detalles de dispositivos individuales
- Registros de acceso

**Prueba 1: Verificar que Redis está conectado**
```bash
docker-compose logs backend | grep -i redis
```

**Deberías ver:**
```
[INFO] Redis cache connected successfully
```

**Prueba 2: Consulta con cache**
```bash
# Primera consulta (sin cache)
time curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:8000/api/devices/

# Segunda consulta (con cache - debe ser más rápida)
time curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:8000/api/devices/
```

**TTL del cache:**
- Listas: 5 minutos
- Detalles: 10 minutos

### 5️⃣ Webhooks

**Eventos disponibles:**
- `user.registered`: Nuevo usuario registrado
- `device.created`: Dispositivo creado
- `device.updated`: Dispositivo actualizado
- `device.deleted`: Dispositivo eliminado
- `access.recorded`: Acceso registrado
- `access.entry`: Entrada registrada
- `access.exit`: Salida registrada

**Prueba 1: Crear un webhook**
```bash
curl -X POST http://localhost:8000/api/webhooks/ \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Webhook",
    "url": "https://webhook.site/unique-url",
    "events": ["user.registered", "device.created"],
    "is_active": true
  }'
```

**Prueba 2: Listar webhooks**
```bash
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:8000/api/webhooks/
```

**Prueba 3: Crear un dispositivo para disparar webhook**
```bash
curl -X POST http://localhost:8000/api/devices/ \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "device_id": "DEV001",
    "device_type": "mobile",
    "manufacturer": "Samsung",
    "model": "Galaxy S23"
  }'
```

**Prueba 4: Ver logs del webhook**
```bash
WEBHOOK_ID="<id_del_webhook_creado>"

curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:8000/api/webhooks/$WEBHOOK_ID/logs
```

**Formato del payload enviado:**
```json
{
  "event": "device.created",
  "timestamp": "2026-01-19T04:00:00Z",
  "data": {
    "id": "...",
    "device_id": "DEV001",
    "device_type": "mobile",
    ...
  }
}
```

### 6️⃣ Modo Oscuro (Dark Mode)

**Frontend (React):**
- El modo oscuro está implementado con context API
- Se guarda la preferencia en localStorage
- Cambia automáticamente los estilos con Tailwind CSS

**Prueba:**
1. Abre http://localhost:3000
2. Busca el botón de modo oscuro en la navegación
3. Haz click para alternar entre light/dark mode
4. Recarga la página - la preferencia debe persistir

**Clases Tailwind usadas:**
```jsx
className="dark:bg-gray-900 dark:text-white"
```

## 🔍 Verificación de Estado del Sistema

**1. Verificar todos los contenedores:**
```bash
docker-compose ps
```

**2. Ver logs del backend:**
```bash
docker-compose logs backend --tail=50
```

**3. Ver logs de Redis:**
```bash
docker-compose logs redis --tail=20
```

**4. Verificar salud de PostgreSQL:**
```bash
docker-compose exec postgres psql -U postgres -d ecci_control -c "SELECT COUNT(*) FROM users;"
```

## 🎯 Endpoints de la API

**Autenticación:**
- `POST /api/auth/register` - Registro de usuario
- `POST /api/auth/login` - Login tradicional
- `POST /api/auth/biometric` - Login biométrico

**Usuarios:**
- `GET /api/users/me` - Perfil actual
- `POST /api/users/me/biometric/enable` - Habilitar biometría
- `POST /api/users/me/biometric/disable` - Deshabilitar biometría

**Dispositivos:**
- `GET /api/devices/` - Listar dispositivos (con cache)
- `POST /api/devices/` - Crear dispositivo
- `GET /api/devices/{id}` - Obtener dispositivo (con cache)
- `PUT /api/devices/{id}` - Actualizar dispositivo
- `DELETE /api/devices/{id}` - Eliminar dispositivo

**Accesos:**
- `GET /api/access/` - Listar registros de acceso
- `POST /api/access/record` - Registrar acceso

**Webhooks:**
- `GET /api/webhooks/` - Listar webhooks
- `POST /api/webhooks/` - Crear webhook
- `GET /api/webhooks/{id}` - Obtener webhook
- `PUT /api/webhooks/{id}` - Actualizar webhook
- `DELETE /api/webhooks/{id}` - Eliminar webhook
- `GET /api/webhooks/{id}/logs` - Ver logs del webhook
- `POST /api/webhooks/{id}/test` - Probar webhook

## 📊 Base de Datos

**Tablas creadas:**
- `users` - Usuarios con roles y biometría
- `devices` - Dispositivos registrados
- `access_records` - Registros de acceso
- `webhooks` - Configuración de webhooks
- `webhook_logs` - Logs de entregas de webhooks

**Verificar tablas:**
```bash
docker-compose exec postgres psql -U postgres -d ecci_control -c "\dt"
```

## 🚀 Flujo de Prueba Completo

1. **Login como admin** → Obtener token
2. **Crear usuarios** con diferentes roles
3. **Habilitar biometría** para un usuario
4. **Crear webhook** para recibir notificaciones
5. **Crear dispositivo** → Dispara webhook device.created
6. **Registrar acceso** → Dispara webhook access.recorded
7. **Probar rate limiting** → Exceder límites
8. **Verificar cache** → Consultas rápidas
9. **Modo oscuro** → Toggle en frontend

## ⚡ Comandos Útiles

**Reiniciar todo:**
```bash
docker-compose down && docker-compose up -d
```

**Ver todos los logs:**
```bash
docker-compose logs -f
```

**Limpiar y reconstruir:**
```bash
docker-compose down -v
docker-compose up -d --build
```

**Acceder a PostgreSQL:**
```bash
docker-compose exec postgres psql -U postgres -d ecci_control
```

**Acceder a Redis CLI:**
```bash
docker-compose exec redis redis-cli
```
