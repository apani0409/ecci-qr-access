#!/bin/bash
# Ejemplos de uso de la API ECCI Control

API_URL="http://localhost:8000"
TOKEN=""

echo "🚀 Ejemplos de API ECCI Control"
echo "================================"
echo ""

# Colores
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

# 1. REGISTRO
echo -e "${BLUE}1. REGISTRAR NUEVO USUARIO${NC}"
echo "---"
REGISTER_RESPONSE=$(curl -s -X POST "$API_URL/auth/register" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@university.edu",
    "password": "TestPassword123!",
    "full_name": "Test User",
    "student_id": "2024001"
  }')

echo "Request:"
echo 'POST /auth/register'
echo '{
  "email": "test@university.edu",
  "password": "TestPassword123!",
  "full_name": "Test User",
  "student_id": "2024001"
}'
echo ""
echo "Response:"
echo "$REGISTER_RESPONSE" | jq '.' 2>/dev/null || echo "$REGISTER_RESPONSE"
echo ""

# Extraer token
TOKEN=$(echo "$REGISTER_RESPONSE" | jq -r '.access_token' 2>/dev/null)

if [ -z "$TOKEN" ] || [ "$TOKEN" == "null" ]; then
    echo -e "${YELLOW}⚠️  No se pudo obtener token de registro, intentando login...${NC}"
    LOGIN_RESPONSE=$(curl -s -X POST "$API_URL/auth/login" \
      -H "Content-Type: application/json" \
      -d '{
        "email": "juan@university.edu",
        "password": "SecurePassword123!"
      }')
    TOKEN=$(echo "$LOGIN_RESPONSE" | jq -r '.access_token' 2>/dev/null)
fi

echo -e "${GREEN}✓ Token obtenido${NC}"
echo ""

# 2. LOGIN
echo -e "${BLUE}2. LOGIN${NC}"
echo "---"
echo "Request:"
echo 'POST /auth/login'
echo '{
  "email": "juan@university.edu",
  "password": "SecurePassword123!"
}'
echo ""
echo "Response:"
curl -s -X POST "$API_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "juan@university.edu",
    "password": "SecurePassword123!"
  }' | jq '.'
echo ""

# 3. OBTENER PERFIL
echo -e "${BLUE}3. OBTENER PERFIL ACTUAL${NC}"
echo "---"
echo "Request:"
echo 'GET /auth/me'
echo "Authorization: Bearer \$TOKEN"
echo ""
echo "Response:"
curl -s -X GET "$API_URL/auth/me" \
  -H "Authorization: Bearer $TOKEN" | jq '.'
echo ""

# 4. LISTAR DISPOSITIVOS
echo -e "${BLUE}4. LISTAR DISPOSITIVOS${NC}"
echo "---"
echo "Request:"
echo 'GET /devices/'
echo "Authorization: Bearer \$TOKEN"
echo ""
echo "Response:"
DEVICES=$(curl -s -X GET "$API_URL/devices/" \
  -H "Authorization: Bearer $TOKEN")
echo "$DEVICES" | jq '.'
echo ""

# 5. CREAR DISPOSITIVO
echo -e "${BLUE}5. CREAR NUEVO DISPOSITIVO${NC}"
echo "---"
echo "Request:"
echo 'POST /devices/'
echo "Authorization: Bearer \$TOKEN"
echo '{
  "name": "API Test Device",
  "device_type": "laptop",
  "serial_number": "API-TEST-001"
}'
echo ""
echo "Response:"
DEVICE_RESPONSE=$(curl -s -X POST "$API_URL/devices/" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "API Test Device",
    "device_type": "laptop",
    "serial_number": "API-TEST-001"
  }')
echo "$DEVICE_RESPONSE" | jq '.'
echo ""

# Extraer QR data
QR_DATA=$(echo "$DEVICE_RESPONSE" | jq -r '.device.qr_data' 2>/dev/null)
echo -e "${GREEN}✓ QR Data: $QR_DATA${NC}"
echo ""

# 6. ESCANEAR QR
echo -e "${BLUE}6. ESCANEAR QR (REGISTRAR ACCESO)${NC}"
echo "---"
echo "Request:"
echo 'POST /access/scan'
echo '{
  "qr_data": "'$QR_DATA'",
  "access_type": "entrada",
  "location": "Puerta Principal"
}'
echo ""
echo "Response:"
curl -s -X POST "$API_URL/access/scan" \
  -H "Content-Type: application/json" \
  -d '{
    "qr_data": "'$QR_DATA'",
    "access_type": "entrada",
    "location": "Puerta Principal"
  }' | jq '.'
echo ""

# 7. OBTENER HISTORIAL DE ACCESOS
echo -e "${BLUE}7. OBTENER HISTORIAL DE ACCESOS${NC}"
echo "---"
echo "Request:"
echo 'GET /access/history'
echo "Authorization: Bearer \$TOKEN"
echo ""
echo "Response:"
curl -s -X GET "$API_URL/access/history?limit=5" \
  -H "Authorization: Bearer $TOKEN" | jq '.'
echo ""

# 8. OBTENER QR DEL DISPOSITIVO
echo -e "${BLUE}8. OBTENER QR DEL DISPOSITIVO${NC}"
echo "---"
DEVICE_ID=$(echo "$DEVICE_RESPONSE" | jq -r '.device.id' 2>/dev/null)
echo "Request:"
echo 'GET /devices/'$DEVICE_ID'/qr'
echo "Authorization: Bearer \$TOKEN"
echo ""
echo "Response:"
curl -s -X GET "$API_URL/devices/$DEVICE_ID/qr" \
  -H "Authorization: Bearer $TOKEN" | jq '.'
echo ""

# 9. HEALTH CHECK
echo -e "${BLUE}9. HEALTH CHECK${NC}"
echo "---"
echo "Request:"
echo 'GET /health'
echo ""
echo "Response:"
curl -s -X GET "$API_URL/health" | jq '.'
echo ""

echo -e "${GREEN}================================${NC}"
echo -e "${GREEN}✅ Ejemplos de API completados${NC}"
echo -e "${GREEN}================================${NC}"
echo ""
echo "Documentación interactiva: $API_URL/docs"
echo "ReDoc: $API_URL/redoc"
