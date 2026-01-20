#!/bin/bash

# ECCI Control - Advanced Setup Script
# Este script configura el proyecto con todas las características avanzadas

set -e

echo "🚀 ECCI Control - Setup Avanzado"
echo "================================="
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check Docker
echo "📦 Verificando Docker..."
if ! command -v docker &> /dev/null; then
    echo -e "${RED}❌ Docker no está instalado${NC}"
    exit 1
fi

if ! command -v docker-compose &> /dev/null; then
    echo -e "${RED}❌ Docker Compose no está instalado${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Docker y Docker Compose instalados${NC}"
echo ""

# Create .env if not exists
if [ ! -f .env ]; then
    echo "📝 Creando archivo .env..."
    cat > .env << EOF
# Database
DATABASE_URL=postgresql://ecci_user:ecci_password@localhost:5432/ecci_control

# Redis
REDIS_URL=redis://localhost:6379/0

# Security
SECRET_KEY=$(openssl rand -hex 32)
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

# Environment
ENVIRONMENT=development
DEBUG=True
LOG_LEVEL=INFO

# CORS
CORS_ORIGINS=http://localhost:3000,http://localhost:5173

# Rate Limiting
RATE_LIMIT_ENABLED=true

# Webhooks
WEBHOOK_TIMEOUT=10

# Frontend
VITE_API_URL=http://localhost:8000/api
VITE_ENVIRONMENT=development
EOF
    echo -e "${GREEN}✅ Archivo .env creado${NC}"
else
    echo -e "${YELLOW}⚠️  .env ya existe, no se sobrescribirá${NC}"
fi

echo ""

# Stop existing containers
echo "🛑 Deteniendo contenedores existentes..."
docker-compose down -v 2>/dev/null || true
echo -e "${GREEN}✅ Contenedores detenidos${NC}"
echo ""

# Build and start services
echo "🏗️  Construyendo e iniciando servicios..."
docker-compose up -d --build
echo -e "${GREEN}✅ Servicios iniciados${NC}"
echo ""

# Wait for services
echo "⏳ Esperando a que los servicios estén listos..."
echo "   - PostgreSQL..."
until docker-compose exec -T postgres pg_isready -U ecci_user -d ecci_control &>/dev/null; do
    sleep 1
done
echo -e "${GREEN}   ✅ PostgreSQL listo${NC}"

echo "   - Redis..."
until docker-compose exec -T redis redis-cli ping &>/dev/null; do
    sleep 1
done
echo -e "${GREEN}   ✅ Redis listo${NC}"

echo "   - Backend..."
sleep 5
until curl -f http://localhost:8000/health &>/dev/null; do
    sleep 2
done
echo -e "${GREEN}   ✅ Backend listo${NC}"
echo ""

# Run migrations
echo "🗃️  Ejecutando migraciones de base de datos..."
docker-compose exec -T backend alembic upgrade head
echo -e "${GREEN}✅ Migraciones completadas${NC}"
echo ""

# Create demo users
echo "👥 Creando usuarios de demostración..."
docker-compose exec -T backend python << 'PYTHON'
import asyncio
from app.core.database import SessionLocal
from app.services.user_service import UserService
from app.models.role import UserRole

async def create_demo_users():
    db = SessionLocal()
    try:
        # Admin user
        try:
            UserService.create_user(
                db=db,
                email="admin@university.edu",
                password="AdminPass123!",
                full_name="Admin Usuario",
                student_id="ADMIN001",
                role=UserRole.ADMIN
            )
            print("✅ Usuario Admin creado")
        except:
            print("⚠️  Usuario Admin ya existe")

        # Security user
        try:
            UserService.create_user(
                db=db,
                email="security@university.edu",
                password="SecurityPass123!",
                full_name="Security Guard",
                student_id="SEC001",
                role=UserRole.SECURITY
            )
            print("✅ Usuario Security creado")
        except:
            print("⚠️  Usuario Security ya existe")

        # Student user
        try:
            UserService.create_user(
                db=db,
                email="student@university.edu",
                password="StudentPass123!",
                full_name="Juan Estudiante",
                student_id="EST001",
                role=UserRole.STUDENT
            )
            print("✅ Usuario Student creado")
        except:
            print("⚠️  Usuario Student ya existe")

    finally:
        db.close()

if __name__ == "__main__":
    asyncio.run(create_demo_users())
PYTHON
echo ""

# Show info
echo ""
echo "============================================"
echo -e "${GREEN}✨ Setup completado exitosamente!${NC}"
echo "============================================"
echo ""
echo "📋 Información de los servicios:"
echo "   • Backend API:    http://localhost:8000"
echo "   • API Docs:       http://localhost:8000/docs"
echo "   • Frontend:       http://localhost:3000"
echo "   • PostgreSQL:     localhost:5432"
echo "   • Redis:          localhost:6379"
echo ""
echo "👥 Usuarios de demostración:"
echo ""
echo "   📌 ADMINISTRADOR"
echo "      Email:    admin@university.edu"
echo "      Password: AdminPass123!"
echo "      Role:     admin"
echo ""
echo "   📌 PERSONAL DE SEGURIDAD"
echo "      Email:    security@university.edu"
echo "      Password: SecurityPass123!"
echo "      Role:     security"
echo ""
echo "   📌 ESTUDIANTE"
echo "      Email:    student@university.edu"
echo "      Password: StudentPass123!"
echo "      Role:     student"
echo ""
echo "🎯 Características habilitadas:"
echo "   ✅ Sistema de Roles (RBAC)"
echo "   ✅ Autenticación Biométrica"
echo "   ✅ Rate Limiting"
echo "   ✅ Cache con Redis"
echo "   ✅ Sistema de Webhooks"
echo "   ✅ Modo Oscuro (Frontend)"
echo ""
echo "📚 Ver más información:"
echo "   • Documentación avanzada: cat ADVANCED_FEATURES.md"
echo "   • Logs del backend: docker-compose logs -f backend"
echo "   • Logs de Redis: docker-compose logs -f redis"
echo ""
echo "🛠️  Comandos útiles:"
echo "   • Detener servicios: docker-compose down"
echo "   • Ver logs: docker-compose logs -f"
echo "   • Reiniciar: docker-compose restart"
echo "   • Tests: docker-compose exec backend pytest"
echo ""
echo -e "${GREEN}¡Listo para desarrollar! 🎉${NC}"
