// app.js
import express from 'express';
import cors from 'cors';
import songRouter from './routes/song.routes.js';
import authRouter from './routes/auth.routes.js';
import gameRouter from './routes/game.routes.js';
import leaderboardRouter from './routes/leaderboard.routes.js';

const app = express();

app.use(cors()); // permite que el frontend (otro origen) le hable a la API
app.use(express.json());

// Health check
app.get('/', (req, res) => {
    res.json({ ok: true, service: 'BoTema API' });
});

// Rutas
app.use('/auth', authRouter);
app.use('/songs', songRouter);
app.use('/games', gameRouter);
app.use('/leaderboard', leaderboardRouter);

// 404
app.use((req, res) => {
    res.status(404).json({ error: 'Ruta no encontrada' });
});

// Manejador de errores: usa err.status y el formato { "error": "..." }
app.use((err, req, res, next) => {
    // Errores reales de Mongo
    if (err.name === 'CastError') {
        return res.status(400).json({ error: 'id inválido' });
    }
    if (err.name === 'ValidationError') {
        return res.status(400).json({ error: err.message });
    }
    if (err.code === 11000) {
        return res.status(409).json({ error: 'Valor duplicado' });
    }

    const status = err.status || 500;
    if (status === 500) console.error(err);
    res.status(status).json({ error: err.message || 'Error interno del servidor' });
});

export default app;
