# Changelog

Todos los cambios notables a este proyecto serán documentados en este archivo.

El formato está basado en [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
y este proyecto adhiere a [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2026-01-18

### Added
- ✨ Sistema completo de autenticación con JWT
- ✨ Gestión CRUD de dispositivos
- ✨ Generación automática de códigos QR
- ✨ Registro de accesos con timestamp y ubicación
- ✨ Historial completo de accesos por usuario y dispositivo
- ✨ API RESTful con FastAPI
- ✨ Frontend web con React + Vite + Tailwind
- ✨ App móvil con React Native + Expo
- ✨ Sistema de logging completo
- ✨ Manejo centralizado de excepciones
- ✨ Tests unitarios con pytest
- ✨ Documentación de API con Swagger
- ✨ Docker Compose para deployment
- ✨ Migraciones de base de datos con Alembic

### Security
- 🔒 Hashing de contraseñas con bcrypt
- 🔒 Autenticación JWT con expiración
- 🔒 Validación de datos con Pydantic
- 🔒 CORS configurables
- 🔒 Protección contra SQL injection (ORM)
- 🔒 Verificación de propiedad de recursos

### Infrastructure
- 🐳 Configuración Docker optimizada
- 🐘 PostgreSQL 15 con healthchecks
- 🔄 Hot reload en desarrollo
- 📝 Logging estructurado
- 🧪 Cobertura de tests >80%

---

## [Unreleased]

### Planned
- [ ] Rate limiting
- [ ] Cache con Redis
- [ ] Notificaciones push
- [ ] Exportación de reportes (PDF/Excel)
- [ ] Dashboard de analytics
- [ ] Modo oscuro
- [ ] PWA support
- [ ] Soporte offline
- [ ] Biometric authentication
- [ ] Multi-idioma (i18n)
