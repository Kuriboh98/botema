// services/game.service.js
import { Game } from '../models/game.model.js';
import { Guess } from '../models/guess.model.js';
import { Song } from '../models/song.model.js';
import { User } from '../models/user.model.js';
import { httpError } from '../utils/httpError.js';
import { DURACIONES, PUNTOS, COSTOS_PISTA, RONDAS_MAX } from '../config/game.config.js';

// ================================================================
// INICIAR PARTIDA — elige una canción random y arranca la racha
// ================================================================
export async function iniciarPartida(userId) {
    const cancion = await elegirCancionRandom();
    if (!cancion) throw httpError(409, 'No hay canciones en el catálogo');

    const game = await Game.create({ user: userId, currentSong: cancion._id });
    return estadoPublico(game, cancion);
}

// ================================================================
// ESTADO — devuelve la ronda, la duración permitida y el audio,
// SIN revelar la canción (salvo que la partida haya terminado)
// ================================================================
export async function obtenerEstado(userId, gameId) {
    const game = await cargarPartida(gameId, userId);
    const cancion = await Song.findById(game.currentSong);
    const estado = estadoPublico(game, cancion);
    if (game.status === 'over') estado.revealed = infoCancion(cancion);
    return estado;
}

// ================================================================
// ADIVINAR — el corazón. 3 caminos: acierta / erra-sigue / game over
// ================================================================
export async function adivinar(userId, gameId, guessedSongId) {
    const game = await cargarPartidaJugable(gameId, userId);
    const objetivo = await Song.findById(game.currentSong);
    const elegida = await Song.findById(guessedSongId);
    if (!elegida) throw httpError(404, 'La canción elegida no existe');

    const correct = String(elegida._id) === String(objetivo._id);
    const sameArtist = !correct && elegida.artist === objetivo.artist;

    // Guardamos el intento en el historial
    await Guess.create({
        game: game._id,
        guessedSong: elegida._id,
        round: game.currentRound,
        correct,
        sameArtist,
    });

    // --- CAMINO 1: acertó ---
    if (correct) {
        const pointsEarned = PUNTOS[game.currentRound];
        game.totalScore += pointsEarned;
        game.songsCompleted += 1;
        game.playedSongs.push(objetivo._id);

        const siguiente = await elegirCancionRandom(game.playedSongs);
        if (!siguiente) {
            await terminarPartida(game); // se acabó el catálogo
            return { correct: true, pointsEarned, revealed: infoCancion(objetivo), ...resumenFinal(game) };
        }
        // reiniciamos para la nueva canción
        game.currentSong = siguiente._id;
        game.currentRound = 1;
        game.hintsUsed = [];
        game.artistRevealed = false;
        await game.save();

        return { correct: true, pointsEarned, revealed: infoCancion(objetivo), ...estadoPublico(game, siguiente) };
    }

    // --- erró: el amarillo revela el artista automáticamente (gratis) ---
    if (sameArtist) {
        game.artistRevealed = true;
        if (!game.hintsUsed.includes('artista')) game.hintsUsed.push('artista');
    }
    game.currentRound += 1;

    // --- CAMINO 3: agotó las 6 rondas -> game over ---
    if (game.currentRound > RONDAS_MAX) {
        await terminarPartida(game);
        return { correct: false, sameArtist, revealed: infoCancion(objetivo), ...resumenFinal(game) };
    }

    // --- CAMINO 2: erró pero quedan rondas ---
    await game.save();
    return { correct: false, sameArtist, ...estadoPublico(game, objetivo) };
}

// ================================================================
// PASAR DE RONDA — como errar, pero sin adivinar
// ================================================================
export async function pasarRonda(userId, gameId) {
    const game = await cargarPartidaJugable(gameId, userId);
    game.currentRound += 1;

    const objetivo = await Song.findById(game.currentSong);
    if (game.currentRound > RONDAS_MAX) {
        await terminarPartida(game);
        return { skipped: true, revealed: infoCancion(objetivo), ...resumenFinal(game) };
    }
    await game.save();
    return { skipped: true, ...estadoPublico(game, objetivo) };
}

