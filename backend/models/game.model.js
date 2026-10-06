// models/game.model.js
import mongoose from 'mongoose';

// Una partida = una racha. Lleva la canción actual (oculta), en qué ronda vas,
// el puntaje acumulado, y el estado de las pistas de la canción en curso.
const gameSchema = new mongoose.Schema(
    {
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
        currentSong: { type: mongoose.Schema.Types.ObjectId, ref: 'Song', required: true },
        currentRound: { type: Number, default: 1 }, // 1..6
        status: { type: String, enum: ['playing', 'over'], default: 'playing' },
        totalScore: { type: Number, default: 0 },
        songsCompleted: { type: Number, default: 0 },
        playedSongs: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Song' }], // para no repetir
        hintsUsed: [{ type: String }], // pistas de la canción ACTUAL (se resetea al cambiar)
        artistRevealed: { type: Boolean, default: false }, // se desbloqueó el artista gratis
    },
    { timestamps: true }
);

export const Game = mongoose.model('Game', gameSchema);
