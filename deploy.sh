#!/bin/bash
# Script de deploy a producción

echo "🚀 Iniciando deploy a producción..."

# Configuración
DEPLOY_PATH="/var/www/ecci-control"
BACKEND_PORT=8000
FRONTEND_PORT=3000
DOMAIN="your-domain.com"

# Colores
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m'

# 1. Pull del repositorio
echo "Actualizando código..."
cd $DEPLOY_PATH
git pull origin main

# 2. Backend
echo "Actualizando backend..."
cd backend
pip install -r requirements.txt -q
alembic upgrade head
systemctl restart ecci-backend

# 3. Frontend
echo "Actualizando frontend..."
cd ../frontend
npm install -q
npm run build
cp -r dist/* /var/www/html/ecci-control/

# 4. Recargar nginx
echo "Recargar nginx..."
systemctl reload nginx

echo -e "${GREEN}✅ Deploy completado${NC}"
echo "API: https://$DOMAIN"
echo "Frontend: https://$DOMAIN"
