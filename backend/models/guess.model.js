// models/guess.model.js
import mongoose from 'mongoose';

// Cada intento del jugador. Guarda el historial (qué eligió, en qué ronda, si acertó).
const guessSchema = new mongoose.Schema(
    {
        game: { type: mongoose.Schema.Types.ObjectId, ref: 'Game', required: true },
        guessedSong: { type: mongoose.Schema.Types.ObjectId, ref: 'Song', required: true },
        round: { type: Number, required: true },
        correct: { type: Boolean, required: true },
        sameArtist: { type: Boolean, default: false }, // erró la canción pero acertó el artista
    },
    { timestamps: true }
);

export const Guess = mongoose.model('Guess', guessSchema);
