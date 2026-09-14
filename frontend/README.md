# BoTema — Frontend

Interfaz web del juego **BoTema**: adiviná canciones **uruguayas** de oído, en modo racha y con pistas. Hecho en **React + Vite**, consume la API del backend.

## Stack

- **React 18** + **Vite** — UI y build/dev server
- **Iconify** (`@iconify/react` + set **game-icons**) — iconos, cargados offline
- Fuente display **Jungle Adventurer** (en `public/fonts/`) + **IBM Plex Sans** para el cuerpo
- **localStorage** para la sesión (token JWT)

## Requisitos

- Node.js 18 o superior
- El **backend** de BoTema corriendo (ver `../backend`)

## Instalación

```bash
cd frontend
npm install
```

## Configuración

Crear un archivo `.env` en la carpeta `frontend` con la URL del backend:

```
VITE_API_URL=http://localhost:3000
```

> Si no se define, por defecto usa `http://localhost:3000`.

## Correr en desarrollo

```bash
npm run dev
```

Queda en `http://localhost:5173`. Necesita el backend levantado para registrarse, jugar y ver el ranking.

## Build de producción

```bash
npm run build     # genera la carpeta dist/
npm run preview   # sirve el build para probarlo
```

## Estructura

```
frontend/
├── public/
│   ├── fonts/       # Jungle Adventurer (.ttf/.otf)
│   └── mascota/     # imágenes de la mascota (inicio, correcta, cerca, 404, ...)
├── src/
│   ├── components/  # Auth, Home, Game, NowPlaying, Hints, Leaderboard, SongsList, Mascota, ...
│   ├── api.js       # cliente de la API (fetch + token)
│   ├── auth.js      # manejo de sesión en localStorage
│   ├── index.css    # estilos y tema (variables de color/fuente)
│   └── main.jsx     # punto de entrada (registra el set de iconos)
└── index.html
```

## Notas

- La **mascota** (máscara de murga) cambia de pose según el momento: inicio, acierto, error, "cerca" (acertaste el artista), fin de partida y login.
- Los iconos son del set **game-icons**, empaquetados para funcionar sin internet.
- El token se guarda en `localStorage` (`botema_token`) y se manda como `Authorization: Bearer <token>`.
