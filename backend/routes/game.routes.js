// routes/game.routes.js
import express from 'express';
import * as gameController from '../controllers/game.controller.js';
import { authenticate } from '../middleware/authenticate.js';

const router = express.Router();

// TODAS las rutas del juego requieren estar logueado.
router.use(authenticate);

router.post('/', gameController.iniciar); //            POST  /games            (iniciar racha)
router.get('/:id', gameController.estado); //           GET   /games/:id         (estado)
router.post('/:id/guess', gameController.adivinar); //  POST  /games/:id/guess   (adivinar)
router.post('/:id/skip', gameController.pasar); //      POST  /games/:id/skip    (pasar de ronda)
router.post('/:id/hint', gameController.pista); //      POST  /games/:id/hint    (pedir pista)
router.delete('/:id', gameController.abandonar); //     DELETE /games/:id        (abandonar partida)

export default router;
