// services/song.service.js
import { Song } from '../models/song.model.js';
import { buscarCancionesDeArtista, buscarCancionExacta } from './itunes.service.js';


export async function importarArtista(artista) {
    const canciones = await buscarCancionesDeArtista(artista);
    let importadas = 0;
    const vistas = new Set(); // título+artista ya procesados en esta importación

    for (const c of canciones) {
        // Evitamos duplicados: mismo título y artista (iTunes trae el tema en varios álbumes)
        const clave = `${c.title.toLowerCase().trim()}|${c.artist.toLowerCase().trim()}`;
        if (vistas.has(clave)) continue;
        vistas.add(clave);

        // Si ya está en el catálogo (mismo título y artista), no lo duplicamos
        const yaExiste = await Song.findOne({ title: c.title, artist: c.artist }).select('_id');
        if (yaExiste) continue;

        const res = await Song.updateOne(
            { itunesId: c.itunesId },
            { $setOnInsert: c },
            { upsert: true }
        );
        if (res.upsertedCount) importadas++;
    }

    return { artista, encontradas: canciones.length, importadas };
}

// Importa UNA canción específica (título + artista, año opcional).
export async function importarCancion(criterio) {
    const c = await buscarCancionExacta(criterio);
    if (!c) return { ...criterio, importada: false, motivo: 'no encontrada en iTunes' };

    const yaExiste = await Song.findOne({ title: c.title, artist: c.artist }).select('_id');
    if (yaExiste) return { ...criterio, importada: false, motivo: 'ya estaba en el catálogo' };

    await Song.updateOne({ itunesId: c.itunesId }, { $setOnInsert: c }, { upsert: true });
    return { ...criterio, importada: true, title: c.title, artist: c.artist, year: c.year };
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
