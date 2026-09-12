// src/components/Leaderboard.jsx
import { useState, useEffect } from 'react';
import { api } from '../api';

export default function Leaderboard() {
    const [jugadores, setJugadores] = useState(null);
    const [error, setError] = useState('');

    useEffect(() => {
        api.leaderboard().then(setJugadores).catch((e) => setError(e.message));
    }, []);

    if (error) return <p className="error">{error}</p>;
    if (!jugadores) return <p className="loading">Cargando ranking...</p>;

    // Formatea la fecha del récord (ej: "12 sept 2026"). Si no hay, muestra "—".
    const formatFecha = (iso) =>
        iso ? new Date(iso).toLocaleDateString('es-UY', { day: 'numeric', month: 'short', year: 'numeric' }) : '—';

    return (
        <div className="leaderboard">
            <h2>🏆 Ranking</h2>
            {jugadores.length === 0 ? (
                <p className="lb-empty">Todavía no hay puntajes. ¡Jugá una partida!</p>
            ) : (
                <ol className="lb-list">
                    {jugadores.map((j, i) => (
                        <li key={j._id} className={i === 0 ? 'lb-first' : ''}>
                            <span className="lb-pos">{i + 1}</span>
                            <span className="lb-name">{j.username}</span>
                            <span className="lb-date">{formatFecha(j.bestScoreAt)}</span>
                            <span className="lb-score">{j.bestScore}</span>
                        </li>
                    ))}
                </ol>
            )}
        </div>
    );
}
