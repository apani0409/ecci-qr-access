# Backend (FastAPI)

API de ECCI QR Access. Visión general, roles e instalación: [README principal](../README.md).

```
app/
  api/endpoints/   auth, users, devices, access, webhooks (rutas HTTP)
  services/        reglas de negocio (permisos, QR, historial)
  models/          tablas SQLAlchemy
  schemas/         validación Pydantic de entrada/salida
  core/            configuración, BD, JWT, rate limit, logging
alembic/versions/  migraciones (001 → 007)
tests/             pytest con SQLite en memoria
```

## Comandos

```bash
pip install -r requirements.txt
alembic upgrade head          # crear/actualizar el esquema en PostgreSQL
python init_db.py             # datos de ejemplo (3 roles, dispositivos, accesos)
uvicorn app.main:app --reload # http://localhost:8000/docs
pytest                        # pruebas
flake8 app tests              # lint
```

## Endpoints principales

| Método | Ruta                                   | Quién |
|--------|----------------------------------------|-------|
| POST   | `/api/auth/register`, `/api/auth/login`| público (rate-limited) |
| GET    | `/api/auth/me`, `/api/users/me`        | autenticado |
| CRUD   | `/api/devices/`, `/api/devices/{id}`   | dueño del dispositivo |
| GET    | `/api/devices/{id}/qr`                 | dueño |
| POST   | `/api/access/scan`                     | dueño, o Seguridad/Admin para cualquier equipo |
| GET    | `/api/access/history`                  | propio; Seguridad/Admin ven todo |
| GET    | `/api/access/device/{id}/history`      | dueño o Seguridad/Admin |
| CRUD   | `/api/webhooks/`                       | Admin |
| GET    | `/health`                              | público; 503 si la BD no responde |

## Configuración (variables de entorno o `.env`)

| Variable | Por defecto | Nota |
|----------|-------------|------|
| `DATABASE_URL` | `postgresql://user:password@localhost:5432/ecci_control` | |
| `SECRET_KEY` | valor de desarrollo | **obligatorio** cambiarlo si `ENVIRONMENT=production` (el arranque falla si no) |
| `CORS_ORIGINS` | localhost:3000, 5173, 8081, 8082 | lista separada por comas |
| `REDIS_URL` | `redis://localhost:6379/0` | vacío = sin caché |
| `AUTO_CREATE_TABLES` | `true` | `create_all` al arrancar; en producción usar Alembic |
| `RATE_LIMIT_ENABLED` | `true` | las pruebas lo desactivan |
