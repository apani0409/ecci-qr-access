#!/bin/bash

# ECCI Control - Script de Verificación del Sistema
# Verifica que todos los componentes estén funcionando correctamente

set -e

echo "========================================"
echo "🔍 ECCI Control - Verificación del Sistema"
echo "========================================"
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check functions
check_command() {
    if command -v $1 &> /dev/null; then
        echo -e "${GREEN}✓${NC} $1 está instalado"
        return 0
    else
        echo -e "${RED}✗${NC} $1 no está instalado"
        return 1
    fi
}

check_port() {
    if lsof -Pi :$1 -sTCP:LISTEN -t >/dev/null 2>&1 ; then
        echo -e "${GREEN}✓${NC} Puerto $1 está en uso (servicio corriendo)"
        return 0
    else
        echo -e "${YELLOW}⚠${NC} Puerto $1 está libre (servicio no corriendo)"
        return 1
    fi
}

# 1. Verificar dependencias del sistema
echo "1️⃣  Verificando dependencias del sistema..."
echo "----------------------------------------"

check_command python3 || PYTHON_MISSING=1
check_command node || NODE_MISSING=1
check_command npm || NPM_MISSING=1
check_command docker || DOCKER_MISSING=1
check_command docker-compose || COMPOSE_MISSING=1
check_command psql || POSTGRES_MISSING=1

echo ""

# 2. Verificar versiones
echo "2️⃣  Verificando versiones..."
echo "----------------------------------------"

if [ -z "$PYTHON_MISSING" ]; then
    PYTHON_VERSION=$(python3 --version)
    echo -e "${GREEN}Python:${NC} $PYTHON_VERSION"
fi

if [ -z "$NODE_MISSING" ]; then
    NODE_VERSION=$(node --version)
    echo -e "${GREEN}Node:${NC} $NODE_VERSION"
fi

if [ -z "$NPM_MISSING" ]; then
    NPM_VERSION=$(npm --version)
    echo -e "${GREEN}npm:${NC} $NPM_VERSION"
fi

if [ -z "$DOCKER_MISSING" ]; then
    DOCKER_VERSION=$(docker --version)
    echo -e "${GREEN}Docker:${NC} $DOCKER_VERSION"
fi

echo ""

# 3. Verificar archivos de configuración
echo "3️⃣  Verificando archivos de configuración..."
echo "----------------------------------------"

if [ -f "backend/.env" ]; then
    echo -e "${GREEN}✓${NC} backend/.env existe"
else
    echo -e "${YELLOW}⚠${NC} backend/.env no existe (usar .env.example)"
fi

if [ -f "frontend/.env" ]; then
    echo -e "${GREEN}✓${NC} frontend/.env existe"
else
    echo -e "${YELLOW}⚠${NC} frontend/.env no existe (usar .env.example)"
fi

if [ -f ".env" ]; then
    echo -e "${GREEN}✓${NC} .env (root) existe"
else
    echo -e "${YELLOW}⚠${NC} .env (root) no existe (usar .env.example)"
fi

echo ""

# 4. Verificar estructura del proyecto
echo "4️⃣  Verificando estructura del proyecto..."
echo "----------------------------------------"

directories=("backend" "frontend" "mobile2" "backend/app" "backend/tests" "frontend/src")

for dir in "${directories[@]}"; do
    if [ -d "$dir" ]; then
        echo -e "${GREEN}✓${NC} Directorio $dir existe"
    else
        echo -e "${RED}✗${NC} Directorio $dir NO existe"
    fi
done

echo ""

# 5. Verificar servicios en ejecución
echo "5️⃣  Verificando servicios en ejecución..."
echo "----------------------------------------"

check_port 8000 || BACKEND_DOWN=1
check_port 3000 || FRONTEND_DOWN=1
check_port 5432 || POSTGRES_DOWN=1

echo ""

# 6. Verificar conectividad de servicios
echo "6️⃣  Verificando conectividad de servicios..."
echo "----------------------------------------"

