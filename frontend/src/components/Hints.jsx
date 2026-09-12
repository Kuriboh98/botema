// src/components/Hints.jsx

// Botones de pistas + los valores ya revelados.
export default function Hints({ onHint, revealed, artistRevealed }) {
    const pistas = [
        { tipo: 'anio', label: '📅 Año', costo: 10 },
        { tipo: 'letra', label: '🔤 1ª letra', costo: 20 },
        { tipo: 'artista', label: '🎤 Artista', costo: artistRevealed ? 0 : 30 },
        { tipo: 'tapa', label: '🖼️ Tapa', costo: 30 },
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
                            {p.label}
                            <span className="costo">{yaUsada ? '✓' : p.costo === 0 ? 'gratis' : `−${p.costo}`}</span>
                        </button>
                    );
                })}
            </div>

            {/* Valores revelados (texto) */}
            <div className="revealed">
                {revealed.anio !== undefined && <span className="chip">Año: <b>{revealed.anio}</b></span>}
                {revealed.letra !== undefined && <span className="chip">Empieza con: <b>{revealed.letra}</b></span>}
                {revealed.artista !== undefined && <span className="chip">Artista: <b>{revealed.artista}</b></span>}
            </div>

            {/* La tapa, en grande y aparte */}
            {revealed.tapa !== undefined && (
                <div className="cover-wrap">
                    <img className="cover-big" src={revealed.tapa} alt="tapa del álbum" />
                </div>
            )}
        </div>
    );
}