// ================================================================
// PEDIR PISTA — resta puntos (salvo el artista si ya se reveló)
// ================================================================
export async function pedirPista(userId, gameId, tipo) {
    const game = await cargarPartidaJugable(gameId, userId);
    const cancion = await Song.findById(game.currentSong);

    const valores = {
        anio: cancion.year,
        letra: cancion.title?.charAt(0).toUpperCase(),
        artista: cancion.artist,
        tapa: cancion.coverUrl,
    };
    if (!(tipo in valores)) {
        throw httpError(400, 'Tipo de pista inválido (anio, letra, artista, tapa)');
    }

    const yaUsada = game.hintsUsed.includes(tipo);
    const gratis = tipo === 'artista' && game.artistRevealed;

    let costo = 0;
    if (!yaUsada) {
        if (!gratis) {
            costo = COSTOS_PISTA[tipo];
            game.totalScore -= costo; // puede quedar negativo (a propósito)
        }
        game.hintsUsed.push(tipo);
        await game.save();
    }

    return { tipo, valor: valores[tipo], costo, totalScore: game.totalScore };
}

// ================================================================
// RENDIRSE — termina la partida AHORA, conservando el puntaje actual
// ================================================================
export async function rendirse(userId, gameId) {
    const game = await cargarPartidaJugable(gameId, userId);
    const objetivo = await Song.findById(game.currentSong);
    await terminarPartida(game); // cierra la partida y actualiza el récord
    return { surrendered: true, revealed: infoCancion(objetivo), ...resumenFinal(game) };
}

// ================================================================
// ABANDONAR PARTIDA — el jugador la borra (con sus intentos)
// ================================================================
export async function abandonarPartida(userId, gameId) {
    const game = await cargarPartida(gameId, userId); // 404 si no es del usuario
    await Guess.deleteMany({ game: game._id });
    await Game.deleteOne({ _id: game._id });
    return { abandoned: true };
}

// ================================================================
// Helpers internos
// ================================================================

// Elige una canción al azar del catálogo, excluyendo las ya jugadas.
async function elegirCancionRandom(excluir = []) {
    const [song] = await Song.aggregate([
        { $match: { _id: { $nin: excluir } } },
        { $sample: { size: 1 } },
    ]);
    return song || null;
}

async function cargarPartida(gameId, userId) {
    const game = await Game.findOne({ _id: gameId, user: userId });
    if (!game) throw httpError(404, 'Partida no encontrada');
    return game;
}

async function cargarPartidaJugable(gameId, userId) {
    const game = await cargarPartida(gameId, userId);
    if (game.status !== 'playing') throw httpError(409, 'La partida ya terminó');
    return game;
}

// Cierra la partida y actualiza el récord del usuario.
async function terminarPartida(game) {
    game.status = 'over';
    await game.save();
    const user = await User.findById(game.user);
    user.gamesPlayed += 1;
    user.songsCompleted += game.songsCompleted; // sumamos las de esta partida al total
    if (game.totalScore > user.bestScore) {
        user.bestScore = game.totalScore;
        user.bestScoreAt = new Date(); // registramos cuándo hizo el récord
    }
    await user.save();
}

// El estado que ve el jugador (SIN la respuesta).
function estadoPublico(game, cancion) {
    return {
        id: game._id,
        status: game.status,
        currentRound: game.currentRound,
        allowedDuration: DURACIONES[game.currentRound], // segundos que puede escuchar
        previewUrl: cancion.previewUrl, // el audio (el título no se ve)
        totalScore: game.totalScore,
        songsCompleted: game.songsCompleted,
        artistRevealed: game.artistRevealed,
        hintsUsed: game.hintsUsed,
    };
}

// Datos de una canción para revelarla (al acertar o al terminar).
function infoCancion(s) {
    return { title: s.title, artist: s.artist, coverUrl: s.coverUrl, year: s.year };
}

function resumenFinal(game) {
    return {
        status: 'over',
        totalScore: game.totalScore,
        songsCompleted: game.songsCompleted,
    };
}
