# ECCI QR Access

Registro de entrada y salida de laptops con códigos QR para la Escuela de Ciencias de la
Computación e Informática (ECCI) de la Universidad de Costa Rica.

**Demo en vivo:** https://ecci-qr-access-demo.vercel.app

> **Es un proyecto académico / demo.** No se desplegó en la ECCI ni se midió su efecto en
> producción. La demo pública corre por completo en el navegador con datos de ejemplo
> (ver [Demo](#demo)).

## El problema

En la salida de la ECCI, quien lleva una laptop debe anotarla a mano en un registro en papel.
En las horas pico eso forma filas, y el registro en papel es difícil de consultar después
("¿cuándo salió esta laptop y quién la registró?").

## La propuesta

1. Cada estudiante registra sus dispositivos (nombre, marca, modelo, número de serie) y el
   sistema genera un **código QR único por dispositivo**.
2. En la puerta, Seguridad **escanea el QR** (lector USB o cámara) y marca *entrada* o *salida*:
   un escaneo en lugar de llenar una línea en papel.
3. Cada movimiento queda en un **historial con fecha y hora, por dispositivo y por usuario**,
   incluyendo quién lo registró y dónde.

El objetivo de diseño era acortar esas filas y dar trazabilidad; como no se desplegó, no hay
mediciones de cuánto las acorta.

## Funcionalidades

- Registro e inicio de sesión con **JWT**; contraseñas con **bcrypt**.
- **Control de acceso por roles (RBAC)**:

  | Acción                                   | Estudiante | Seguridad | Admin |
  |------------------------------------------|:----------:|:---------:|:-----:|
  | Registrar / editar / borrar sus equipos  | ✓          | ✓         | ✓     |
  | Escanear sus propios equipos             | ✓          | ✓         | ✓     |
  | Escanear equipos de otras personas       |            | ✓         | ✓     |
  | Ver el historial de todos                |            | ✓         | ✓     |
  | Gestionar webhooks                       |            |           | ✓     |

  El registro público siempre crea estudiantes; los roles de Seguridad y Admin los asigna un
  administrador (`backend/seed_users.py`).
- QR con un identificador aleatorio (UUID), no con el número de serie.
- Historial por usuario y por dispositivo, con dueño y quién escaneó.
- Webhooks firmados con HMAC-SHA256 para integrar otros sistemas (solo Admin, vía API).
- Límite de intentos en login y registro (slowapi). Redis es opcional (caché).
- Frontend web (React + Vite + Tailwind) y app móvil (React Native + Expo).

## Arquitectura

```
frontend/  React 18 + Vite + Tailwind + Zustand ─┐
mobile2/   React Native + Expo ──────────────────┼─ HTTP/JSON (JWT) ─▶ backend/ FastAPI
                                                 │                       ├─ SQLAlchemy 2 + Alembic ─▶ PostgreSQL
                                                 │                       └─ Redis (opcional)
frontend/src/demo/  API emulada en el navegador ─┘  (solo en la build de demo)
```

| Carpeta      | Contenido |
|--------------|-----------|
| `backend/`   | API FastAPI: `app/api/endpoints` (rutas), `app/services` (reglas de negocio), `app/models` (SQLAlchemy), `alembic/` (migraciones), `tests/` (pytest) |
| `frontend/`  | App web. `src/demo/` contiene el modo demo |
| `mobile2/`   | App móvil Expo |
| `nginx/`, `monitoring/`, `docker-compose*.yml` | Despliegue con Docker |

## Correr localmente

Requisitos: Python 3.11, Node 18+, y PostgreSQL 15 (o Docker).

### Opción A: Docker Compose

```bash
cp .env.example .env
docker compose up --build
```

API en http://localhost:8000/docs, web en http://localhost:3000.

### Opción B: a mano

```bash
cd backend
python -m venv .venv && source .venv/bin/activate   # Windows: .venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env          # ajustar DATABASE_URL y SECRET_KEY
alembic upgrade head
python init_db.py             # usuarios y datos de ejemplo
uvicorn app.main:app --reload
```

```bash
cd frontend
npm install
npm run dev                   # http://localhost:3000, usa VITE_API_URL (por defecto http://localhost:8000/api)
```

Usuarios que crea `init_db.py`: `admin@ecci.com / Admin123!`, `guard@ecci.com / Guard123!`,
`student@ecci.com / Student123!` (solo para desarrollo).

## Pruebas y calidad

```bash
cd backend
pytest                        # 39 pruebas, SQLite en memoria, no requiere PostgreSQL ni Redis
flake8 app tests              # lint
```

Las pruebas cubren autenticación, dispositivos y escaneo, incluidas las reglas de permisos
(un estudiante no puede ver, editar ni escanear equipos ajenos; el registro no permite
autoasignarse el rol de admin; Seguridad ve todo el historial).

## Demo

La demo pública es la app web compilada con `npm run build:demo` (`VITE_DEMO_MODE=true`).
En ese modo un adaptador de axios (`frontend/src/demo/mockApi.js`) responde las mismas rutas
que el backend, con las mismas reglas de permisos y códigos de error, pero guarda los datos en el
`localStorage` del navegador. No hay servidor ni base de datos: nada sale del navegador y el
botón **Reiniciar datos** restaura los datos de ejemplo. Personas y equipos son ficticios.

Cuentas de la demo (contraseña `Demo1234!`): `estudiante@ecci.demo`, `guarda@ecci.demo`,
`admin@ecci.demo`. En la página de escaneo hay un panel para simular la lectura de un QR.

Para correrla localmente: `cd frontend && npm run dev:demo`.

## Limitaciones conocidas

- No se probó con usuarios reales ni en la puerta de la ECCI.
- El escaneo web usa un campo de texto (compatible con lectores QR USB, que escriben el código
  como teclado); la cámara solo está en la app móvil.
- El reinicio de contraseña envía correo solo si se configura SMTP; en desarrollo lo registra en el log.
- Los webhooks se configuran por API, pero aún no se disparan automáticamente al registrar un acceso.

## Licencia

MIT. Ver [LICENSE](LICENSE).
