// src/components/NowPlaying.jsx
import { Icon } from '@iconify/react';

// Ficha estilo reproductor (tapa + título + artista + año).
// Arranca "en blanco" y las pistas la van completando. El título nunca se
// revela entero (es lo que hay que adivinar): a lo sumo su primera letra.
export default function NowPlaying({ revealed, onPistas }) {
    const { anio, letra, artista, tapa } = revealed;

    // Título enmascarado: puntos, con la primera letra si se pidió esa pista.
    const titulo = letra ? `${letra} · · · ·` : '· · · · · ·';

    return (
        <div className="now-playing">
            {onPistas && (
                <button className="np-hints-btn" onClick={onPistas} title="Pedir pistas" aria-label="Pistas">
                    <Icon icon="game-icons:magnifying-glass" />
                </button>
            )}
            <div className="np-cover">
                {tapa !== undefined ? (
                    <img src={tapa} alt="tapa del álbum" />
                ) : (
                    <div className="np-cover-ph"><Icon icon="game-icons:musical-notes" /></div>
                )}
            </div>

            <div className="np-title">{titulo}</div>
            <div className={`np-artist ${artista !== undefined ? '' : 'oculto'}`}>
                {artista !== undefined ? artista : 'Artista desconocido'}
            </div>
            <div className={`np-year ${anio !== undefined ? '' : 'oculto'}`}>
                {anio !== undefined ? anio : '····'}
            </div>
        </div>
    );
}
