// services/itunes.service.js
// Cliente de la iTunes Search API.

import { CANCIONES_BLOQUEADAS } from '../config/blocklist.js';

const BASE = 'https://itunes.apple.com/search';

export async function buscarCancionesDeArtista(artista, limit = 25) {
    const url = `${BASE}?term=${encodeURIComponent(artista)}&entity=song&country=UY&limit=${limit}`;

    const res = await fetch(url);
    if (!res.ok) {
        throw new Error('Error consultando iTunes');
    }
    const data = await res.json();

    const buscado = normalizar(artista);

    return data.results
        .filter(
            (r) =>
                r.previewUrl && // solo las que tienen audio
                artistaCoincide(r.artistName, buscado) && // que el ARTISTA sea EXACTAMENTE el buscado
                !esEnVivo(r) && // que NO sea una versión en vivo
                !esExplicita(r) && // que NO esté marcada como explícita
                !estaBloqueada(r) // y que no esté en la lista negra manual
        )
        .map((r) => ({
            title: r.trackName,
            artist: r.artistName,
            previewUrl: r.previewUrl,
            coverUrl: r.artworkUrl100?.replace('100x100bb', '600x600bb'),
            year: r.releaseDate ? new Date(r.releaseDate).getFullYear() : null,
            genre: r.primaryGenreName,
            itunesId: String(r.trackId),
        }));
}

// Pasa a minúsculas y saca los acentos, para comparar sin importar tildes.
// Así "Márama" coincide con "marama", y una colaboración "Marama & X" también.
function normalizar(s) {
    return (s || '')
        .toLowerCase()
        .normalize('NFD')
        .replace(/[̀-ͯ]/g, '');
}

// Detecta si una canción es una versión EN VIVO (mirando el título y el álbum).
function esEnVivo(r) {
    const texto = normalizar(`${r.trackName || ''} ${r.collectionName || ''}`);
    return /(en vivo|en directo|en concierto|\blive\b|unplugged)/.test(texto);
}

// ¿iTunes marca el tema (o su álbum) como explícito?
function esExplicita(r) {
    return r.trackExplicitness === 'explicit' || r.collectionExplicitness === 'explicit';
}

// ¿Está en la lista negra manual?
// El título se compara EXACTO (respeta tildes y puntuación; solo ignora mayúsculas),
// para no confundir versiones parecidas. Artista: coincide por inclusión. Año: exacto.
function estaBloqueada(r) {
    const titulo = (r.trackName || '').trim().toLowerCase();
    const artista = normalizar(r.artistName);
    const anio = r.releaseDate ? new Date(r.releaseDate).getFullYear() : null;
    return CANCIONES_BLOQUEADAS.some((b) => {
        if ((b.title || '').trim().toLowerCase() !== titulo) return false;
        if (b.artist && !artista.includes(normalizar(b.artist))) return false;
        if (b.year && anio !== b.year) return false;
        return true;
    });
}

// ¿El artista buscado aparece como un artista PROPIO del resultado?
// Separa colaboraciones (por &, coma, feat, ft, vs) y exige coincidencia EXACTA,
// para que "Buitres" NO matchee con "Los Buitres de Culiacán Sinaloa".
function artistaCoincide(artistName, buscado) {
    const segmentos = normalizar(artistName).split(/\s*[&,]\s*|\s+feat\.?\s+|\s+ft\.?\s+|\s+vs\.?\s+/);
    return segmentos.some((seg) => seg.trim() === buscado);
}
