// controllers/leaderboard.controller.js
import * as leaderboardService from '../services/leaderboard.service.js';

export async function listar(req, res, next) {
    try {
        res.json(await leaderboardService.obtenerLeaderboard());
    } catch (err) {
        next(err);
    }
}
