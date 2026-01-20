#!/bin/bash

# ECCI Control Mobile - Guía de Inicio Rápido

echo "🚀 ECCI Control Mobile - React Native + Expo"
echo ""
echo "Iniciando configuración..."
echo ""

# Verificar si npm está instalado
if ! command -v npm &> /dev/null; then
    echo "❌ npm no está instalado. Por favor instala Node.js desde: https://nodejs.org"
    exit 1
fi

echo "✅ npm encontrado"
echo ""

# Instalar dependencias
echo "📦 Instalando dependencias..."
npm install

if [ $? -ne 0 ]; then
    echo "❌ Error durante la instalación de dependencias"
    exit 1
fi

echo ""
echo "✅ Dependencias instaladas"
echo ""

# Mostrar opciones
echo "🎯 Opciones de inicio:"
echo ""
echo "1. npm start      → Iniciar Expo (modo desarrollo interactivo)"
echo "2. npm run web    → Iniciar en navegador web"
echo "3. npm run android → Ejecutar en Android (requiere Android Studio)"
echo "4. npm run ios    → Ejecutar en iOS (requiere Xcode)"
echo ""
echo "Para ver la app en tu dispositivo físico:"
echo "  1. Descarga 'Expo Go' desde App Store o Google Play"
echo "  2. Escanea el código QR que aparece en la terminal"
echo ""
echo "¡Listo para usar! 🎉"
