// services/leaderboard.service.js
import { User } from '../models/user.model.js';

// Ranking general: los 10 jugadores con mejor racha.
export async function obtenerLeaderboard() {
    return User.find()
        .sort({ bestScore: -1 }) // de mayor a menor
        .limit(10)
        .select('username bestScore bestScoreAt');
}
