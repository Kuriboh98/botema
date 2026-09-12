// config/game.config.js
// Las "reglas del juego" en números, en un solo lugar (fácil de ajustar).

// Segundos de audio que se pueden escuchar en cada ronda.
export const DURACIONES = { 1: 1, 2: 2, 3: 4, 4: 8, 5: 16, 6: 30 };

// Puntos que ganás si adivinás en cada ronda (antes = más).
export const PUNTOS = { 1: 100, 2: 80, 3: 60, 4: 40, 5: 20, 6: 10 };

// Cuánto RESTA cada pista.
export const COSTOS_PISTA = { anio: 10, letra: 20, artista: 30, tapa: 30 };

// Rondas por canción.
export const RONDAS_MAX = 6;
