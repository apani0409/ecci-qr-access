# 🔐 Password Reset System - ECCI Control

## Overview
Sistema completo de recuperación de contraseña con envío de emails via SMTP y tokens seguros de un solo uso.

---

## ✅ Features Implementadas

- ✅ Generación de tokens seguros con `secrets.token_urlsafe()`
- ✅ Tokens con expiración configurable (default: 30 minutos)
- ✅ Envío de emails HTML con plantillas profesionales
- ✅ Tokens de un solo uso (se marcan como usados)
- ✅ Prevención de email enumeration
- ✅ Migración de base de datos incluida

---

## 🔧 Configuración

### 1. Variables de Entorno

Agrega estas variables a tu `.env` o `.env.prod`:

```bash
# SMTP Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-specific-password
SMTP_FROM_EMAIL=noreply@ecci-control.com
SMTP_FROM_NAME=ECCI Control System

# Password Reset
RESET_TOKEN_EXPIRE_MINUTES=30
FRONTEND_URL=http://localhost:8081
```

### 2. Gmail App Password Setup

1. Habilita 2FA en tu cuenta de Google
2. Ve a: https://myaccount.google.com/apppasswords
3. Genera una "App Password" para "Mail"
4. Usa esa contraseña en `SMTP_PASSWORD`

**⚠️ NUNCA uses tu contraseña normal de Gmail**

### 3. Migración de Base de Datos

```bash
# Development
docker compose exec backend alembic upgrade head

# Production
docker compose -f docker-compose.prod.yml exec backend alembic upgrade head
```

---

## 📡 API Endpoints

### 1. Request Password Reset

```http
POST /api/users/password/reset-request
Content-Type: application/json

{
  "email": "user@example.com"
}
```

**Response (200 OK):**
```json
{
  "message": "Si el correo existe, recibirás instrucciones para restablecer tu contraseña"
}
```

**Nota:** Siempre retorna 200 para prevenir email enumeration.

### 2. Complete Password Reset

```http
POST /api/users/password/reset
Content-Type: application/json

{
  "token": "token-from-email",
  "new_password": "NewSecurePassword123!"
}
```

**Response (200 OK):**
```json
{
  "message": "Contraseña restablecida exitosamente"
}
```

**Errors:**
- `400 Bad Request`: Token inválido o expirado
- `404 Not Found`: Usuario no encontrado

---

## 🎨 Email Template

El email enviado incluye:
- ✅ Diseño HTML responsive
- ✅ Botón con enlace directo
- ✅ Enlace de texto como fallback
- ✅ Advertencia de expiración
- ✅ Instrucciones claras
- ✅ Versión plain text para clientes antiguos

**Ejemplo:**
```
Asunto: Restablece tu contraseña - ECCI Control

Hola, Juan Pérez

Recibimos una solicitud para restablecer la contraseña de tu cuenta.

[Botón: Restablecer Contraseña]

⏱️ Importante: Este enlace expirará en 30 minutos.
```

---

## 🔒 Seguridad

### Token Generation
```python
import secrets
token = secrets.token_urlsafe(32)  # 256-bit token
```

### Token Validation
- ✅ Verifica que existe
- ✅ Verifica que no está usado
- ✅ Verifica que no está expirado
- ✅ Se marca como usado después de usarlo

### Database Schema
```sql
CREATE TABLE password_reset_tokens (
    id UUID PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    token VARCHAR(255) UNIQUE NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    used BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL
);
```

---

## 🧪 Testing

### Development Mode (Sin SMTP)
Si `SMTP_USER` o `SMTP_PASSWORD` no están configurados y `ENVIRONMENT=development`:
- No envía emails
- Imprime el contenido del email en los logs
- Retorna éxito de todas formas

```python
logger.info("Email content:\n%s", html_content)
```

### Testing Manual

1. **Request Reset:**
```bash
curl -X POST http://localhost:8000/api/users/password/reset-request \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@ecci.com"}'
```

2. **Check Logs (Development):**
```bash
docker compose logs backend | grep -A 50 "Email content"
```

3. **Extract Token from Email Link**

4. **Complete Reset:**
```bash
curl -X POST http://localhost:8000/api/users/password/reset \
  -H "Content-Type: application/json" \
  -d '{
    "token":"extracted-token-here",
    "new_password":"NewPassword123!"
  }'
```

---

## 📱 Mobile Integration

En la app React Native, agregar pantalla de reset:

```javascript
// src/screens/ForgotPasswordScreen.js
const requestReset = async (email) => {
  const response = await axios.post(
    `${API_URL}/api/users/password/reset-request`,
    { email }
  );
  Alert.alert("Éxito", response.data.message);
};

// src/screens/ResetPasswordScreen.js
const resetPassword = async (token, newPassword) => {
  const response = await axios.post(
    `${API_URL}/api/users/password/reset`,
    { token, new_password: newPassword }
  );
  Alert.alert("Éxito", response.data.message);
  navigation.navigate("Login");
};
```

---

## 🐛 Troubleshooting

### Email No Se Envía

**Check 1: SMTP Configuration**
```bash
docker compose logs backend | grep -i smtp
```

**Check 2: Verificar Credenciales**
```python
# Test SMTP connection
import smtplib
server = smtplib.SMTP('smtp.gmail.com', 587)
server.starttls()
server.login('your-email@gmail.com', 'app-password')
server.quit()
```

**Check 3: Gmail Security**
- Verifica que usas App Password (no tu contraseña normal)
- Verifica que 2FA está habilitado
- Revisa https://myaccount.google.com/security

### Token Expirado
- Default: 30 minutos
- Configurable via `RESET_TOKEN_EXPIRE_MINUTES`
- El usuario debe solicitar un nuevo token

### Token No Válido
- Verifica que el token se copió correctamente
- Verifica que no tiene espacios extra
- Verifica que no se usó previamente

---

## 📊 Monitoring

### Metrics to Track
- Reset requests per day
- Successful resets vs failed
- Token expiration rate
- Email delivery failures

### Database Cleanup
Tokens expirados se pueden limpiar periódicamente:

```sql
DELETE FROM password_reset_tokens
WHERE expires_at < NOW() - INTERVAL '7 days';
```

O agregar un cron job:
```bash
0 3 * * * docker compose exec db psql -U ecci_user -d ecci_control -c "DELETE FROM password_reset_tokens WHERE expires_at < NOW() - INTERVAL '7 days';"
```

---

## 🚀 Production Checklist

- [ ] Configurar SMTP real (no development mode)
- [ ] Usar Gmail App Password o servicio SMTP dedicado
- [ ] Configurar `FRONTEND_URL` correcto
- [ ] Agregar rate limiting al endpoint de request
- [ ] Monitorear fallos de envío de email
- [ ] Configurar retry lógica para emails
- [ ] Agregar logging de eventos de reset
- [ ] Cleanup automático de tokens expirados

---

## 📚 Resources

- [FastAPI Email Guide](https://fastapi.tiangolo.com/)
- [Python SMTP Documentation](https://docs.python.org/3/library/smtplib.html)
- [Gmail App Passwords](https://support.google.com/accounts/answer/185833)
- [Email Template Design](https://www.emailonacid.com/blog/article/email-development/)
