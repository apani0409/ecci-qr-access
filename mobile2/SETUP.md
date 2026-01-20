Expo:
  app.json:
    description: Aplicación mobile con React Native y Expo
    privacy: unlisted
    platforms:
      - ios
      - android
      - web
    
Estructura:
  ✅ src/screens/         - 8 pantallas principales
  ✅ src/components/      - 4 componentes reutilizables
  ✅ src/services/        - Servicio API con Axios
  ✅ src/navigation/      - Stack y Tab navigation
  ✅ src/constants/       - Tema y configuración
  
Pantallas Implementadas:
  ✅ LoginScreen         - Login con email/contraseña
  ✅ SignupScreen        - Registro de nuevos usuarios
  ✅ HomeScreen          - Inicio con menú principal
  ✅ DevicesScreen       - Lista de dispositivos
  ✅ DeviceDetailScreen  - Detalles y QR del dispositivo
  ✅ ScanQRScreen        - Escaneo de códigos QR
  ✅ AccessHistoryScreen - Historial de accesos
  ✅ ProfileScreen       - Perfil de usuario

Componentes:
  ✅ Button              - Botón reutilizable con variantes
  ✅ Input               - Input reutilizable
  ✅ DeviceCard          - Tarjeta de dispositivo
  ✅ Header              - Encabezado de pantalla

API Services:
  ✅ AuthService         - Login, Register, Logout
  ✅ UserService         - Perfil de usuario
  ✅ DeviceService       - CRUD de dispositivos y QR
  ✅ AccessService       - Registro de accesos

Estado:
  ✅ Autenticación con JWT y SecureStore
  ✅ Tokens persistentes
  ✅ Interceptores de API
  ✅ Validación de flujos

Diseño:
  ✅ Basado en Figma
  ✅ Colores primarios y secundarios
  ✅ Espaciado consistente
  ✅ Bordes y sombras
  ✅ Responsive (móvil y tablet)

Para visualizar:
  $ npm install
  $ npm start
  Selecciona: 'w' para web preview, 'a' para Android, 'i' para iOS
