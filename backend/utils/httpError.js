// utils/httpError.js
// Crea un Error con un status HTTP pegado, para que el errorHandler lo lea.
export function httpError(status, message) {
    const err = new Error(message);
    err.status = status;
    return err;
}
