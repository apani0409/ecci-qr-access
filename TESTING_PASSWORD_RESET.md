# 🧪 Quick Testing Guide - Password Reset

## Probar Sistema de Recuperación de Contraseña

### Opción 1: Development Mode (Sin SMTP configurado)

**Ventaja:** No necesitas configurar Gmail, los emails se imprimen en logs.

1. **Request Password Reset:**
```bash
curl -X POST http://localhost:8000/api/users/password/reset-request \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@ecci.com"}'
```

Respuesta esperada:
```json
{
  "message": "Si el correo existe, recibirás instrucciones para restablecer tu contraseña"
}
```

2. **Ver el Email en Logs:**
```bash
docker compose logs backend | grep -A 100 "Email content"
```

Busca el enlace que se vería así:
```
http://localhost:8081/reset-password?token=abc123...
```

3. **Extraer el Token:**
Del enlace anterior, copia solo la parte después de `?token=`

4. **Completar Reset:**
```bash
curl -X POST http://localhost:8000/api/users/password/reset \
  -H "Content-Type: application/json" \
  -d '{
    "token": "PEGA_EL_TOKEN_AQUI",
    "new_password": "NewPassword123!"
  }'
```

Respuesta esperada:
```json
{
  "message": "Contraseña restablecida exitosamente"
}
```

5. **Probar Nueva Contraseña:**
```bash
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@ecci.com",
    "password": "NewPassword123!"
  }'
```

Deberías recibir un token JWT.

---

### Opción 2: Production Mode (Con SMTP configurado)

**Requisito:** Gmail App Password configurado en `.env.prod`

1. **Configurar SMTP en .env:**
```bash
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=tu-email@gmail.com
SMTP_PASSWORD=xxxx-xxxx-xxxx-xxxx  # App Password
SMTP_FROM_EMAIL=noreply@ecci-control.com
ENVIRONMENT=production
```

2. **Reiniciar Backend:**
```bash
docker compose restart backend
```

3. **Request Password Reset:**
```bash
curl -X POST http://localhost:8000/api/users/password/reset-request \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@ecci.com"}'
```

4. **Revisar tu Email:**
- Abre tu bandeja de entrada
- Busca email de "ECCI Control System"
- Haz click en el botón "Restablecer Contraseña"

5. **Desde Mobile/Web:**
La app debería tener una pantalla para ingresar el token y nueva contraseña.

---

## 🔍 Troubleshooting

### Email No Se Envía

**Verificar configuración:**
```bash
docker compose logs backend | grep -i smtp
```

Deberías ver:
```
INFO: Email sent successfully to admin@ecci.com
```

Si ves error:
```
ERROR: Failed to send email to admin@ecci.com: ...
```

**Soluciones:**
1. Verifica que usas **App Password** (no tu contraseña normal)
2. Verifica que 2FA está habilitado en Google
3. Revisa https://myaccount.google.com/apppasswords
4. Verifica SMTP_USER y SMTP_PASSWORD en .env

### Token Inválido

Error:
```json
{
  "detail": "Token inválido o expirado"
}
```

**Causas:**
- Token ya fue usado
- Token expiró (30 minutos)
- Token copiado incorrectamente

**Solución:**
Solicita un nuevo token con paso 1.

### Usuario No Existe

Si haces request para email que no existe:
```bash
curl -X POST http://localhost:8000/api/users/password/reset-request \
  -H "Content-Type: application/json" \
  -d '{"email":"noexiste@example.com"}'
```

Respuesta (igual que si existiera - previene email enumeration):
```json
{
  "message": "Si el correo existe, recibirás instrucciones para restablecer tu contraseña"
}
```

Pero no se envía email ni se crea token.

---

## 📊 Verificar Database

### Ver Tokens Generados
```bash
docker compose exec db psql -U ecci_user -d ecci_control -c \
  "SELECT id, user_id, LEFT(token, 20) as token_preview, expires_at, used, created_at 
   FROM password_reset_tokens 
   ORDER BY created_at DESC 
   LIMIT 5;"
```

### Limpiar Tokens Expirados
```bash
docker compose exec db psql -U ecci_user -d ecci_control -c \
  "DELETE FROM password_reset_tokens WHERE expires_at < NOW();"
```

---

## ✅ Checklist de Testing

- [ ] Request reset para usuario válido
- [ ] Request reset para usuario inválido (mismo mensaje)
- [ ] Email se envía correctamente (o aparece en logs)
- [ ] Token se genera en base de datos
- [ ] Email tiene formato HTML bonito
- [ ] Enlace en email funciona
- [ ] Reset con token válido funciona
- [ ] Nueva contraseña permite login
- [ ] Token se marca como usado
- [ ] Token usado no funciona segunda vez
- [ ] Token expirado (>30 min) no funciona
- [ ] Nuevos tokens invalidan tokens viejos del mismo usuario

---

## 🚀 Quick Start

Para probar rápido en development:

```bash
# 1. Request reset
curl -X POST http://localhost:8000/api/users/password/reset-request \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@ecci.com"}'

# 2. Ver token en logs
docker compose logs backend | grep -A 100 "Email content" | grep "reset-password?token="

# 3. Copiar token del output
# Ejemplo: http://localhost:8081/reset-password?token=ABC123XYZ...

# 4. Reset password
curl -X POST http://localhost:8000/api/users/password/reset \
  -H "Content-Type: application/json" \
  -d '{"token":"ABC123XYZ...", "new_password":"NewPassword123!"}'

# 5. Login con nueva password
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@ecci.com", "password":"NewPassword123!"}'
```

---

## 📧 Ejemplo de Email Generado

```html
Asunto: Restablece tu contraseña - ECCI Control

Hola, Admin User

Recibimos una solicitud para restablecer la contraseña de tu cuenta.

Para crear una nueva contraseña, haz clic en el siguiente botón:

[Restablecer Contraseña]

O copia y pega este enlace en tu navegador:
http://localhost:8081/reset-password?token=ABC123XYZ...

⏱️ Importante: Este enlace expirará en 30 minutos.

Si no solicitaste restablecer tu contraseña, ignora este correo.

---
Este es un correo automático, por favor no respondas.
© 2026 ECCI Control System. Todos los derechos reservados.
```

---

¡Sistema completamente funcional! 🎉
