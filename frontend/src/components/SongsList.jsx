// src/components/SongsList.jsx
import { useState, useEffect, useMemo } from 'react';
import { Icon } from '@iconify/react';
import { api } from '../api';

const POR_PAGINA = 20;

export default function SongsList({ onBack }) {
    const [canciones, setCanciones] = useState(null);
    const [error, setError] = useState('');
    const [q, setQ] = useState('');
    const [pagina, setPagina] = useState(1);

    useEffect(() => {
        api.songs().then(setCanciones).catch((e) => setError(e.message));
    }, []);

    // Al cambiar la búsqueda, volvemos a la primera página.
    useEffect(() => setPagina(1), [q]);

    const texto = q.trim().toLowerCase();

    // Lista según la búsqueda (o todas si no hay), ordenada por título.
    const lista = useMemo(() => {
        if (!canciones) return [];
        const base = texto
            ? canciones.filter(
                  (s) => s.title.toLowerCase().includes(texto) || s.artist.toLowerCase().includes(texto)
              )
            : canciones;
        return [...base].sort((a, b) => a.title.localeCompare(b.title));
    }, [canciones, texto]);

    if (error) return <p className="error">{error}</p>;
    if (!canciones) return <p className="loading">Cargando canciones...</p>;

    const totalPaginas = Math.max(1, Math.ceil(lista.length / POR_PAGINA));
    const paginaActual = Math.min(pagina, totalPaginas);
    const desde = (paginaActual - 1) * POR_PAGINA;
    const items = lista.slice(desde, desde + POR_PAGINA);

    return (
        <div className="songs-list">
            <div className="songs-head">
                <button className="btn-ghost" onClick={onBack}><Icon icon="game-icons:return-arrow" className="ic" /> Volver</button>
                <h2><Icon icon="game-icons:musical-notes" className="ic" /> Canciones ({canciones.length})</h2>
            </div>

            <div className="search">
                <div className="search-field">
                    <Icon icon="game-icons:magnifying-glass" className="search-ico" />
                    <input
                        value={q}
                        onChange={(e) => setQ(e.target.value)}
                        placeholder="Buscar por título o artista..."
                    />
                    {q && (
                        <button className="search-clear" onClick={() => setQ('')} aria-label="Borrar" type="button">
                            <Icon icon="game-icons:cross-mark" />
                        </button>
                    )}
                </div>
            </div>

            {lista.length === 0 ? (
                <p className="lb-empty">No hay canciones que coincidan.</p>
            ) : (
                <>
                    <p className="results-info">
                        {lista.length} canción(es) — página {paginaActual} de {totalPaginas}
                    </p>
                    <ul className="songs-ul">
                        {items.map((s) => (
                            <li key={s._id}>
                                {s.coverUrl && <img className="song-cover" src={s.coverUrl} alt="" />}
                                <div className="song-info">
                                    <span className="s-title">{s.title}</span>
                                    <span className="s-artist">{s.artist}{s.year ? ` · ${s.year}` : ''}</span>
                                </div>
                            </li>
                        ))}
                    </ul>

                    {totalPaginas > 1 && (
                        <div className="pager">
                            <button
                                className="btn-ghost"
                                onClick={() => setPagina((p) => p - 1)}
                                disabled={paginaActual === 1}
                            >
                                <Icon icon="game-icons:previous-button" className="ic" /> Anterior
                            </button>
                            <span className="pager-num">{paginaActual} / {totalPaginas}</span>
                            <button
                                className="btn-ghost"
                                onClick={() => setPagina((p) => p + 1)}
                                disabled={paginaActual === totalPaginas}
                            >
                                Siguiente <Icon icon="game-icons:next-button" className="ic" />
                            </button>
                        </div>
                    )}
                </>
            )}
        </div>
    );
}