if [ -z "$BACKEND_DOWN" ]; then
    if curl -s http://localhost:8000/health > /dev/null 2>&1; then
        echo -e "${GREEN}✓${NC} Backend API responde correctamente"
        HEALTH=$(curl -s http://localhost:8000/health | grep -o '"status":"[^"]*"' | cut -d'"' -f4)
        echo -e "  Estado: ${GREEN}$HEALTH${NC}"
    else
        echo -e "${RED}✗${NC} Backend API no responde"
    fi
else
    echo -e "${YELLOW}⚠${NC} Backend no está corriendo (no se puede verificar)"
fi

if [ -z "$FRONTEND_DOWN" ]; then
    if curl -s http://localhost:3000 > /dev/null 2>&1; then
        echo -e "${GREEN}✓${NC} Frontend responde correctamente"
    else
        echo -e "${RED}✗${NC} Frontend no responde"
    fi
else
    echo -e "${YELLOW}⚠${NC} Frontend no está corriendo (no se puede verificar)"
fi

echo ""

# 7. Verificar dependencias de Python
echo "7️⃣  Verificando dependencias de Python..."
echo "----------------------------------------"

if [ -f "backend/requirements.txt" ]; then
    cd backend
    if [ -d "venv" ] || [ -d ".venv" ]; then
        echo -e "${GREEN}✓${NC} Entorno virtual existe"
        
        # Activar venv si existe
        if [ -f "venv/bin/activate" ]; then
            source venv/bin/activate
        elif [ -f ".venv/bin/activate" ]; then
            source .venv/bin/activate
        fi
        
        # Verificar paquetes clave
        PACKAGES=("fastapi" "sqlalchemy" "pytest" "uvicorn")
        for pkg in "${PACKAGES[@]}"; do
            if pip show $pkg > /dev/null 2>&1; then
                VERSION=$(pip show $pkg | grep Version | cut -d' ' -f2)
                echo -e "${GREEN}✓${NC} $pkg ($VERSION)"
            else
                echo -e "${RED}✗${NC} $pkg no instalado"
            fi
        done
    else
        echo -e "${YELLOW}⚠${NC} No se encontró entorno virtual"
    fi
    cd ..
fi

echo ""

# 8. Verificar dependencias de Node
echo "8️⃣  Verificando dependencias de Node..."
echo "----------------------------------------"

if [ -d "frontend/node_modules" ]; then
    echo -e "${GREEN}✓${NC} Frontend - node_modules existe"
else
    echo -e "${YELLOW}⚠${NC} Frontend - node_modules NO existe (ejecutar npm install)"
fi

if [ -d "mobile2/node_modules" ]; then
    echo -e "${GREEN}✓${NC} Mobile2 - node_modules existe"
else
    echo -e "${YELLOW}⚠${NC} Mobile2 - node_modules NO existe (ejecutar npm install)"
fi

echo ""

# 9. Resumen
echo "========================================"
echo "📊 RESUMEN"
echo "========================================"

ERRORS=0
WARNINGS=0

[ ! -z "$PYTHON_MISSING" ] && ((ERRORS++))
[ ! -z "$NODE_MISSING" ] && ((ERRORS++))
[ ! -z "$DOCKER_MISSING" ] && ((WARNINGS++))
[ ! -z "$BACKEND_DOWN" ] && ((WARNINGS++))
[ ! -z "$FRONTEND_DOWN" ] && ((WARNINGS++))
[ ! -z "$POSTGRES_DOWN" ] && ((WARNINGS++))

if [ $ERRORS -eq 0 ] && [ $WARNINGS -eq 0 ]; then
    echo -e "${GREEN}✓ Todo está correcto!${NC}"
    echo "El sistema está listo para usar."
elif [ $ERRORS -eq 0 ]; then
    echo -e "${YELLOW}⚠ $WARNINGS advertencias encontradas${NC}"
    echo "El sistema puede funcionar pero hay algunos servicios que no están corriendo."
else
    echo -e "${RED}✗ $ERRORS errores encontrados${NC}"
    echo "Por favor, instala las dependencias faltantes antes de continuar."
fi

echo ""
echo "Para iniciar los servicios:"
echo "  1. Con Docker: docker-compose up"
echo "  2. Manual: Seguir instrucciones en README.md"
echo ""
