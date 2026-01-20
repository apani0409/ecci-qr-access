# 🏗️ ARQUITECTURA REFACTORIZADA - ECCI Control Mobile

## ✅ CAMBIOS IMPLEMENTADOS

### 1. **Estructura de Servicios Limpia**

```
src/services/
├── authManager.js      # Gestión centralizada de autenticación
├── apiClient.js        # Cliente HTTP con interceptores
├── index.js            # Servicios de dominio (devices, users, access)
└── storageManager.js   # Gestión de almacenamiento multiplataforma
```

### 2. **Separación de Responsabilidades**

#### AuthManager (`authManager.js`)
- **Responsabilidad**: Autenticación de usuarios
- **Métodos**:
  - `login(email, password)` - Iniciar sesión
  - `register(email, password, fullName, studentId)` - Registro
  - `logout()` - Cerrar sesión
  - `getToken()` - Obtener token actual
  - `isAuthenticated()` - Verificar si está autenticado
  - `getCurrentUser()` - Obtener datos del usuario

#### APIClient (`apiClient.js`)
- **Responsabilidad**: Cliente HTTP configurado
- **Características**:
  - Interceptores de request (agrega token automáticamente)
  - Interceptores de response (maneja errores 401/403)
  - Logging de todas las peticiones
  - Timeout configurado
  - Manejo global de errores

#### StorageManager (`storageManager.js`)
- **Responsabilidad**: Almacenamiento multiplataforma
- **Características**:
  - Web: usa localStorage
  - Mobile: usa SecureStore
  - Manejo de errores robusto
  - Logging detallado

#### Domain Services (`index.js`)
- **deviceService**: CRUD de dispositivos
- **userService**: Gestión de perfil
- **accessService**: Registros de acceso

### 3. **Flujo de Autenticación**

```
┌─────────────┐
│  LoginScreen│
└──────┬──────┘
       │
       ├─► AuthManager.login(email, pass)
       │   │
       │   ├─► POST /auth/login (sin token)
       │   │   └─► Recibe: { access_token, user }
       │   │
       │   └─► StorageManager.setItem('authToken', token)
       │
       └─► App.js detecta cambio (polling cada 2s)
           └─► Navega automáticamente a Home
```

### 4. **Flujo de Peticiones Autenticadas**

```
┌──────────────┐
│ DevicesScreen│
└──────┬───────┘
       │
       ├─► deviceService.getDevices()
       │   │
       │   └─► APIClient.get('/devices')
       │       │
       │       ├─► Interceptor Request
       │       │   ├─► StorageManager.getItem('authToken')
       │       │   └─► Agrega header: Authorization: Bearer <token>
       │       │
       │       ├─► HTTP GET /devices
       │       │   └─► Backend valida token
       │       │
       │       └─► Interceptor Response
       │           └─► Si 401/403: limpia storage
       │
       └─► Muestra dispositivos
```

### 5. **Ventajas de la Nueva Arquitectura**

#### ✅ Mantenibilidad
- Código organizado por responsabilidades
- Fácil de entender y modificar
- Cada módulo tiene un propósito claro

#### ✅ Escalabilidad
- Fácil agregar nuevos servicios
- Preparado para:
  - Cache (agregar layer de cache en APIClient)
  - Rate limiting (interceptor de request)
  - Retry logic (interceptor de response)
  - Offline mode (detectar en StorageManager)

#### ✅ Debugging
- Logs consistentes con prefijos `[Auth]`, `[API]`, `[Storage]`
- Fácil rastrear el flujo de peticiones
- Errores descriptivos

#### ✅ Testing
- Cada módulo es independiente y testeable
- Fácil mockear servicios
- Sin dependencias circulares

### 6. **Preparado para Producción**

La arquitectura está lista para agregar:

#### Cache
```javascript
// En APIClient.js
class APIClient {
  constructor() {
    this.cache = new Map();
  }
  
  async get(url, config = {}) {
    if (config.cache && this.cache.has(url)) {
      return this.cache.get(url);
    }
    
    const response = await this.client.get(url, config);
    
    if (config.cache) {
      this.cache.set(url, response);
    }
    
    return response;
  }
}
```

#### Rate Limiting
```javascript
// En APIClient.js - Request Interceptor
async (config) => {
  await this.rateLimiter.checkLimit();
  // ... resto del código
}
```

#### Load Balancer
```javascript
// En Config
const API_SERVERS = [
  'http://api1.ecci.ucr.ac.cr',
  'http://api2.ecci.ucr.ac.cr',
  'http://api3.ecci.ucr.ac.cr',
];

class APIClient {
  constructor() {
    this.serverIndex = 0;
    this.baseURL = this.getNextServer();
  }
  
  getNextServer() {
    this.serverIndex = (this.serverIndex + 1) % API_SERVERS.length;
    return API_SERVERS[this.serverIndex];
  }
}
```

#### Retry Logic
```javascript
// En APIClient.js - Response Interceptor
async (error) => {
  const config = error.config;
  
  if (!config || !config.retry) {
    return Promise.reject(error);
  }
  
  config.retry -= 1;
  
  if (config.retry > 0) {
    await new Promise(resolve => setTimeout(resolve, 1000));
    return this.client.request(config);
  }
  
  return Promise.reject(error);
}
```

### 7. **Próximos Pasos para Producción**

1. **Backend**:
   - [ ] Deploy en servidor (AWS, DigitalOcean, etc.)
   - [ ] Configurar HTTPS
   - [ ] Configurar CORS para dominio de producción
   - [ ] PostgreSQL en producción
   - [ ] Backups automáticos

2. **Mobile App**:
   - [ ] Build con EAS: `eas build --platform android`
   - [ ] Actualizar API_BASE_URL a dominio de producción
   - [ ] Configurar notificaciones push (Expo Notifications)
   - [ ] Analytics (Amplitude, Mixpanel)
   - [ ] Error tracking (Sentry)

3. **Monitoreo**:
   - [ ] Logs centralizados (Datadog, Loggly)
   - [ ] Métricas de rendimiento
   - [ ] Alertas de errores

### 8. **Comandos Útiles**

```bash
# Desarrollo
cd mobile2
npx expo start

# Build para producción
npx eas build --platform android
npx eas build --platform ios

# Test del backend
./mobile2/test-login.sh

# Ver estado
./mobile2/status.sh
```

## 🎯 RESUMEN

✅ Arquitectura limpia y modular
✅ Código mantenible y escalable
✅ Preparado para producción
✅ Fácil de extender con nuevas features
✅ Logging y debugging mejorados
✅ Manejo robusto de errores
✅ Multiplataforma (Web + Mobile)

**La aplicación ahora sigue las mejores prácticas de la industria y está lista para ser usada en la ECCI.**
