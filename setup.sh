#!/bin/bash
# Script para inicializar el sistema ECCI Control

echo "🚀 Inicializando ECCI Control System..."
echo ""

# Colores para output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Verificar si PostgreSQL está disponible
echo "Verificando PostgreSQL..."
if ! command -v psql &> /dev/null; then
    echo -e "${RED}❌ PostgreSQL no está instalado${NC}"
    echo "Por favor instala PostgreSQL e intenta de nuevo"
    exit 1
fi

echo -e "${GREEN}✓ PostgreSQL encontrado${NC}"
echo ""

# Crear base de datos
echo "Creando base de datos 'ecci_control'..."
createdb ecci_control 2>/dev/null || echo "La base de datos ya existe"
echo -e "${GREEN}✓ Base de datos lista${NC}"
echo ""

# Backend setup
echo "Configurando Backend..."
cd backend

# Crear entorno virtual
if [ ! -d "venv" ]; then
    echo "Creando entorno virtual..."
    python3 -m venv venv
fi

source venv/bin/activate

echo "Instalando dependencias Python..."
pip install -r requirements.txt -q

# Configurar .env si no existe
if [ ! -f ".env" ]; then
    echo "Creando archivo .env..."
    cp .env.example .env
    echo -e "${YELLOW}⚠️  Asegúrate de actualizar .env con credenciales reales${NC}"
fi

# Migraciones
echo "Ejecutando migraciones..."
alembic upgrade head

# Inicializar datos
echo "Inicializando datos de prueba..."
python init_db.py

echo -e "${GREEN}✓ Backend configurado${NC}"
cd ..

echo ""
echo "Configurando Frontend..."
cd frontend

echo "Instalando dependencias npm..."
npm install -q

echo -e "${GREEN}✓ Frontend configurado${NC}"
cd ..

echo ""
echo -e "${GREEN}✅ Sistema ECCI Control inicializado correctamente${NC}"
echo ""
echo "Para iniciar:"
echo "  Backend:  cd backend && source venv/bin/activate && uvicorn app.main:app --reload"
echo "  Frontend: cd frontend && npm run dev"
echo ""
echo "URLs:"
echo "  API:      http://localhost:8000"
echo "  Docs:     http://localhost:8000/docs"
echo "  Frontend: http://localhost:3000"
echo ""
echo "Credenciales de prueba:"
echo "  Email:    juan@university.edu"
echo "  Password: SecurePassword123!"
