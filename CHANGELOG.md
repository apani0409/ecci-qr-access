# Changelog

Formato basado en [Keep a Changelog](https://keepachangelog.com/es-ES/1.1.0/).

## [1.1.0] - 2026-11-12

### Seguridad
- El registro público ya no acepta el campo `role`: siempre crea estudiantes (antes cualquiera
  podía registrarse como `admin`).
- Eliminado el login biométrico: aceptaba cualquier firma sin verificarla y además fallaba.
- CORS usa `CORS_ORIGINS` en vez de `*` con credenciales.
- Peticiones sin token responden 401 (antes 403); se rechazan tokens con `sub` inválido y
  usuarios inactivos.

### Corregido
- Las pruebas no corrían: los modelos usaban `postgresql.UUID` (no portable) e índices
  duplicados; las pruebas apuntaban a rutas inexistentes. Ahora 39 pruebas pasan.
- `/health` siempre devolvía 503 (SQL crudo sin `text()` en SQLAlchemy 2).
- IDs inválidos en la URL devuelven 422 en vez de 500.
- Marca, modelo y foto del dispositivo se ignoraban al crearlo o editarlo.
- La URL de un webhook se guardaba como objeto `HttpUrl` en vez de texto.
- El historial hacía 3 consultas por registro (N+1); ahora es una sola consulta con joins.
- Frontend: "Ver detalles" llevaba a una ruta inexistente, recargar la página cerraba la
  sesión, el menú desaparecía en móvil y las credenciales de demo mostradas no existían.

### Añadido
- Páginas de historial (con búsqueda y filtro) y detalle de dispositivo (QR descargable + historial).
- Modo demo del frontend (API emulada en el navegador) y despliegue en Vercel.
- Pruebas de permisos por rol y de webhooks.

### Eliminado
- ~30 archivos `.md`/`.txt` redundantes y scripts de verificación desactualizados.

## [1.0.0] - 2026-01-18

- Versión inicial: API FastAPI con JWT, dispositivos con QR, registro de accesos, frontend
  React y app móvil Expo.
