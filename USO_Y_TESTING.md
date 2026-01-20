# Guia de uso real y testing de ECCI Control

Esta guia resume lo necesario para usar la plataforma (backend, web y app Expo) en un entorno real y como probar el flujo critico de escaneo y trazabilidad.

## 1. Requisitos rapidos
- Linux/Mac/WSL con Docker Compose, Python 3.11+, Node 18+ y Git.
- Expo CLI (`npm i -g expo-cli` o `npx expo start`) y la app Expo Go en el telefono.
- Red LAN compartida entre servidor y telefono; si no, usar `--tunnel` en Expo.
- Puertos abiertos: 8000 (API), 3000 (web), 5432 (Postgres), 6379 (Redis), 8081/8082 (Expo/Metro si usas LAN).

## 2. Backend (FastAPI + Postgres + Redis)
1) Configurar variables:
```
cp backend/.env.example backend/.env
# Editar SECRET_KEY y, si usas Postgres externo, DATABASE_URL/SQLALCHEMY_DATABASE_URL
# Ajustar CORS_ORIGINS para los hosts finales (web y Expo) en docker-compose.yml o .env
```
2) Levantar servicios base:
```
docker compose up -d postgres redis backend
```
3) Aplicar migraciones (solo la primera vez o tras cambios de modelo):
```
docker compose exec backend alembic upgrade head
```
4) Comprobar salud:
```
curl http://localhost:8000/health
```

## 3. Frontend web (React)
- En contenedor: `docker compose up -d frontend` (expone http://localhost:3000).
- En local: `cd frontend && npm install && npm run dev -- --host` y usar `VITE_API_URL=http://<host>:8000` en `.env.local`.

## 4. App movil (Expo, carpeta mobile2)
1) Instalar deps: `cd mobile2 && npm install`.
2) Definir URL de API (por defecto queda `http://192.168.110.126:8000` en src/constants/api.js). Para apuntar al host real:
```
EXPO_PUBLIC_API_BASE_URL=http://<ip-o-host>:8000 npx expo start --tunnel
# Para LAN: EXPO_PUBLIC_API_BASE_URL=http://<ip-lan>:8000 npx expo start --lan
```
3) Escanear el QR de Expo Go desde el telefono. Asegura que el host responde desde el movil (`curl http://<ip>:8000/health`).

## 5. Cuentas de prueba recomendadas (roles)
Crear al menos: admin, security (guardia) y student. El endpoint permite pasar `role`.
```
API=http://<host>:8000
# Admin
auth_admin=$(curl -s -X POST "$API/api/auth/register" -H "Content-Type: application/json" -d '{"email":"admin@demo.test","password":"Admin123!","full_name":"Admin Demo","student_id":"ADMIN001","role":"admin"}')
# Guardia
curl -s -X POST "$API/api/auth/register" -H "Content-Type: application/json" -d '{"email":"guard@demo.test","password":"Guard123!","full_name":"Guard Demo","student_id":"SEC001","role":"security"}'
# Estudiante
curl -s -X POST "$API/api/auth/register" -H "Content-Type: application/json" -d '{"email":"student@demo.test","password":"Student123!","full_name":"Student Demo","student_id":"STU001","role":"student"}'
```
Tip: el registro esta rate-limited (5/h). Si ya existen, usa login para obtener el token.

## 6. Crear dispositivo demo (con token de estudiante)
```
API=http://<host>:8000
STUDENT_TOKEN=<token_jwt_de_student>
curl -s -X POST "$API/api/devices/" \
  -H "Authorization: Bearer $STUDENT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"Laptop HP","device_type":"laptop","serial_number":"HP-SN-001"}'
```
Guarda `qr_data` y `id` del dispositivo. El QR renderizado en la app web/movil usa ese `qr_data`.

## 7. Escaneo en entorno real (guardia)
- Inicia sesion en la app Expo como `guard@demo.test`.
- En la pantalla de escaneo, apunta al QR generado del estudiante. El backend registra:
  - `access_type`: entrada/salida
  - `user_id`: duenio del dispositivo
  - `scanned_by_id`: quien escaneo (guardia/admin)
- API equivalente via curl:
```
GUARD_TOKEN=<token_guardia>
QR=<qr_data_del_dispositivo>
curl -s -X POST "$API/api/access/scan" \
  -H "Authorization: Bearer $GUARD_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"qr_data\":\"$QR\",\"access_type\":\"entrada\",\"location\":\"Puerta Principal\"}"
```
Respuesta esperada: 201 con `scanned_by_id` y `scanned_by_name` poblados.

## 8. Plan de smoke test end-to-end
1) Salud: `/health` devuelve `healthy`.
2) Login de student y guard: obtiene tokens JWT.
3) Student crea dispositivo -> recibe `qr_data` y lo ve en QR.
4) Guardia escanea el QR: recibe 201 y en `scanned_by_name` figura el guardia.
5) Historia para guardia: `GET /api/access/history` muestra el registro recien creado (ve todos).
6) Historia para student: `GET /api/access/history` con token de student solo muestra sus registros.
7) Seguridad negativa: intenta escanear con un student distinto -> recibe 403 (no autorizado).
8) Opcional: `GET /api/access/device/{device_id}/history` devuelve la trazabilidad del dispositivo con nombre, serie y quien escaneo.

## 9. Checklist de produccion
- SECRET_KEY unica y larga.
- Ajustar CORS_ORIGINS a los dominios finales (quitar '*').
- Servir detras de TLS (Nginx/Traefik) y activar HTTPs.
- Configurar backups de Postgres y rotacion de logs (montaje backend_logs ya presente).
- Revisar limites de tasa (slowapi) y Redis en produccion.

## 10. Troubleshooting rapido
- Ver logs backend: `docker logs -f ecci-backend`.
- Estado de servicios: `docker compose ps`.
- Reiniciar backend: `docker compose restart backend`.
- Reaplicar migraciones si algo cambia: `docker compose exec backend alembic upgrade head`.

Con esto puedes levantar el stack completo, usar la app web/movil y demostrar en vivo el flujo: un estudiante crea su QR, un guardia lo escanea y ambos ven el historial correcto.
