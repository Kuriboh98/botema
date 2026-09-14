// services/auth.service.js
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User } from '../models/user.model.js';
import { httpError } from '../utils/httpError.js';

export async function register({ username, email, password }) {
    if (!username || !email || !password) {
        throw httpError(400, 'username, email y password son requeridos');
    }

    const existe = await User.findOne({
        $or: [{ email: email.toLowerCase() }, { username }],
    });
    if (existe) throw httpError(409, 'El email o el username ya está registrado');

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await User.create({ username, email, passwordHash });

    return usuarioPublico(user);
}

export async function login({ email, password }) {
    if (!email || !password) throw httpError(400, 'email y password son requeridos');

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) throw httpError(401, 'Credenciales inválidas');

    const coincide = await bcrypt.compare(password, user.passwordHash);
    if (!coincide) throw httpError(401, 'Credenciales inválidas');

    const token = firmarToken(user);
    return { token, user: usuarioPublico(user) };
}

export async function getPerfil(id) {
    const user = await User.findById(id).select('username email bestScore bestScoreAt gamesPlayed songsCompleted');
    if (!user) throw httpError(404, 'Usuario no encontrado');
    return user;
}


function firmarToken(user) {
    return jwt.sign(
        { id: user._id, username: user.username }, 
        process.env.JWT_SECRET,
        { expiresIn: '7d' }
    );
}

function usuarioPublico(user) {
    return {
        id: user._id,
        username: user.username,
        email: user.email,
        bestScore: user.bestScore,
        gamesPlayed: user.gamesPlayed,
    };
}
