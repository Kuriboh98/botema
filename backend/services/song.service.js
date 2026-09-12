// services/song.service.js
import { Song } from '../models/song.model.js';
import { buscarCancionesDeArtista } from './itunes.service.js';


export async function importarArtista(artista) {
    const canciones = await buscarCancionesDeArtista(artista);
    let importadas = 0;

    for (const c of canciones) {
        const res = await Song.updateOne(
            { itunesId: c.itunesId },
            { $setOnInsert: c },
            { upsert: true }
        );
        if (res.upsertedCount) importadas++;
    }

    return { artista, encontradas: canciones.length, importadas };
}

// Lista el catálogo.
export async function listarCanciones() {
    return Song.find().select('title artist coverUrl year genre');
}

// Autocomplete: busca por título o artista, SIN importar tildes.
export async function buscarEnCatalogo(q) {
    if (!q || !q.trim()) return [];
    const regex = new RegExp(regexInsensible(q.trim()), 'i');
    return Song.find({ $or: [{ title: regex }, { artist: regex }] })
        .select('title artist coverUrl')
        .limit(10);
}

// Escapa caracteres especiales y hace que cada vocal/ñ matchee con o sin tilde.
// Así "ruben" encuentra "Rubén", "marama" encuentra "Márama", etc.
function regexInsensible(texto) {
    const escapado = texto.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    return escapado
        .replace(/[aáàäâ]/gi, '[aáàäâ]')
        .replace(/[eéèëê]/gi, '[eéèëê]')
        .replace(/[iíìïî]/gi, '[iíìïî]')
        .replace(/[oóòöô]/gi, '[oóòöô]')
        .replace(/[uúùüû]/gi, '[uúùüû]')
        .replace(/[nñ]/gi, '[nñ]');
}
