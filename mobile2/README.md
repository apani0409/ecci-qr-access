# ECCI Control Mobile - React Native + Expo

Aplicación móvil moderna con React Native y Expo para el sistema de control de acceso.

## Inicio Rápido

### Instalación

```bash
npm install
# o
yarn install
```

### Ejecutar en Expo

```bash
# Para desarrollo interactivo
npm start
# o
expo start

# Luego selecciona:
# - 'a' para Android
# - 'i' para iOS
# - 'w' para web
```

## Características

- Autenticación con JWT
- Gestión de dispositivos
- Escaneo de códigos QR
- Historial de accesos
- Perfil de usuario
- Interfaz moderna con diseño Figma

## Estructura del Proyecto

```
mobile2/
├── src/
│   ├── screens/              # Pantallas principales
│   │   ├── LoginScreen.js
│   │   ├── SignupScreen.js
│   │   ├── HomeScreen.js
│   │   ├── DevicesScreen.js
│   │   ├── DeviceDetailScreen.js
│   │   ├── ScanQRScreen.js
│   │   ├── AccessHistoryScreen.js
│   │   └── ProfileScreen.js
│   ├── components/           # Componentes reutilizables
│   │   ├── Button.js
│   │   ├── Input.js
│   │   ├── DeviceCard.js
│   │   └── Header.js
│   ├── services/             # Servicios API
│   │   └── api.js
│   ├── navigation/           # Navegación
│   │   └── RootNavigator.js
│   └── constants/            # Configuración y tema
│       ├── theme.js
│       └── api.js
├── App.js                    # Componente raíz
├── index.js                  # Punto de entrada
├── app.json                  # Config de Expo
├── package.json
└── README.md
```

## Tema y Colores

Los colores están basados en el diseño de Figma:

- **Primario**: #3366FF
- **Secundario**: #FFC107
- **Error**: #FF3B30
- **Éxito**: #34C759

## Configuración

Actualiza la URL base de API en `src/constants/api.js`:

```javascript
const API_BASE_URL = "http://localhost:8000";
// Para dispositivo físico: http://192.168.x.x:8000
```

## API Integration

La app se conecta a los endpoints del backend FastAPI:

- `POST /api/auth/login`
- `POST /api/auth/register`
- `GET /api/devices`
- `GET /api/access/records`
- etc.

## Build & Deploy

### Android

```bash
eas build --platform android
```

### iOS

```bash
eas build --platform ios
```

## Soporte

Para problemas o preguntas, revisa:
- Documentación de Expo: https://docs.expo.dev
- Documentación de React Native: https://reactnative.dev
