// services/itunes.service.js
// Cliente de la iTunes Search API.

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
                !esEnVivo(r) // y que NO sea una versión en vivo
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

// ¿El artista buscado aparece como un artista PROPIO del resultado?
// Separa colaboraciones (por &, coma, feat, ft, vs) y exige coincidencia EXACTA,
// para que "Buitres" NO matchee con "Los Buitres de Culiacán Sinaloa".
function artistaCoincide(artistName, buscado) {
    const segmentos = normalizar(artistName).split(/\s*[&,]\s*|\s+feat\.?\s+|\s+ft\.?\s+|\s+vs\.?\s+/);
    return segmentos.some((seg) => seg.trim() === buscado);
}
