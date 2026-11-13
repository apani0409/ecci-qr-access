# Frontend web (React + Vite)

App web de ECCI QR Access. Visión general: [README principal](../README.md).

```bash
npm install
npm run dev          # contra el backend real (VITE_API_URL, por defecto http://localhost:8000/api)
npm run dev:demo     # modo demo: API emulada en el navegador, sin backend
npm run build        # build normal
npm run build:demo   # build de la demo pública (la que usa vercel.json)
```

```
src/
  pages/        Login, Registro, Inicio, Dispositivos, Detalle (QR + historial), Escanear, Historial, Perfil
  components/   Layout, navegación, tabla de accesos, banner de demo
  services/     cliente axios por recurso (auth, device, access)
  stores/       sesión (Zustand)
  demo/         modo demo: mockApi.js (adaptador axios) y seed.js (datos ficticios)
```

El modo demo se activa con `VITE_DEMO_MODE=true` (archivo `.env.demo`). El adaptador
implementa las mismas rutas, permisos por rol y códigos de error que el backend, y guarda todo
en `localStorage`.
