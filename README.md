# BoTema 🎭

Juego original para adivinar **canciones uruguayas** de oído, en **modo racha** y con **pistas** estratégicas. Cuanto antes adivinás, más puntos; encadenás aciertos para mantener la racha.

Proyecto full-stack dividido en dos partes:

```
proyecto-de-oido/
├── backend/    # API REST (Node + Express + MongoDB)
└── frontend/   # Web (React + Vite)
```

- **Backend:** Node.js, Express, MongoDB (Mongoose), auth con JWT, catálogo poblado desde la iTunes Search API. Ver [backend/README.md](backend/README.md).
- **Frontend:** React + Vite, iconos game-icons, mascota de murga. Ver [frontend/README.md](frontend/README.md).

---

## Puesta en marcha (para el equipo)

### 1. Clonar el repo

```bash
git clone https://github.com/Kuriboh98/botema.git
cd botema
```

### 2. Backend

```bash
cd backend
npm install
cp .env.example .env
```

Editar el `.env` con tus datos de MongoDB Atlas:

```
PORT=3000
MONGO_URI=mongodb+srv://USUARIO:CONTRASENA@cluster0.xxxxx.mongodb.net/botema_db?appName=Cluster0
JWT_SECRET=una_cadena_larga_y_secreta
```

> El `.env` **nunca se sube** al repo (está en `.gitignore`). Cada integrante usa su propio usuario de la base.

Levantar el backend:

```bash
npm run dev
```

Si es una base **nueva/vacía**, poblá el catálogo una vez:

```bash
npm run seed
```

> Si comparten la **misma** base de Atlas, el catálogo ya está cargado: **no** hace falta correr el seed.

### 3. Frontend

En otra terminal:

```bash
cd frontend
npm install
npm run dev
```

Abrir **http://localhost:5173** y a jugar. (Por defecto apunta al backend en `http://localhost:3000`; para cambiarlo, crear `frontend/.env` con `VITE_API_URL`.)

---

## Cómo se juega

1. Suena un fragmento de la canción; empieza en **1 segundo** y se desbloquea más por ronda (**1s, 2s, 4s, 8s, 16s, 30s**).
2. Adivinar antes vale más (**100 → 10** puntos por ronda).
3. Es **modo racha**: adivinás una y seguís con otra hasta fallar.
4. **Pistas** que restan puntos: año −10, 1ª letra −20, artista −30, tapa −30 (el puntaje puede ir a negativo).
5. Si errás con una canción del **mismo artista**, el artista se **revela solo y gratis**.

## Tecnologías

Node.js · Express · MongoDB / Mongoose · JWT · React · Vite · Vitest · iTunes Search API
