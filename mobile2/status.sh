#!/bin/bash

echo "🎯 ECCI Control - Información del Sistema"
echo "=========================================="
echo ""

# Verificar Backend
echo "📡 BACKEND STATUS:"
if curl -s http://192.168.110.126:8000/docs > /dev/null 2>&1; then
    echo "   ✅ Backend ACTIVO"
    echo "   📍 URL: http://192.168.110.126:8000"
    echo "   📚 Docs: http://192.168.110.126:8000/docs"
else
    echo "   ❌ Backend NO está corriendo"
    echo "   Inicia con: cd backend && source venv/bin/activate && uvicorn app.main:app --reload --host 0.0.0.0 --port 8000"
fi

echo ""

# Verificar Expo
echo "📱 EXPO STATUS:"
if curl -s http://localhost:8081 > /dev/null 2>&1; then
    echo "   ✅ Expo Metro Bundler ACTIVO"
    echo "   🌐 Web: http://localhost:8081"
    echo ""
    echo "   📲 PARA USAR EN TU CELULAR:"
    echo "   1. Descarga 'Expo Go' de tu tienda de apps"
    echo "   2. Ejecuta este comando para ver el QR:"
    echo ""
    echo "      cd /home/sandro/Dev/Projects/ecci-control/mobile2"
    echo "      npx expo start"
    echo ""
    echo "   3. Presiona 'r' para regenerar el QR"
    echo "   4. Escanea el QR con Expo Go"
    echo ""
    echo "   💻 PARA USAR EN NAVEGADOR:"
    echo "      Abre: http://localhost:8081"
    echo ""
else
    echo "   ❌ Expo NO está corriendo"
    echo "   Inicia con: cd mobile2 && npx expo start"
fi

echo ""
echo "✅ VALIDACIONES IMPLEMENTADAS:"
echo "   • Email: debe contener @"
echo "   • Password: mínimo 8 caracteres"
echo "   • Nombre: mínimo 3 caracteres"
echo "   • Carné: mínimo 5 caracteres"
echo ""

echo "📝 EJEMPLO DE REGISTRO:"
echo "   Nombre: Juan Pérez García"
echo "   Carné: B12345"
echo "   Email: juan.perez@ecci.ucr.ac.cr"
echo "   Password: password123"
echo ""

echo "🔑 USUARIO DE PRUEBA CREADO:"
echo "   Email: test@ecci.ucr.ac.cr"
echo "   Password: test12345"
echo ""

echo "=========================================="
