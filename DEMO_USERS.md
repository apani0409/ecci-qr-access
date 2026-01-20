# 🔐 Usuarios Demo - ECCI Control

## Credenciales de Prueba

El sistema tiene tres tipos de usuarios con diferentes permisos. Usa estas credenciales para probar todas las funcionalidades:

---

### 👨‍💼 Administrador (Admin)
**Email:** `admin@ecci.com`  
**Password:** `Admin123!`

**Permisos:**
- ✅ Acceso total al sistema
- ✅ Ver todos los dispositivos de todos los usuarios
- ✅ Ver historial completo de accesos
- ✅ Escanear cualquier dispositivo
- ✅ Gestionar webhooks y configuración
- ✅ Administrar usuarios

---

### 👮 Guardia de Seguridad (Security)
**Email:** `guard@ecci.com`  
**Password:** `Guard123!`

**Permisos:**
- ✅ Escanear QR de cualquier dispositivo
- ✅ Ver historial completo de todos los accesos
- ✅ Registrar entradas y salidas
- ✅ Gestionar sus propios dispositivos
- ❌ No puede administrar usuarios ni webhooks

---

### 🎓 Estudiante (Student)
**Email:** `student@ecci.com`  
**Password:** `Student123!`

**Permisos:**
- ✅ Registrar sus propios dispositivos
- ✅ Ver sus dispositivos y códigos QR
- ✅ Ver su propio historial de accesos
- ❌ No puede escanear dispositivos de otros
- ❌ No puede ver accesos de otros usuarios

---

## 📋 Escenarios de Prueba

### Escenario 1: Estudiante registra dispositivo
1. Login como `student@ecci.test`
2. Ir a "Mis Dispositivos" → "Agregar Dispositivo"
3. Completar formulario:
   - Nombre: "Laptop Dell"
   - Tipo: "Laptop"
   - Marca: "Dell"
   - Modelo: "Latitude 5420"
   - Serie: "LAT-2024-001"
4. Ver QR generado

### Escenario 2: Guardia escanea dispositivo
1. Login como `guard@ecci.test`
2. Ir a "Escanear QR"
3. Escanear código QR del dispositivo del estudiante
4. Seleccionar tipo: "Entrada"
5. Ver confirmación con nombre del estudiante
6. Ir a "Historial" → ver todos los registros

### Escenario 3: Admin supervisa todo
1. Login como `admin@ecci.test`
2. Ver historial completo de accesos
3. Ver dispositivos de todos los usuarios
4. Escanear cualquier QR
5. Administrar webhooks

### Escenario 4: Estudiante intenta escanear otro dispositivo
1. Login como `student@ecci.test`
2. Crear un segundo estudiante desde admin o postman
3. Intentar escanear QR del otro estudiante
4. **Resultado esperado:** Error 403 "No autorizado"

---

## 🧪 Testing Rápido desde cURL

```bash
# Login como estudiante
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "student@ecci.test",
    "password": "Student123!"
  }'

# Login como guardia
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "guard@ecci.test",
    "password": "Guard123!"
  }'

# Login como admin
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@ecci.test",
    "password": "Admin123!"
  }'
```

---

## 📝 Notas Importantes

- **Contraseñas:** Todas siguen el formato `[Rol]123!` (mayúscula inicial, números, símbolo)
- **Emails:** Todos usan el dominio `@ecci.test` para pruebas
- **Student IDs:** 
  - Admin: `ADMIN001`
  - Security: `SEC001`
  - Student: `STU001`

- **Reset de datos:** Para limpiar la base y empezar de nuevo:
  ```bash
  docker compose down -v
  docker compose up -d
  docker exec [container] python seed_users.py
  ```

---

## 🚀 Próximos Pasos

Después de probar con estos usuarios, puedes:
1. Crear más estudiantes desde la interfaz de admin
2. Asignar múltiples dispositivos por usuario
3. Probar flujos de entrada/salida durante el día
4. Generar reportes de acceso por fecha/usuario

