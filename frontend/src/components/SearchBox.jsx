// src/components/SearchBox.jsx
import { useState, useEffect } from 'react';
import { api } from '../api';

// Buscador con autocomplete: busca en el catálogo y sugiere canciones.
export default function SearchBox({ onSelect, disabled }) {
    const [q, setQ] = useState('');
    const [resultados, setResultados] = useState([]);

    // Cada vez que cambia lo escrito, buscamos (con un pequeño retraso, para no
    // pedir en cada tecla).
    useEffect(() => {
        if (!q.trim()) {
            setResultados([]);
            return;
        }
        const t = setTimeout(async () => {
            try {
                setResultados(await api.searchSongs(q));
            } catch {
                setResultados([]);
            }
        }, 250);
        return () => clearTimeout(t); // cancela la búsqueda anterior
    }, [q]);

    const elegir = (song) => {
        setQ('');
        setResultados([]);
        onSelect(song);
    };

    return (
        <div className="search">
            <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="¿Qué canción es? Escribí para buscar..."
                disabled={disabled}
            />
            {resultados.length > 0 && (
                <ul className="suggestions">
                    {resultados.map((s) => (
                        <li key={s._id} onClick={() => elegir(s)}>
                            <span className="s-title">{s.title}</span>
                            <span className="s-artist">{s.artist}</span>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}
