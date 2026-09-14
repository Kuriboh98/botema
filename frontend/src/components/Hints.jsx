// src/components/Hints.jsx
import { Icon } from '@iconify/react';

// Botones de pistas + los valores ya revelados.
export default function Hints({ onHint, revealed, artistRevealed }) {
    const pistas = [
        { tipo: 'anio', icon: 'game-icons:calendar', label: 'Año', costo: 10 },
        { tipo: 'letra', icon: 'game-icons:scroll-unfurled', label: '1ª letra', costo: 20 },
        { tipo: 'artista', icon: 'game-icons:microphone', label: 'Artista', costo: artistRevealed ? 0 : 30 },
        { tipo: 'tapa', icon: 'game-icons:portrait', label: 'Tapa', costo: 30 },
    ];

    return (
        <div className="hints">
            <div className="hint-buttons">
                {pistas.map((p) => {
                    const yaUsada = revealed[p.tipo] !== undefined;
                    return (
                        <button
                            key={p.tipo}
                            className="hint-btn"
                            onClick={() => onHint(p.tipo)}
                            disabled={yaUsada}
                        >
                            <span className="hint-label"><Icon icon={p.icon} className="ic" /> {p.label}</span>
                            <span className="costo">{yaUsada ? '✓' : p.costo === 0 ? 'gratis' : `−${p.costo}`}</span>
                        </button>
                    );
                })}
            </div>
        </div>
    );
}
