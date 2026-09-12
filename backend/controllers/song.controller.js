// controllers/song.controller.js
import * as songService from '../services/song.service.js';
import { httpError } from '../utils/httpError.js';

// POST /songs  importa un artista de iTunes al catálogo
export async function importar(req, res, next) {
    try {
        const { artista } = req.body;
        if (!artista) throw httpError(400, 'Falta el campo "artista"');
        const resultado = await songService.importarArtista(artista);
        res.status(201).json(resultado);
    } catch (err) {
        next(err);
    }
}

// GET /songs lista el catálogo
export async function listar(req, res, next) {
    try {
        res.json(await songService.listarCanciones());
    } catch (err) {
        next(err);
    }
}

// GET /songs/search?q=  autocomplete
export async function buscar(req, res, next) {
    try {
        res.json(await songService.buscarEnCatalogo(req.query.q));
    } catch (err) {
        next(err);
    }
}
