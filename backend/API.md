# BoTema — Documentación de la API

Base URL: `http://localhost:3000`

Todas las respuestas son **JSON**. Los errores tienen el formato `{ "error": "descripción" }`.

Las rutas marcadas con 🔒 requieren la cabecera:
```
Authorization: Bearer <token>
```

---

## Autenticación

### POST /auth/register
Registra un jugador nuevo.

**Body:**
```json
{ "username": "ada", "email": "ada@mail.com", "password": "clave123" }
```

**Respuesta (201):**
```json
{ "id": "66c...", "username": "ada", "email": "ada@mail.com", "bestScore": 0, "gamesPlayed": 0 }
```

**Errores:** `400` faltan campos · `409` email o username ya registrado.

---

### POST /auth/login
Inicia sesión y devuelve un token JWT.

**Body:**
```json
{ "email": "ada@mail.com", "password": "clave123" }
```

**Respuesta (200):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6...",
  "user": { "id": "66c...", "username": "ada", "email": "ada@mail.com", "bestScore": 0, "gamesPlayed": 0 }
}
```

**Errores:** `400` faltan campos · `401` credenciales inválidas.

---

### GET /auth/me 🔒
Devuelve el perfil del jugador del token.

**Respuesta (200):**
```json
{ "_id": "66c...", "username": "ada", "email": "ada@mail.com", "bestScore": 120, "gamesPlayed": 3 }
```

**Errores:** `401` token faltante o inválido.

---

## Catálogo de canciones

### GET /songs
Lista el catálogo.

**Respuesta (200):**
```json
[
  { "_id": "66d...", "title": "Chau", "artist": "No Te Va Gustar", "coverUrl": "https://...", "year": 2018, "genre": "Rock" }
]
```

---

### GET /songs/search?q=texto
Autocomplete: busca por título o artista (máx. 10 resultados).

**Ejemplo:** `GET /songs/search?q=cuarteto`

**Respuesta (200):**
```json
[
  { "_id": "66d...", "title": "Enamorado Tuyo", "artist": "El Cuarteto de Nos", "coverUrl": "https://..." }
]
```

---

### POST /songs
Importa las canciones de un artista desde iTunes al catálogo (sin duplicar).

**Body:**
```json
{ "artista": "No Te Va Gustar" }
```

**Respuesta (201):**
```json
{ "artista": "No Te Va Gustar", "encontradas": 25, "importadas": 25 }
```

**Errores:** `400` falta el campo `artista`.

---

## El juego

### POST /games 🔒
Inicia una partida (racha). Elige una canción al azar, oculta.

**Respuesta (201):**
```json
{
  "id": "66e...",
  "status": "playing",
  "currentRound": 1,
  "allowedDuration": 0.1,
  "previewUrl": "https://audio-ssl.itunes.apple.com/.../preview.m4a",
  "totalScore": 0,
  "songsCompleted": 0,
  "artistRevealed": false,
  "hintsUsed": []
}
```

> `allowedDuration` son los segundos de audio que el frontend puede reproducir en esta ronda. La canción **no** se revela.

---

### GET /games/:id 🔒
Devuelve el estado actual de la partida (sin revelar la respuesta, salvo que haya terminado).

**Respuesta (200):** igual que el de `POST /games`. Si `status` es `"over"`, incluye `revealed` con la canción.

**Errores:** `404` partida no encontrada.

---

### POST /games/:id/guess 🔒
Adivina la canción actual.

**Body:**
```json
{ "guessedSongId": "66d..." }
```

**Respuesta si ACERTÁS (200):**
```json
{
  "correct": true,
  "pointsEarned": 60,
  "revealed": { "title": "Ves", "artist": "La Vela Puerca", "coverUrl": "...", "year": 2011 },
  "id": "66e...", "status": "playing", "currentRound": 1, "allowedDuration": 0.1,
  "previewUrl": "...", "totalScore": 60, "songsCompleted": 1, "artistRevealed": false, "hintsUsed": []
}
```

**Respuesta si ERRÁS pero quedan rondas (200):**
```json
{ "correct": false, "sameArtist": true, "currentRound": 2, "allowedDuration": 0.5, "totalScore": 0, "...": "..." }
```
- `sameArtist: true` → acertaste el artista (🟡). Se desbloquea la pista de artista gratis.

**Respuesta si ERRÁS la 6ª ronda (game over, 200):**
```json
{ "correct": false, "sameArtist": false, "revealed": { "title": "...", "artist": "..." }, "status": "over", "totalScore": 50, "songsCompleted": 1 }
```

**Errores:** `400` falta `guessedSongId` · `404` canción o partida no existe · `409` la partida ya terminó.

---

### POST /games/:id/skip 🔒
Pasa de ronda sin adivinar (desbloquea un fragmento más largo).

**Respuesta (200):** el nuevo estado (o game over si era la última ronda).

**Errores:** `404` partida no encontrada · `409` la partida ya terminó.

---

### POST /games/:id/hint 🔒
Pide una pista. Resta puntos (salvo el artista si ya se desbloqueó por el 🟡).

**Body:**
```json
{ "tipo": "anio" }
```
Tipos válidos: `anio` (−10), `letra` (−20), `artista` (−30), `tapa` (−30).

**Respuesta (200):**
```json
{ "tipo": "anio", "valor": 2011, "costo": 10, "totalScore": -10 }
```

**Errores:** `400` tipo inválido o falta `tipo` · `404` partida no encontrada · `409` la partida ya terminó.

---

## Leaderboard

### GET /leaderboard
Ranking general: los 10 jugadores con mejor racha (`bestScore`).

**Respuesta (200):**
```json
[
  { "_id": "66c...", "username": "ada", "bestScore": 320, "gamesPlayed": 12 },
  { "_id": "66c...", "username": "leo", "bestScore": 210, "gamesPlayed": 8 }
]
```

---

## Códigos de estado usados

| Código | Significado |
|--------|-------------|
| `200` | OK |
| `201` | Creado |
| `400` | Datos inválidos |
| `401` | No autenticado (token faltante o inválido) |
| `404` | No encontrado |
| `409` | Conflicto (regla de negocio: sin capacidad, partida terminada, duplicado) |
| `500` | Error interno |
