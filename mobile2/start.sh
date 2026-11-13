#!/bin/bash

# Script para iniciar ECCI Control Mobile completo

echo "Iniciando ECCI Control System..."
echo ""

# Colores
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Directorio del proyecto
PROJECT_DIR="/home/sandro/Dev/Projects/ecci-control"
cd "$PROJECT_DIR"

# 1. Iniciar Backend
echo -e "${BLUE}Iniciando Backend FastAPI...${NC}"
cd "$PROJECT_DIR/backend"

# Verificar si ya está corriendo
if lsof -i :8000 -t >/dev/null 2>&1; then
    echo -e "${YELLOW}Backend ya está corriendo en puerto 8000${NC}"
else
    source venv/bin/activate
    uvicorn app.main:app --reload --host 0.0.0.0 --port 8000 > /tmp/backend.log 2>&1 &
    BACKEND_PID=$!
    sleep 3
    
    if curl -s http://192.168.110.126:8000/docs > /dev/null; then
        echo -e "${GREEN}Backend iniciado correctamente${NC}"
        echo -e "   URL: http://192.168.110.126:8000"
        echo -e "   Docs: http://192.168.110.126:8000/docs"
    else
        echo -e "${YELLOW} Backend podría tener problemas. Revisa /tmp/backend.log${NC}"
    fi
fi

echo ""

# 2. Iniciar Expo
echo -e "${BLUE}Iniciando Expo Metro Bundler...${NC}"
cd "$PROJECT_DIR/mobile2"

# Limpiar puerto 8081 si está ocupado
if lsof -i :8081 -t >/dev/null 2>&1; then
    echo -e "${YELLOW}Limpiando puerto 8081...${NC}"
    lsof -i :8081 -t | xargs kill -9 2>/dev/null
    sleep 2
fi

# Iniciar Expo
npx expo start --clear > /tmp/expo.log 2>&1 &
EXPO_PID=$!

echo -e "${GREEN}Esperando a que Expo inicie...${NC}"
sleep 10

# Verificar Expo
if curl -s http://localhost:8081 > /dev/null; then
    echo -e "${GREEN}Expo iniciado correctamente${NC}"
    echo ""
    echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${GREEN}   SISTEMA LISTO PARA USAR${NC}"
    echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo ""
    echo -e "${BLUE}Para usar en tu celular:${NC}"
    echo "   1. Descarga 'Expo Go' desde tu tienda de apps"
    echo "   2. Abre la terminal de Expo (este proceso)"
    echo "   3. Presiona 'r' para ver el QR code"
    echo "   4. Escanea el QR con Expo Go"
    echo ""
    echo -e "${BLUE}Para usar en navegador web:${NC}"
    echo "   URL: http://localhost:8081"
    echo "   O presiona 'w' en la terminal de Expo"
    echo ""
    echo -e "${BLUE}Credenciales de prueba:${NC}"
    echo "   Email: test@ecci.ucr.ac.cr"
    echo "   Password: test12345"
    echo ""
    echo -e "${BLUE}O crea una nueva cuenta con:${NC}"
    echo "   - Nombre: mínimo 3 caracteres"
    echo "   - Carné: mínimo 5 caracteres"
    echo "   - Email: formato válido"
    echo "   - Password: mínimo 8 caracteres"
    echo ""
    echo -e "${YELLOW}Logs:${NC}"
    echo "   Backend: tail -f /tmp/backend.log"
    echo "   Expo: tail -f /tmp/expo.log"
    echo ""
    echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo ""
    
    # Esperar un poco más y luego mostrar el comando de Expo
    sleep 2
    echo -e "${BLUE}Abriendo ventana de Expo...${NC}"
    echo "Presiona Ctrl+C aquí cuando termines (esto NO cerrará Expo)"
    echo ""
    
    # Mostrar la interfaz de Expo
    cd "$PROJECT_DIR/mobile2"
    tail -f /tmp/expo.log | grep -E "(QR|Metro|Logs|http|exp://)"
    
else
    echo -e "${YELLOW} Expo podría tener problemas. Revisa /tmp/expo.log${NC}"
    echo "Intenta manualmente: cd mobile2 && npx expo start"
fi
