# 📱 Cómo usar ECCI Control Mobile

## 🚀 Estado del Sistema

### Backend (FastAPI)
- **URL**: http://192.168.110.126:8000
- **Documentación**: http://192.168.110.126:8000/docs
- **Estado**: ✅ Corriendo en puerto 8000

### Frontend Mobile (Expo)
- **URL Web**: http://localhost:8081
- **Metro Bundler**: ✅ Corriendo en puerto 8081
- **Estado**: ✅ Listo para usar

---

## 📲 Probar en tu Celular

### Opción 1: Usando Expo Go (Recomendado)

1. **Descarga Expo Go** desde la tienda de tu celular:
   - **Android**: [Google Play Store](https://play.google.com/store/apps/details?id=host.exp.exponent)
   - **iOS**: [App Store](https://apps.apple.com/app/expo-go/id982107779)

2. **Escanea el QR Code**:
   - En la terminal donde está corriendo Expo, deberías ver un QR code
   - Si no lo ves, presiona `r` en la terminal para regenerarlo
   - Alternativamente, usa este comando:
     ```bash
     cd /home/sandro/Dev/Projects/ecci-control/mobile2
     npx expo start
     ```

3. **Abre la app**:
   - Android: Abre Expo Go y escanea el QR desde la app
   - iOS: Abre la cámara nativa y escanea el QR

### Opción 2: Probar en el Navegador Web

1. **Abre tu navegador** en: http://localhost:8081
2. O presiona `w` en la terminal de Expo para abrir automáticamente

---

## ✅ Validaciones Implementadas

### Registro de Usuario
- ✅ Nombre completo: mínimo 3 caracteres
- ✅ Carné estudiantil: mínimo 5 caracteres
- ✅ Email: debe ser válido (contener @)
- ✅ Contraseña: **mínimo 8 caracteres** (requisito del backend)

### Ejemplo de Credenciales Válidas
```
Nombre: Juan Pérez García
Carné: B12345
Email: juan.perez@ecci.ucr.ac.cr
Contraseña: mipassword123
```

---

## 🔧 Mejoras Implementadas

### 1. Manejo de Errores Mejorado
- ✅ Validación en frontend antes de enviar
- ✅ Mensajes de error específicos y claros
- ✅ Feedback visual inmediato al usuario

### 2. Compatibilidad
- ✅ Funciona en Web (localhost)
- ✅ Funciona en Mobile (Expo Go)
- ✅ Storage adaptativo (localStorage web / SecureStore mobile)

### 3. Configuración de Red
- ✅ Backend accesible desde cualquier dispositivo en la red local
- ✅ IP configurada: 192.168.110.126
- ✅ Sin problemas de CORS

---

## 🐛 Solución de Problemas

### "Error en el registro"
**Causa**: Contraseña muy corta
**Solución**: Usar mínimo 8 caracteres

### "Error al conectar con el servidor"
**Causa**: Backend no está corriendo o red incorrecta
**Solución**: 
```bash
# Verificar backend
curl http://192.168.110.126:8000/docs

# Reiniciar backend si es necesario
cd backend
source venv/bin/activate
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### No veo el QR en Expo
**Solución**: Presiona `r` en la terminal de Expo o reinicia:
```bash
cd mobile2
npx expo start --clear
```

---

## 📊 Estructura de la App

### Pantallas Implementadas
1. **Login** - Autenticación de usuarios
2. **Signup** - Registro de nuevos usuarios
3. **Home** - Dashboard principal
4. **Devices** - Lista de dispositivos
5. **Device Detail** - Detalles y QR del dispositivo
6. **Scan QR** - Escanear códigos QR para acceso
7. **Access History** - Historial de accesos
8. **Profile** - Perfil del usuario

### Servicios API
- ✅ AuthService (login, register, logout)
- ✅ UserService (perfil, actualizar)
- ✅ DeviceService (CRUD dispositivos)
- ✅ AccessService (registros de acceso)

---

## 🎯 Listo para Producción

Esta aplicación está lista para ser implementada en la ECCI con:
- ✅ Validaciones robustas
- ✅ Manejo de errores profesional
- ✅ Seguridad con JWT tokens
- ✅ Compatibilidad multiplataforma
- ✅ UI/UX intuitiva basada en diseños Figma
- ✅ Storage seguro de credenciales
- ✅ Código limpio y mantenible

---

## 📞 Comandos Útiles

```bash
# Ver logs del backend
tail -f /tmp/backend.log

# Ver logs de Expo
tail -f /tmp/expo.log

# Reiniciar todo el sistema
./mobile2/setup.sh

# Limpiar cache de Expo
cd mobile2
npx expo start --clear
```
