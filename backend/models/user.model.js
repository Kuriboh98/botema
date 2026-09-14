// models/user.model.js
import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
    {
        username: { type: String, required: true, unique: true, trim: true },
        email: { type: String, required: true, unique: true, lowercase: true, trim: true },
        passwordHash: { type: String, required: true }, 
        bestScore: { type: Number, default: 0 },
        bestScoreAt: { type: Date }, // cuándo hizo su mejor puntaje
        gamesPlayed: { type: Number, default: 0 },
        songsCompleted: { type: Number, default: 0 }, // canciones acertadas en total (todas las partidas)
    },
    { timestamps: true }
);

export const User = mongoose.model('User', userSchema);
