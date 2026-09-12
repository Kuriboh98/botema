// src/auth.js
// Guarda/lee/borra la sesión (token + usuario) en el navegador.

export function saveSession(token, user) {
    localStorage.setItem('botema_token', token);
    localStorage.setItem('botema_user', JSON.stringify(user));
}

export function getUser() {
    try {
        return JSON.parse(localStorage.getItem('botema_user'));
    } catch {
        return null;
    }
}

export function logout() {
    localStorage.removeItem('botema_token');
    localStorage.removeItem('botema_user');
}
