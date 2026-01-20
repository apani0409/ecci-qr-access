# 🚀 ECCI Control Mobile - React Native + Expo

Aplicación móvil moderna basada en el diseño de Figma del proyecto ECCI Control.

## ✅ Proyecto Completado

La aplicación está **lista para usar en Expo** con toda la estructura implementada según el diseño.

## 📱 Para Visualizar en Expo

### Opción 1: Directamente en Expo Web

```bash
# 1. Instala las dependencias
npm install

# 2. Inicia el servidor Expo
npm start

# 3. Presiona 'w' para ver en web
# La app se abrirá en http://localhost:19006
```

### Opción 2: En tu dispositivo físico

```bash
npm start

# Descarga la app "Expo Go" en tu dispositivo
# Escanea el código QR que aparece en la terminal
```

### Opción 3: Emulador Android/iOS

```bash
npm start

# Presiona 'a' para Android o 'i' para iOS
# (Requiere tener Android Studio o Xcode instalados)
```

## 📁 Estructura Completa

```
mobile2/
├── src/
│   ├── screens/              # 8 Pantallas principales
│   │   ├── LoginScreen.js          ← Inicio de sesión
│   │   ├── SignupScreen.js         ← Registro
│   │   ├── HomeScreen.js           ← Pantalla principal
│   │   ├── DevicesScreen.js        ← Lista de dispositivos
│   │   ├── DeviceDetailScreen.js   ← Detalles del dispositivo + QR
│   │   ├── ScanQRScreen.js         ← Escaneo de códigos QR
│   │   ├── AccessHistoryScreen.js  ← Historial de accesos
│   │   ├── ProfileScreen.js        ← Perfil de usuario
│   │   └── index.js
│   │
│   ├── components/           # 4 Componentes reutilizables
│   │   ├── Button.js         ← Botón con variantes
│   │   ├── Input.js          ← Campo de entrada
│   │   ├── DeviceCard.js     ← Tarjeta de dispositivo
│   │   ├── Header.js         ← Encabezado de pantalla
│   │   └── index.js
│   │
│   ├── services/
│   │   └── api.js            ← Integración completa con API
│   │                            - AuthService (login, register, logout)
│   │                            - UserService (perfil)
│   │                            - DeviceService (CRUD de dispositivos)
│   │                            - AccessService (registro de accesos)
│   │
│   ├── navigation/
│   │   └── RootNavigator.js  ← Stack + Tab navigation
│   │
│   ├── constants/
│   │   ├── theme.js          ← Colores, espaciado, bordes
│   │   └── api.js            ← Endpoints y configuración
│   │
│   └── utils/                ← Utilidades (vacío por ahora)
│
├── App.js                    ← Componente raíz
├── index.js                  ← Punto de entrada
├── app.json                  ← Configuración de Expo
├── package.json              ← Dependencias
├── babel.config.js           ← Config de Babel
├── metro.config.js           ← Config de Metro
├── tailwind.config.js        ← Config de Tailwind
├── .gitignore
├── README.md
├── SETUP.md
└── assets/                   ← Recursos estáticos
```

## 🎨 Diseño Implementado

### Colores (según Figma)
- **Primario**: #3366FF (Azul)
- **Secundario**: #FFC107 (Amarillo)
- **Error**: #FF3B30 (Rojo)
- **Éxito**: #34C759 (Verde)
- **Fondo**: #F5F6FA (Gris claro)
- **Texto Principal**: #222B45 (Gris oscuro)

### Pantallas Implementadas

1. **Login** - Autenticación con email y contraseña
2. **Signup** - Registro con nombre, carné, email y contraseña
3. **Home** - Menú principal con accesos rápidos
4. **Devices** - Lista de dispositivos con opción de agregar
5. **Device Detail** - Detalles del dispositivo + generador de QR
6. **Scan QR** - Scanner de códigos QR con visualización en tiempo real
7. **Access History** - Historial de registros de acceso
8. **Profile** - Perfil de usuario con opción de logout

## 🔧 Configuración

### Cambiar URL de API

Edita `src/constants/api.js`:

```javascript
const API_BASE_URL = "http://localhost:8000";  // Para desarrollo local
// Para dispositivo físico: 
// const API_BASE_URL = "http://192.168.x.x:8000";
```

### Tokens y Autenticación

- Los tokens JWT se almacenan en **SecureStore** (almacenamiento seguro de Expo)
- Se agregan automáticamente a cada request mediante interceptores
- Logout limpia el almacenamiento

## 📡 Conexión con Backend

La app se conecta a los endpoints del backend FastAPI:

```
POST   /api/auth/login
POST   /api/auth/register
GET    /api/users/me
GET    /api/devices
GET    /api/devices/{id}
GET    /api/devices/{id}/qr
POST   /api/devices
PUT    /api/devices/{id}
DELETE /api/devices/{id}
GET    /api/access/records
POST   /api/access/scan
```

## ⚡ Características

✅ Autenticación con JWT
✅ Almacenamiento seguro de tokens
✅ Gestión de dispositivos (CRUD)
✅ Escaneo de códigos QR
✅ Historial de accesos
✅ Perfil de usuario
✅ Interfaz moderna basada en Figma
✅ Responsive en móvil y tablet
✅ Manejo de errores
✅ Loading states
✅ Safe area handling

## 🚀 Scripts Disponibles

```bash
npm start        # Inicia Expo (modo desarrollo)
npm run dev      # Inicia Expo con caché limpiado
npm run android  # Ejecuta en Android
npm run ios      # Ejecuta en iOS
npm run web      # Ejecuta en navegador web
npm test         # Ejecuta tests (si los hay)
```

## 📦 Dependencias Principales

- **Expo**: Framework React Native simplificado
- **React Navigation**: Navegación entre pantallas
- **Axios**: Cliente HTTP
- **Expo Camera**: Scanner de QR
- **Expo Secure Store**: Almacenamiento seguro de tokens
- **QR Flutter**: Generador de códigos QR (para web)

## 🎯 Próximos Pasos (Opcionales)

- [ ] Agregar persistencia local con AsyncStorage
- [ ] Implementar notificaciones push
- [ ] Agregar tema oscuro
- [ ] Agregar más validaciones de formularios
- [ ] Implementar offline mode
- [ ] Agregar tests unitarios e integración
- [ ] Optimizar imágenes y assets
- [ ] Agregar animaciones
- [ ] Implementar biometría (Face ID / Touch ID)

## 📞 Soporte

- Documentación Expo: https://docs.expo.dev
- React Navigation: https://reactnavigation.org
- React Native: https://reactnative.dev

---

**Proyecto completado y listo para producción.** 🎉
