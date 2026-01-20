# 🚀 Quick Start Guide - ECCI Control

Esta guía te ayudará a tener el proyecto corriendo en **menos de 5 minutos**.

## ⚡ Opción 1: Docker (Recomendado - Más Rápido)

```bash
# 1. Clonar el repositorio
git clone <tu-repo>
cd ecci-control

# 2. Copiar variables de entorno
cp .env.example .env
# Editar .env y cambiar SECRET_KEY si es necesario

# 3. Levantar todo con Docker
docker-compose up -d

# 4. Esperar a que los servicios estén listos (~30 segundos)
docker-compose logs -f

# 5. Abrir en el navegador
# Backend API: http://localhost:8000/docs
# Frontend: http://localhost:3000
```

**¡Listo! 🎉** El sistema está corriendo.

---

## 💻 Opción 2: Instalación Manual

### Requisitos
- Python 3.11+
- Node.js 18+
- PostgreSQL 15+

### Backend

```bash
# 1. Ir al directorio backend
cd backend

# 2. Crear entorno virtual
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# 3. Instalar dependencias
pip install -r requirements.txt

# 4. Configurar variables de entorno
cp .env.example .env
# Editar DATABASE_URL en .env

# 5. Crear base de datos
createdb ecci_control

# 6. Ejecutar migraciones
alembic upgrade head

# 7. (Opcional) Cargar datos de prueba
python init_db.py

# 8. Iniciar servidor
uvicorn app.main:app --reload
```

**Backend corriendo en**: http://localhost:8000

### Frontend

```bash
# 1. Ir al directorio frontend (en otra terminal)
cd frontend

# 2. Instalar dependencias
npm install

# 3. Configurar variables de entorno
cp .env.example .env

# 4. Iniciar servidor de desarrollo
npm run dev
```

**Frontend corriendo en**: http://localhost:3000

---

## 📱 Mobile (Opcional)

```bash
# 1. Ir al directorio mobile2
cd mobile2

# 2. Instalar dependencias
npm install

# 3. Configurar API URL
# Editar src/constants/api.js con tu IP local

# 4. Iniciar Expo
npm start
```

---

## ✅ Verificar que Todo Funciona

### Método 1: Script Automático

```bash
# Ejecutar script de verificación
./verify_system.sh
```

### Método 2: Manual

1. **Backend Health Check**:
   ```bash
   curl http://localhost:8000/health
   # Debería responder: {"status":"healthy"}
   ```

2. **API Docs**:
   - Abrir http://localhost:8000/docs
   - Deberías ver la documentación interactiva de Swagger

3. **Frontend**:
   - Abrir http://localhost:3000
   - Deberías ver la página de login

---

## 🔧 Solución de Problemas Comunes

### Error: "Puerto 8000 ya está en uso"

```bash
# Encontrar proceso usando el puerto
lsof -i :8000
# Matar el proceso
kill -9 <PID>
```

### Error: "Cannot connect to database"

```bash
# Verificar que PostgreSQL está corriendo
sudo service postgresql status

# O con Docker
docker-compose ps
```

### Error: "Module not found"

```bash
# Backend
cd backend
pip install -r requirements.txt

# Frontend
cd frontend
npm install
```

### Error: "Alembic revision not found"

```bash
cd backend
alembic upgrade head
```

---

## 🎯 Primeros Pasos

### 1. Registrar un Usuario

**Opción A: Desde Frontend**
- Ir a http://localhost:3000
- Click en "Registrarse"
- Completar formulario

**Opción B: Con curl**
```bash
curl -X POST http://localhost:8000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@ejemplo.com",
    "password": "Password123!",
    "full_name": "Usuario Test",
    "student_id": "2024001",
    "career": "Ingeniería de Sistemas"
  }'
```

### 2. Iniciar Sesión

```bash
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@ejemplo.com",
    "password": "Password123!"
  }'
```

Copia el `access_token` de la respuesta.

### 3. Crear un Dispositivo

```bash
curl -X POST http://localhost:8000/api/devices/ \
  -H "Authorization: Bearer TU_TOKEN_AQUI" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Mi Laptop",
    "device_type": "laptop",
    "serial_number": "SN-2024-001"
  }'
```

---

## 📚 Documentación Completa

- **README.md**: Documentación completa del proyecto
- **PRODUCTION_GUIDE.md**: Guía para deployment en producción
- **CONTRIBUTING.md**: Guía para contribuir
- **API Docs**: http://localhost:8000/docs (cuando esté corriendo)

---

## 🧪 Ejecutar Tests

```bash
cd backend

# Todos los tests
pytest

# Con cobertura
pytest --cov=app --cov-report=html

# Ver reporte
open htmlcov/index.html
```

---

## 🐳 Comandos Docker Útiles

```bash
# Levantar servicios
docker-compose up -d

# Ver logs
docker-compose logs -f

# Ver logs de un servicio específico
docker-compose logs -f backend

# Detener servicios
docker-compose down

# Reiniciar un servicio
docker-compose restart backend

# Reconstruir imágenes
docker-compose build

# Limpiar todo (⚠️ Borra datos)
docker-compose down -v
```

---

## 🎨 Accesos Rápidos

| Servicio | URL | Descripción |
|----------|-----|-------------|
| Backend API | http://localhost:8000 | API REST |
| API Docs (Swagger) | http://localhost:8000/docs | Documentación interactiva |
| ReDoc | http://localhost:8000/redoc | Documentación alternativa |
| Frontend | http://localhost:3000 | Aplicación web |
| Database (PostgreSQL) | localhost:5432 | Base de datos |

---

## 💡 Tips

1. **Desarrollo Backend**: Usa http://localhost:8000/docs para probar endpoints
2. **Datos de Prueba**: Ejecuta `python backend/init_db.py` para datos de ejemplo
3. **Hot Reload**: Ambos servidores se recargan automáticamente al editar
4. **Logs**: Revisa `backend/logs/` para logs detallados
5. **Testing**: Ejecuta tests frecuentemente con `pytest`

---

## 🆘 Necesitas Ayuda?

1. **Verificar Sistema**: `./verify_system.sh`
2. **Logs Docker**: `docker-compose logs -f`
3. **Logs Backend**: `tail -f backend/logs/app.log`
4. **Issues**: Revisa issues en GitHub
5. **Documentación**: Lee el README.md completo

---

## 🎉 ¡Éxito!

Si llegaste hasta aquí y todo funciona, estás listo para:
- ✅ Desarrollar nuevas features
- ✅ Experimentar con el código
- ✅ Hacer testing
- ✅ Preparar para deployment

**¡Disfruta programando! 🚀**
