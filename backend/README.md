# BoTema — Backend

API REST del juego **BoTema**: adiviná canciones **uruguayas** antes de que suenen demasiado, en modo racha y con pistas estratégicas.

## Stack

- **Node.js** + **Express** — la API REST
- **MongoDB** + **Mongoose** — persistencia
- **JWT** + **bcrypt** — autenticación
- **iTunes Search API** — para poblar el catálogo de canciones
- **Vitest** + **Supertest** — pruebas automatizadas

## Requisitos

- Node.js 18 o superior
- Una base de datos MongoDB (ej: [MongoDB Atlas](https://www.mongodb.com/atlas), gratis)

## Instalación

```bash
cd backend
npm install
```

## Configuración

Crear un archivo `.env` en la carpeta `backend` con:

```
PORT=3000
MONGO_URI=mongodb+srv://USUARIO:CONTRASENA@cluster0.xxxxx.mongodb.net/botema_db
JWT_SECRET=una_cadena_larga_y_secreta
```

- `MONGO_URI` → la URL de tu base MongoDB (con el nombre de base `botema_db`).
- `JWT_SECRET` → cualquier cadena larga; es el secreto con el que se firman los tokens.

> El `.env` **no se sube al repositorio** (está en el `.gitignore`).

## Poblar el catálogo

Antes de jugar, hay que cargar canciones. Este comando importa temas de artistas uruguayos desde iTunes:

```bash
npm run seed
```

## Correr el servidor

```bash
npm start        # inicia el servidor
npm run dev      # inicia con recarga automática al guardar cambios
```

El servidor queda en `http://localhost:3000`.

## Pruebas

```bash
npm run test:run   # corre los tests una vez
npm test           # modo watch (re-corre al guardar)
```

Los tests usan una MongoDB **en memoria** y **simulan iTunes**, así que no dependen de internet ni de tu base real.

El detalle de las 18 pruebas (qué cubre cada una y cómo funcionan) está en [TESTING.md](TESTING.md).

## Estructura del proyecto

```
backend/
├── config/         # constantes del juego (rondas, puntos, pistas)
├── controllers/    # traducen HTTP (leen req, arman res)
├── database/       # conexión a Mongo + seed del catálogo
├── middleware/     # authenticate.js (valida el token JWT)
├── models/         # esquemas de Mongoose (Song, User, Game, Guess)
├── routes/         # el mapa de URLs
├── services/       # la lógica de negocio
├── utils/          # helpers (httpError)
├── test/           # pruebas automatizadas
├── app.js          # configura Express
└── server.js       # arranca todo
```

La arquitectura sigue el patrón en **capas**: `ruta → controller → service → model`.

## Endpoints

| Método | Ruta | Auth | Descripción |
|--------|------|:----:|-------------|
| POST | `/auth/register` | — | Registrar jugador |
| POST | `/auth/login` | — | Login (devuelve token JWT) |
| GET | `/auth/me` | 🔒 | Perfil del jugador |
| GET | `/songs` | — | Listar el catálogo |
| GET | `/songs/search?q=` | — | Autocomplete |
| POST | `/songs` | 🔒 | Importar un artista de iTunes |
| POST | `/games` | 🔒 | Iniciar una partida |
| GET | `/games/:id` | 🔒 | Estado de la partida |
| POST | `/games/:id/guess` | 🔒 | Adivinar la canción |
| POST | `/games/:id/skip` | 🔒 | Pasar de ronda |
| POST | `/games/:id/hint` | 🔒 | Pedir una pista |
| DELETE | `/games/:id` | 🔒 | Abandonar (borrar) una partida |
| GET | `/leaderboard` | — | Ranking por mejor puntaje (top 10) |

🔒 = requiere el token en la cabecera `Authorization: Bearer <token>`.

- `GET /auth/me` devuelve `username`, `email`, `bestScore`, `bestScoreAt`, `gamesPlayed` y `songsCompleted`.
- `GET /leaderboard` devuelve el top 10 por `bestScore`, con la **fecha** del récord (`bestScoreAt`).
- El backend tiene **CORS** habilitado para que el frontend (otro origen) pueda consumirlo.

Para el detalle de cada endpoint (bodies y respuestas de ejemplo), ver [API.md](API.md).

## Cómo funciona el juego

1. Cada canción tiene **6 rondas** que suenan cada vez más (**1s, 2s, 4s, 8s, 16s, 30s**).
2. Adivinar antes vale más (**100 → 10** puntos).
3. Es **modo racha**: adivinás una y pasás a otra, hasta fallar.
4. **Pistas** que restan puntos (año −10, 1ª letra −20, artista −30, tapa −30). El puntaje puede ir a negativo.
5. Si errás pero acertás el **artista**, la pista de artista se **revela automáticamente y gratis**.
