import { describe, test, expect, beforeAll, afterAll, beforeEach, vi } from 'vitest';
import request from 'supertest';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';

// Simulamos iTunes
vi.mock('../services/itunes.service.js', () => ({
    buscarCancionesDeArtista: async (artista) => [
        {
            title: `Tema de ${artista}`, artist: artista, previewUrl: 'http://x/m.m4a',
            year: 2020, genre: 'Rock', itunesId: `mock-${artista}`, coverUrl: 'http://c',
        },
    ],
}));

import app from '../app.js';
import { Song } from '../models/song.model.js';
import { Game } from '../models/game.model.js';
import { User } from '../models/user.model.js';

let mongod;

beforeAll(async () => {
    process.env.JWT_SECRET = 'test_secret';
    mongod = await MongoMemoryServer.create();
    await mongoose.connect(mongod.getUri());
}, 60000);

afterAll(async () => {
    await mongoose.disconnect();
    await mongod.stop();
});

// Catálogo base: 2 canciones del mismo artista + 1 de otro.
const CATALOGO = [
    { title: 'Chau', artist: 'NTVG', previewUrl: 'http://x/1.m4a', year: 2018, genre: 'Rock', itunesId: '1', coverUrl: 'http://c/1' },
    { title: 'A las Nueve', artist: 'NTVG', previewUrl: 'http://x/2.m4a', year: 2018, genre: 'Rock', itunesId: '2', coverUrl: 'http://c/2' },
    { title: 'Zafar', artist: 'La Vela', previewUrl: 'http://x/3.m4a', year: 2011, genre: 'Rock', itunesId: '3', coverUrl: 'http://c/3' },
];

beforeEach(async () => {
    for (const key in mongoose.connection.collections) {
        await mongoose.connection.collections[key].deleteMany({});
    }
    await Song.insertMany(CATALOGO);
});

// --- helpers ---
async function token(username = 'ada') {
    await request(app).post('/auth/register').send({ username, email: `${username}@mail.com`, password: 'clave123' });
    const res = await request(app).post('/auth/login').send({ email: `${username}@mail.com`, password: 'clave123' });
    return res.body.token;
}
const auth = (req, t) => req.set('Authorization', `Bearer ${t}`);
async function setCatalog(songs) {
    await Song.deleteMany({});
    await Song.insertMany(songs);
}

describe('Catálogo', () => {
    test('GET /songs lista las canciones persistidas', async () => {
        const res = await request(app).get('/songs');
        expect(res.status).toBe(200);
        expect(res.body).toHaveLength(3);
    });

    test('GET /songs/search filtra por término', async () => {
        const res = await request(app).get('/songs/search?q=vela');
        expect(res.status).toBe(200);
        expect(res.body).toHaveLength(1);
        expect(res.body[0].artist).toBe('La Vela');
    });

    test('POST /songs sin token → 401', async () => {
        const res = await request(app).post('/songs').send({ artista: 'Test' });
        expect(res.status).toBe(401);
    });

    test('POST /songs importa (iTunes simulado) y no duplica', async () => {
        const t = await token();
        const r1 = await auth(request(app).post('/songs'), t).send({ artista: 'Test' });
        expect(r1.status).toBe(201);
        expect(r1.body.importadas).toBe(1);
        const r2 = await auth(request(app).post('/songs'), t).send({ artista: 'Test' });
        expect(r2.body.importadas).toBe(0); // no duplica
    });
});

describe('Autenticación', () => {
    test('register crea usuario sin filtrar el passwordHash', async () => {
        const res = await request(app).post('/auth/register').send({ username: 'leo', email: 'leo@mail.com', password: 'clave123' });
        expect(res.status).toBe(201);
        expect(res.body.passwordHash).toBeUndefined();
    });

    test('register con email duplicado → 409', async () => {
        await request(app).post('/auth/register').send({ username: 'a', email: 'dup@mail.com', password: 'x' });
        const res = await request(app).post('/auth/register').send({ username: 'b', email: 'dup@mail.com', password: 'x' });
        expect(res.status).toBe(409);
    });

    test('login con contraseña mala → 401', async () => {
        await request(app).post('/auth/register').send({ username: 'c', email: 'c@mail.com', password: 'buena' });
        const res = await request(app).post('/auth/login').send({ email: 'c@mail.com', password: 'mala' });
        expect(res.status).toBe(401);
    });

    test('GET /auth/me sin token → 401', async () => {
        const res = await request(app).get('/auth/me');
        expect(res.status).toBe(401);
    });

    test('GET /auth/me con token → perfil', async () => {
        const t = await token('perfil');
        const res = await auth(request(app).get('/auth/me'), t);
        expect(res.status).toBe(200);
        expect(res.body.username).toBe('perfil');
    });
});

