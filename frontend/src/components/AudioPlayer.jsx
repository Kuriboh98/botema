// src/components/AudioPlayer.jsx
import { useRef, useState, useEffect } from 'react';

// Barra de reproducción con play/pausa.
// - limit: segundos desbloqueados (hasta dónde se puede escuchar)
// - total: largo total de la barra en segundos (15 en el juego, 30 al revelar)
// - marks: umbrales de cada ronda (dibuja divisiones + el indicador arriba)
export default function AudioPlayer({ src, limit, total, marks }) {
    const totalSecs = total || limit;
    const audioRef = useRef(null);
    const [playing, setPlaying] = useState(false);
    const [time, setTime] = useState(0);

    useEffect(() => {
        const a = audioRef.current;
        if (a) {
            a.pause();
            a.currentTime = 0;
        }
        setPlaying(false);
        setTime(0);
    }, [src, limit]);

    const toggle = () => {
        const a = audioRef.current;
        if (playing) {
            a.pause();
            setPlaying(false);
        } else {
            if (a.currentTime >= limit) a.currentTime = 0;
            a.play();
            setPlaying(true);
        }
    };

    const onTime = () => {
        const a = audioRef.current;
        setTime(a.currentTime);
        if (a.currentTime >= limit) {
            a.pause();
            setPlaying(false);
        }
    };

    const pct = (s) => Math.min(100, (s / totalSecs) * 100);
    const unlockedPct = pct(limit);
    const playedPct = Math.min(unlockedPct, pct(time));

    return (
        <div className="player">
            <div className="bar-area">
                {marks && (
                    <div className="unlock-marker" style={{ left: unlockedPct + '%' }}>
                        <span className="unlock-label">{limit}s</span>
                        <span className="unlock-arrow">▼</span>
                    </div>
                )}
                <div className="progress">
                    <div className="unlocked" style={{ width: unlockedPct + '%' }} />
                    <div className="played" style={{ width: playedPct + '%' }} />
                    {marks &&
                        marks.map((m, i) => <div key={i} className="tick" style={{ left: pct(m) + '%' }} />)}
                </div>
            </div>

            <div className="player-row">
                <button className="play-toggle" onClick={toggle} aria-label={playing ? 'Pausar' : 'Reproducir'}>
                    {playing ? '❚❚' : '▶'}
                </button>
            </div>

            <audio ref={audioRef} src={src} preload="auto" onTimeUpdate={onTime} onEnded={() => setPlaying(false)} />
        </div>
    );
}
