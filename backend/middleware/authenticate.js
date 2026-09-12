// middleware/authenticate.js
import jwt from 'jsonwebtoken';
import { httpError } from '../utils/httpError.js';

// Protege rutas: exige un token JWT válido en la cabecera Authorization.
export function authenticate(req, res, next) {
    const header = req.headers.authorization; // "Bearer eyJhbGc..."

    if (!header || !header.startsWith('Bearer ')) {
        return next(httpError(401, 'Token faltante'));
    }

    const token = header.split(' ')[1];
    try {
        const payload = jwt.verify(token, process.env.JWT_SECRET);
        req.user = payload; // { id, username } -> disponible en los controllers
        next();
    } catch {
        next(httpError(401, 'Token inválido o expirado'));
    }
}
