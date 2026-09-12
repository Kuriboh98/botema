// controllers/game.controller.js
import * as gameService from '../services/game.service.js';
import { httpError } from '../utils/httpError.js';

// req.user.id lo pone el middleware authenticate (viene del token).

export async function iniciar(req, res, next) {
    try {
        res.status(201).json(await gameService.iniciarPartida(req.user.id));
    } catch (err) {
        next(err);
    }
}

export async function estado(req, res, next) {
    try {
        res.json(await gameService.obtenerEstado(req.user.id, req.params.id));
    } catch (err) {
        next(err);
    }
}

export async function adivinar(req, res, next) {
    try {
        const { guessedSongId } = req.body;
        if (!guessedSongId) throw httpError(400, 'Falta el campo "guessedSongId"');
        res.json(await gameService.adivinar(req.user.id, req.params.id, guessedSongId));
    } catch (err) {
        next(err);
    }
}

export async function pasar(req, res, next) {
    try {
        res.json(await gameService.pasarRonda(req.user.id, req.params.id));
    } catch (err) {
        next(err);
    }
}

export async function pista(req, res, next) {
    try {
        const { tipo } = req.body;
        if (!tipo) throw httpError(400, 'Falta el campo "tipo" (anio, letra, artista, tapa)');
        res.json(await gameService.pedirPista(req.user.id, req.params.id, tipo));
    } catch (err) {
        next(err);
    }
}
