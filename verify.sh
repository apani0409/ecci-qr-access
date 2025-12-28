#!/bin/bash
# Script para verificar que el proyecto está completamente configurado

echo "🔍 Verificando estructura del proyecto ECCI Control..."
echo ""

# Colores
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

TOTAL=0
FOUND=0

check_file() {
    TOTAL=$((TOTAL + 1))
    if [ -f "$1" ]; then
        echo -e "${GREEN}✓${NC} $1"
        FOUND=$((FOUND + 1))
    else
        echo -e "${RED}✗${NC} $1 (FALTA)"
    fi
}

check_dir() {
    TOTAL=$((TOTAL + 1))
    if [ -d "$1" ]; then
        echo -e "${GREEN}✓${NC} $1/"
        FOUND=$((FOUND + 1))
    else
        echo -e "${RED}✗${NC} $1/ (FALTA)"
    fi
}

echo -e "${BLUE}BACKEND${NC}"
echo "────────"
check_dir "backend"
check_dir "backend/app"
check_dir "backend/app/api/endpoints"
check_dir "backend/app/models"
check_dir "backend/app/schemas"
check_dir "backend/app/services"
check_dir "backend/app/core"
check_dir "backend/app/utils"
check_dir "backend/alembic"
check_dir "backend/alembic/versions"
check_file "backend/app/main.py"
check_file "backend/app/api/endpoints/auth.py"
check_file "backend/app/api/endpoints/devices.py"
check_file "backend/app/api/endpoints/access.py"
check_file "backend/app/models/user.py"
check_file "backend/app/models/device.py"
check_file "backend/app/models/access_record.py"
check_file "backend/app/schemas/user.py"
check_file "backend/app/schemas/device.py"
check_file "backend/app/schemas/access_record.py"
check_file "backend/app/services/user_service.py"
check_file "backend/app/services/device_service.py"
check_file "backend/app/services/access_service.py"
check_file "backend/app/services/qr_service.py"
check_file "backend/app/core/config.py"
check_file "backend/app/core/database.py"
check_file "backend/app/core/security.py"
check_file "backend/requirements.txt"
check_file "backend/.env.example"
check_file "backend/init_db.py"
check_file "backend/Dockerfile"
check_file "backend/README.md"
echo ""

echo -e "${BLUE}FRONTEND${NC}"
echo "─────────"
check_dir "frontend"
check_dir "frontend/src"
check_dir "frontend/src/pages"
check_dir "frontend/src/components"
check_dir "frontend/src/services"
check_dir "frontend/src/stores"
check_dir "frontend/src/styles"
check_dir "frontend/public"
check_file "frontend/src/App.jsx"
check_file "frontend/src/main.jsx"
check_file "frontend/index.html"
check_file "frontend/src/pages/LoginPage.jsx"
check_file "frontend/src/pages/RegisterPage.jsx"
check_file "frontend/src/pages/HomePage.jsx"
check_file "frontend/src/pages/DevicesPage.jsx"
check_file "frontend/src/pages/ScanPage.jsx"
check_file "frontend/src/pages/ProfilePage.jsx"
check_file "frontend/src/services/api.js"
check_file "frontend/src/services/auth.js"
check_file "frontend/src/services/device.js"
check_file "frontend/src/services/access.js"
check_file "frontend/src/stores/authStore.js"
check_file "frontend/src/styles/index.css"
check_file "frontend/package.json"
check_file "frontend/vite.config.js"
check_file "frontend/tailwind.config.js"
check_file "frontend/postcss.config.js"
check_file "frontend/Dockerfile"
check_file "frontend/README.md"
echo ""

echo -e "${BLUE}DOCUMENTACIÓN${NC}"
echo "──────────────"
check_file "README.md"
check_file "DEVELOPMENT.md"
check_file "PROJECT_SUMMARY.txt"
check_file "API_EXAMPLES.sh"
check_file "setup.sh"
check_file "deploy.sh"
check_file ".gitignore"
echo ""

echo -e "${BLUE}DEVOPS${NC}"
echo "──────"
check_file "docker-compose.yml"
check_file "postman_collection.json"
echo ""

echo -e "${BLUE}WIREFRAMES${NC}"
echo "──────────"
check_dir "wireframes"
check_file "wireframes/file1.png"
check_file "wireframes/file2.png"
echo ""

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
PERCENTAGE=$((FOUND * 100 / TOTAL))
echo -e "${BLUE}RESUMEN:${NC} $FOUND/$TOTAL archivos/carpetas verificadas ($PERCENTAGE%)"
echo ""

if [ $FOUND -eq $TOTAL ]; then
    echo -e "${GREEN}✅ PROYECTO COMPLETAMENTE CONFIGURADO${NC}"
    echo ""
    echo "🚀 Para comenzar:"
    echo ""
    echo "  Backend:"
    echo "    cd backend"
    echo "    python -m venv venv"
    echo "    source venv/bin/activate"
    echo "    pip install -r requirements.txt"
    echo "    alembic upgrade head"
    echo "    python init_db.py"
    echo "    uvicorn app.main:app --reload"
    echo ""
    echo "  Frontend:"
    echo "    cd frontend"
    echo "    npm install"
    echo "    npm run dev"
    echo ""
    echo "📱 Acceso:"
    echo "    API:      http://localhost:8000"
    echo "    Docs:     http://localhost:8000/docs"
    echo "    Frontend: http://localhost:3000"
else
    echo -e "${RED}⚠️  Faltan algunos archivos (${RED}$((TOTAL - FOUND))${NC} de $TOTAL)${NC}"
    echo "Verifica que todos los archivos estén presentes antes de ejecutar."
fi
echo ""
