# BoTema — Pruebas automatizadas

Documentación de las **pruebas automatizadas** de la API (requisito de la consigna: *"pruebas automatizadas sobre funcionalidades relevantes"*).

Todos los tests están en un solo archivo: [`test/api.test.js`](test/api.test.js). Son **18 pruebas** que cubren el catálogo, la autenticación, la lógica del juego y el ranking.

---

## Qué son y para qué sirven

Son **código que prueba el código**: en vez de abrir el navegador y probar todo a mano, un programa hace los pedidos a la API y **verifica que las respuestas sean las esperadas**. Se corren en segundos y avisan si algo se rompió.

Sirven para:
- Detectar errores apenas se introducen (ej.: si cambiás una regla y algo deja de coincidir).
- Cambiar el código con confianza.
- Cumplir el requisito de testing del proyecto.

---

## Cómo funcionan (herramientas)

| Herramienta | Rol |
|---|---|
| **Vitest** | Corre los tests y reporta cuáles pasan/fallan. |
| **Supertest** | Hace pedidos HTTP a la API (POST, GET, DELETE…) **sin levantar el servidor real**. Simula ser el frontend. |
| **mongodb-memory-server** | Una MongoDB **en memoria** que se crea al empezar y se borra al terminar → **no toca la base real de Atlas**. |
| **`vi.mock`** (Vitest) | **Simula iTunes**: en los tests, "buscar en iTunes" devuelve una canción inventada → los tests **no dependen de internet**. |

**Ciclo de vida de una corrida** (definido en `api.test.js`):
- `beforeAll`: levanta la MongoDB en memoria y conecta Mongoose (setea también un `JWT_SECRET` de prueba).
- `beforeEach`: **borra todas las colecciones** y recarga un catálogo base de 3 canciones → cada test arranca de cero, sin ensuciarse con el anterior.
- `afterAll`: desconecta y apaga la base en memoria.

**Helpers** (para no repetir código):
- `token(username)` → registra un usuario y devuelve su **token JWT**.
- `auth(req, token)` → agrega la cabecera `Authorization: Bearer <token>` a un pedido.
- `setCatalog(songs)` → reemplaza el catálogo por uno específico para un test.

**Anatomía de un test** (ejemplo real):
```js
test('DELETE /games/:id abandona la partida', async () => {
    const t = await token();                                     // 1. usuario + token
    const juego = await auth(request(app).post('/games'), t);    // 2. inicia partida
    const del = await auth(request(app).delete(`/games/${juego.body.id}`), t); // 3. la abandona
    expect(del.status).toBe(200);                                // 4. afirmaciones:
    expect(del.body.abandoned).toBe(true);                       //    ¿respondió lo esperado?
});
```
`expect(...).toBe(...)` es la **afirmación**: si no se cumple, el test falla y muestra qué esperaba vs qué recibió.

---

## Los 18 tests, uno por uno

### Catálogo (3)
| # | Nombre | Qué verifica |
|---|---|---|
| 1 | `GET /songs lista las canciones persistidas` | Devuelve las canciones guardadas (las 3 del catálogo base). |
| 2 | `GET /songs/search filtra por término` | La búsqueda por título/artista devuelve solo lo que coincide. |
| 3 | `POST /songs importa (iTunes simulado) y no duplica` | Importa un artista y, si se repite, **no duplica** (importadas = 0 la 2ª vez). |

### Autenticación (5)
| # | Nombre | Qué verifica |
|---|---|---|
| 4 | `register crea usuario sin filtrar el passwordHash` | Al registrarse, la respuesta **no expone** el hash de la contraseña. |
| 5 | `register con email duplicado → 409` | No deja registrar dos veces el mismo email (conflicto 409). |
| 6 | `login con contraseña mala → 401` | Con contraseña incorrecta, rechaza (401). |
| 7 | `GET /auth/me sin token → 401` | Ruta protegida sin token → no autorizado (401). |
| 8 | `GET /auth/me con token → perfil` | Con token válido, devuelve el perfil del usuario. |

### El juego (9)
| # | Nombre | Qué verifica |
|---|---|---|
| 9 | `POST /games sin token → 401` | No se puede iniciar partida sin estar logueado. |
| 10 | `POST /games inicia sin revelar la canción` | Arranca en ronda 1 (1 s) y **no revela** el título de la respuesta. |
| 11 | `DELETE /games/:id abandona la partida` | Borra la partida; pedir su estado después da 404. |
| 12 | `adivinar la canción correcta suma puntos y pasa a otra` | Acierto en ronda 1 = **100 pts**, `songsCompleted` sube y arranca otra canción. |
| 13 | `errar con el mismo artista da sameArtist y desbloquea el artista` | Fallar con canción del mismo artista → `sameArtist: true` y `artistRevealed: true`. |
| 14 | `la pista de año resta puntos (score puede ir a negativo)` | Pedir pista de año cuesta 10 y el puntaje puede quedar en −10. |
| 15 | `la pista de artista es gratis si ya se desbloqueó` | Si ya acertaste el artista (🟡), esa pista cuesta 0. |
| 16 | `agotar las rondas termina la partida (game over)` | Pasar las 6 rondas termina la partida (`status: over`). |
| 17 | `no se puede jugar una partida terminada → 409` | Adivinar en una partida ya terminada da conflicto (409). |

### Leaderboard (1)
| # | Nombre | Qué verifica |
|---|---|---|
| 18 | `GET /leaderboard devuelve jugadores ordenados por bestScore` | El ranking devuelve a los jugadores **ordenados por mejor puntaje** (el más alto primero). |

---

## Cómo usarlas

Desde la carpeta `backend`:

```bash
npm run test:run
```
Corre las 18 pruebas una vez. Deberías ver:
```
Test Files  1 passed (1)
      Tests  18 passed (18)
```

Modo **watch** (se re-ejecutan solas al guardar cambios, útil mientras programás):
```bash
npm test
```

### Cómo leer un fallo
Si una prueba falla, Vitest muestra el test, la línea y el valor que no coincidió, por ejemplo:
```
expected 1 to be 0.1
- 0.1   (lo que el test esperaba)
+ 1     (lo que recibió)
```

### Cómo agregar una nueva prueba
1. Abrí `test/api.test.js`.
2. Dentro del `describe` que corresponda, agregá un `test('descripción', async () => { ... })`.
3. Usá `request(app)` (+ el helper `auth`) para hacer el pedido y `expect(...)` para afirmar el resultado.
4. Corré `npm run test:run` para verificar.

---

*Nota: los tests usan una base en memoria e iTunes simulado, así que se pueden correr sin internet y sin afectar la base real de Atlas.*
