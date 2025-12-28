# ECCI Control Frontend

Frontend para el Sistema de Control de Acceso y Registro de Dispositivos para Estudiantes Universitarios.

## 🚀 Stack Tecnológico

- **Framework**: React 18.2
- **Routing**: React Router v6
- **State Management**: Zustand
- **HTTP Client**: Axios
- **CSS**: Tailwind CSS
- **Build Tool**: Vite
- **Icons**: Heroicons

## 📁 Estructura del Proyecto

```
frontend/
├── public/                  # Archivos estáticos
├── src/
│   ├── components/
│   │   ├── Navigation.jsx   # Barra de navegación
│   │   └── ProtectedRoute.jsx # Rutas protegidas
│   ├── pages/
│   │   ├── LoginPage.jsx    # Página de login
│   │   ├── RegisterPage.jsx # Página de registro
│   │   ├── HomePage.jsx     # Página de inicio
│   │   ├── DevicesPage.jsx  # Gestión de dispositivos
│   │   ├── ScanPage.jsx     # Escaneo de QR
│   │   └── ProfilePage.jsx  # Perfil del usuario
│   ├── services/
│   │   ├── api.js           # Configuración de Axios
│   │   ├── auth.js          # Servicios de autenticación
│   │   ├── device.js        # Servicios de dispositivos
│   │   └── access.js        # Servicios de acceso
│   ├── stores/
│   │   └── authStore.js     # Store de autenticación (Zustand)
│   ├── styles/
│   │   └── index.css        # Estilos globales
│   ├── App.jsx              # Componente raíz
│   └── main.jsx             # Punto de entrada
├── index.html               # HTML principal
├── vite.config.js           # Configuración de Vite
├── tailwind.config.js       # Configuración de Tailwind
├── postcss.config.js        # Configuración de PostCSS
├── package.json             # Dependencias
└── README.md                # Este archivo
```

## 📋 Requisitos Previos

- Node.js 16+
- npm o yarn

## 🔧 Instalación

### 1. Navegar a la carpeta frontend

```bash
cd frontend
```

### 2. Instalar dependencias

```bash
npm install
# o
yarn install
```

### 3. Crear archivo .env (opcional)

```bash
echo 'VITE_API_URL=http://localhost:8000' > .env.local
```

## 🚀 Ejecutar en Desarrollo

```bash
npm run dev
```

La aplicación estará disponible en: `http://localhost:3000`

## 📦 Build para Producción

```bash
npm run build
```

Los archivos compilados estarán en la carpeta `dist/`.

## 🔐 Funcionalidades

### 1. Autenticación
- **Login**: Accede con email y contraseña
- **Registro**: Crea una nueva cuenta
- **Logout**: Cierra sesión seguramente

### 2. Gestión de Dispositivos
- **Crear**: Registra nuevos dispositivos
- **Listar**: Visualiza tus dispositivos
- **Ver Detalles**: Accede a la información completa
- **Eliminar**: Borra dispositivos

### 3. Códigos QR
- **Generación Automática**: Se crea un QR único por dispositivo
- **Visualización**: Ve el QR del dispositivo
- **Descarga**: Descarga el código QR como imagen

### 4. Registro de Accesos
- **Escaneo**: Escanea códigos QR
- **Entrada/Salida**: Registra tipo de acceso
- **Ubicación**: Añade ubicación del acceso (opcional)
- **Historial**: Visualiza registro de accesos

### 5. Perfil de Usuario
- **Información Personal**: Visualiza tus datos
- **Estado de Cuenta**: Verifica el estado de tu cuenta
- **Historial**: Acceso rápido a dispositivos y escaneos

## 🎨 Páginas y Flujo

### Flujo de Autenticación
```
/login (si no autenticado) → /register → /home
```

### Navegación Principal
```
/home (inicio)
  ├── /devices (gestión de dispositivos)
  ├── /scan (escaneo de QR)
  └── /profile (perfil)
```

### Página: Login
- Campos: Email, Contraseña
- Acción: Iniciar sesión o ir a registro
- Datos Demo: juan@university.edu / SecurePassword123!

### Página: Registro
- Campos: Nombre, ID Estudiante, Email, Contraseña, Confirmar
- Validación: Contraseña mínima 8 caracteres
- Acción: Crear cuenta e iniciar sesión automáticamente

### Página: Home
- Bienvenida personalizada
- Acceso rápido a Dispositivos
- Acceso rápido a Escaneo
- Información de uso del sistema

### Página: Dispositivos
- Lista de dispositivos registrados
- Formulario para crear nuevo dispositivo
- Vista previa de código QR
- Opción eliminar dispositivo

### Página: Escaneo
- Campo de entrada para códigos QR
- Selector de tipo de acceso (entrada/salida)
- Campo de ubicación (opcional)
- Registro automático de timestamp
- Historial de última acción

### Página: Perfil
- Información personal (solo lectura)
- Estado de la cuenta
- Fecha de registro
- Navegación rápida

## 🔧 Configuración

### Variables de Entorno

Crear archivo `.env.local`:

```env
VITE_API_URL=http://localhost:8000
```

### CORS

El proxy de Vite automaticamente redirige las requests a `/api/*` al backend.

## 📱 Responsividad

La aplicación está completamente optimizada para:
- 📱 Dispositivos móviles (320px+)
- 📱 Tablets (768px+)
- 💻 Desktops (1024px+)

## 🧪 Testing

Para agregar testing, instalar:

```bash
npm install --save-dev vitest @testing-library/react @testing-library/jest-dom
```

## 📝 API Integration

El frontend se conecta con el backend en `http://localhost:8000`.

### Endpoints Principales Utilizados

- `POST /auth/register` - Registro de usuario
- `POST /auth/login` - Login de usuario
- `GET /auth/me` - Obtener usuario actual
- `POST /devices/` - Crear dispositivo
- `GET /devices/` - Listar dispositivos
- `GET /devices/{id}` - Obtener dispositivo
- `PUT /devices/{id}` - Actualizar dispositivo
- `DELETE /devices/{id}` - Eliminar dispositivo
- `GET /devices/{id}/qr` - Obtener QR del dispositivo
- `POST /access/scan` - Escanear QR
- `GET /access/history` - Historial de accesos

## 🚀 Deployment

### Vercel (Recomendado)

```bash
npm install -g vercel
vercel
```

### Netlify

```bash
npm install -g netlify-cli
netlify deploy --prod --dir=dist
```

### Docker

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=0 /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

## 📚 Librerías y Dependencias

- **react**: Librería UI
- **react-dom**: Rendering de React
- **react-router-dom**: Enrutamiento
- **axios**: HTTP client
- **zustand**: State management ligero
- **tailwindcss**: Utilidades CSS
- **@heroicons/react**: Iconos SVG

## 🤝 Contribución

Para contribuir:

1. Crear rama: `git checkout -b feature/nueva-feature`
2. Hacer cambios y commit: `git commit -m "Add: descripción"`
3. Push a rama: `git push origin feature/nueva-feature`
4. Crear Pull Request

## ✉️ Soporte

Para dudas o problemas, contactar al equipo de desarrollo.

---

**Última actualización**: Enero 2024
**Versión**: 1.0.0
