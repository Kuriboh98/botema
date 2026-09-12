// routes/leaderboard.routes.js
import express from 'express';
import * as leaderboardController from '../controllers/leaderboard.controller.js';

const router = express.Router();

router.get('/', leaderboardController.listar); // GET /leaderboard (público)

export default router;
