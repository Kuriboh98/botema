// src/api.js
// Cliente de la API de BoTema. Un solo lugar que sabe hablar con el backend.

const BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000';

function getToken() {
    return localStorage.getItem('botema_token');
}

// Función base: arma el pedido, agrega el token si hace falta, y maneja errores.
async function request(path, { method = 'GET', body, auth = false } = {}) {
    const headers = {};
    if (body) headers['Content-Type'] = 'application/json';
    if (auth && getToken()) headers['Authorization'] = `Bearer ${getToken()}`;

    const res = await fetch(BASE + path, {
        method,
        headers,
        body: body ? JSON.stringify(body) : undefined,
    });

    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error || 'Ocurrió un error');
    return data;
}

export const api = {
    // Auth
    register: (data) => request('/auth/register', { method: 'POST', body: data }),
    login: (data) => request('/auth/login', { method: 'POST', body: data }),
    me: () => request('/auth/me', { auth: true }),

    // Catálogo
    searchSongs: (q) => request(`/songs/search?q=${encodeURIComponent(q)}`),
    songs: () => request('/songs'),

    // Juego (todas requieren token)
    startGame: () => request('/games', { method: 'POST', auth: true }),
    getGame: (id) => request(`/games/${id}`, { auth: true }),
    guess: (id, guessedSongId) =>
        request(`/games/${id}/guess`, { method: 'POST', body: { guessedSongId }, auth: true }),
    skip: (id) => request(`/games/${id}/skip`, { method: 'POST', auth: true }),
    hint: (id, tipo) => request(`/games/${id}/hint`, { method: 'POST', body: { tipo }, auth: true }),

    // Ranking
    leaderboard: () => request('/leaderboard'),
};
