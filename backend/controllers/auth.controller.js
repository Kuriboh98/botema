// controllers/auth.controller.js
import * as authService from '../services/auth.service.js';

export async function register(req, res, next) {
    try {
        const user = await authService.register(req.body);
        res.status(201).json(user);
    } catch (err) {
        next(err);
    }
}

export async function login(req, res, next) {
    try {
        const result = await authService.login(req.body);
        res.json(result);
    } catch (err) {
        next(err);
    }
}

// Ruta protegida de ejemplo: devuelve el perfil del usuario del token.
export async function me(req, res, next) {
    try {
        const user = await authService.getPerfil(req.user.id);
        res.json(user);
    } catch (err) {
        next(err);
    }
}