describe('El juego', () => {
    test('POST /games sin token → 401', async () => {
        const res = await request(app).post('/games');
        expect(res.status).toBe(401);
    });

    test('POST /games inicia sin revelar la canción', async () => {
        const t = await token();
        const res = await auth(request(app).post('/games'), t);
        expect(res.status).toBe(201);
        expect(res.body.currentRound).toBe(1);
        expect(res.body.allowedDuration).toBe(1); // ronda 1 = 1 segundo
        expect(res.body.title).toBeUndefined(); // no revela la respuesta
    });

    test('DELETE /games/:id abandona la partida', async () => {
        const t = await token();
        const juego = await auth(request(app).post('/games'), t);
        const id = juego.body.id;

        const del = await auth(request(app).delete(`/games/${id}`), t);
        expect(del.status).toBe(200);
        expect(del.body.abandoned).toBe(true);

        // ya no existe: pedir su estado da 404
        const estado = await auth(request(app).get(`/games/${id}`), t);
        expect(estado.status).toBe(404);
    });

    test('adivinar la canción correcta suma puntos y pasa a otra', async () => {
        const t = await token();
        const start = await auth(request(app).post('/games'), t);
        const game = await Game.findById(start.body.id);
        const res = await auth(request(app).post(`/games/${start.body.id}/guess`).send({ guessedSongId: game.currentSong }), t);
        expect(res.body.correct).toBe(true);
        expect(res.body.pointsEarned).toBe(100); // ronda 1
        expect(res.body.songsCompleted).toBe(1);
        expect(res.body.currentRound).toBe(1); // nueva canción arranca de 1
    });

    test('errar con el mismo artista da sameArtist y desbloquea el artista', async () => {
        const t = await token();
        await setCatalog([
            { title: 'A', artist: 'MismoArt', previewUrl: 'u', itunesId: 'a', year: 2000, coverUrl: 'c' },
            { title: 'B', artist: 'MismoArt', previewUrl: 'u', itunesId: 'b', year: 2000, coverUrl: 'c' },
        ]);
        const start = await auth(request(app).post('/games'), t);
        const game = await Game.findById(start.body.id);
        const otra = await Song.findOne({ _id: { $ne: game.currentSong } });
        const res = await auth(request(app).post(`/games/${start.body.id}/guess`).send({ guessedSongId: otra._id }), t);
        expect(res.body.correct).toBe(false);
        expect(res.body.sameArtist).toBe(true);
        expect(res.body.artistRevealed).toBe(true);
    });

    test('la pista de año resta puntos (score puede ir a negativo)', async () => {
        const t = await token();
        const start = await auth(request(app).post('/games'), t);
        const res = await auth(request(app).post(`/games/${start.body.id}/hint`).send({ tipo: 'anio' }), t);
        expect(res.body.costo).toBe(10);
        expect(res.body.totalScore).toBe(-10);
    });

    test('la pista de artista es gratis si ya se desbloqueó (🟡)', async () => {
        const t = await token();
        await setCatalog([
            { title: 'A', artist: 'ArtX', previewUrl: 'u', itunesId: 'a', year: 2000, coverUrl: 'c' },
            { title: 'B', artist: 'ArtX', previewUrl: 'u', itunesId: 'b', year: 2000, coverUrl: 'c' },
        ]);
        const start = await auth(request(app).post('/games'), t);
        const game = await Game.findById(start.body.id);
        const otra = await Song.findOne({ _id: { $ne: game.currentSong } });
        await auth(request(app).post(`/games/${start.body.id}/guess`).send({ guessedSongId: otra._id }), t); // 🟡
        const res = await auth(request(app).post(`/games/${start.body.id}/hint`).send({ tipo: 'artista' }), t);
        expect(res.body.costo).toBe(0); // gratis
    });

    test('agotar las rondas termina la partida (game over)', async () => {
        const t = await token();
        const start = await auth(request(app).post('/games'), t);
        let res;
        for (let i = 0; i < 6; i++) {
            res = await auth(request(app).post(`/games/${start.body.id}/skip`), t);
        }
        expect(res.body.status).toBe('over');
    });

    test('no se puede jugar una partida terminada → 409', async () => {
        const t = await token();
        const start = await auth(request(app).post('/games'), t);
        for (let i = 0; i < 6; i++) await auth(request(app).post(`/games/${start.body.id}/skip`), t);
        const game = await Game.findById(start.body.id);
        const res = await auth(request(app).post(`/games/${start.body.id}/guess`).send({ guessedSongId: game.currentSong }), t);
        expect(res.status).toBe(409);
    });

    test('rendirse termina la partida y guarda el puntaje en el récord', async () => {
        const t = await token();
        const start = await auth(request(app).post('/games'), t);
        const game = await Game.findById(start.body.id);
        // acierta una (100 pts en ronda 1)
        await auth(request(app).post(`/games/${start.body.id}/guess`).send({ guessedSongId: game.currentSong }), t);
        // se rinde
        const res = await auth(request(app).post(`/games/${start.body.id}/surrender`), t);
        expect(res.status).toBe(200);
        expect(res.body.status).toBe('over');
        // el puntaje quedó en el perfil
        const me = await auth(request(app).get('/auth/me'), t);
        expect(me.body.bestScore).toBe(100);
    });
});

describe('Leaderboard', () => {
    test('GET /leaderboard devuelve jugadores ordenados por bestScore', async () => {
        // dos usuarios con distintos bestScore
        await User.create({ username: 'top', email: 'top@mail.com', passwordHash: 'x', bestScore: 500 });
        await User.create({ username: 'bajo', email: 'bajo@mail.com', passwordHash: 'x', bestScore: 100 });
        const res = await request(app).get('/leaderboard');
        expect(res.status).toBe(200);
        expect(res.body[0].username).toBe('top'); // el de mayor puntaje primero
        expect(res.body[0].bestScore).toBe(500);
    });
});
