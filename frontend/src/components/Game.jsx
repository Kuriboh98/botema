// src/components/Game.jsx
import { useState, useEffect } from 'react';
import { api } from '../api';
import AudioPlayer from './AudioPlayer';
import SearchBox from './SearchBox';
import Hints from './Hints';
import Modal from './Modal';
import SongReveal from './SongReveal';
import Leaderboard from './Leaderboard';

export default function Game() {
    const [game, setGame] = useState(null); // estado de la partida
    const [feedback, setFeedback] = useState(null); // resultado del último intento (erró/cerca/over)
    const [winModal, setWinModal] = useState(null); // pop-up de "¡Correcto!" { song, points }
    const [revealedHints, setRevealedHints] = useState({}); // pistas ya reveladas
    const [falladas, setFalladas] = useState([]); // canciones que erraste para la canción actual
    const [busy, setBusy] = useState(false);

    async function iniciar() {
        setBusy(true);
        setFeedback(null);
        setWinModal(null);
        setRevealedHints({});
        setFalladas([]);
        try {
            setGame(await api.startGame());
        } catch (e) {
            alert(e.message);
        } finally {
            setBusy(false);
        }
    }

    useEffect(() => {
        iniciar();
    }, []);

    async function adivinar(song) {
        if (busy) return;
        setBusy(true);
        const audioActual = game.previewUrl; // el audio de la canción actual (para revelarla)
        try {
            const res = await api.guess(game.id, song._id);
            const revelada = { ...res.revealed, previewUrl: audioActual };

            if (res.status === 'over') {
                setGame((g) => ({ ...g, status: 'over', totalScore: res.totalScore, songsCompleted: res.songsCompleted }));
                setFeedback({ over: true, revealed: revelada });
            } else if (res.correct) {
                setWinModal({ song: revelada, points: res.pointsEarned }); // pop-up
                setGame(res); // nueva canción de fondo
                setRevealedHints({});
                setFalladas([]); // canción nueva: se limpian los errores
                setFeedback(null);
            } else {
                setFeedback({ correct: false, sameArtist: res.sameArtist });
                setGame(res);
                // recordamos la que erraste para no repetirla
                setFalladas((f) => (f.some((x) => x._id === song._id) ? f : [...f, song]));
            }
        } catch (e) {
            alert(e.message);
        } finally {
            setBusy(false);
        }
    }

    async function pista(tipo) {
        if (busy) return;
        setBusy(true);
        try {
            const res = await api.hint(game.id, tipo);
            setRevealedHints((h) => ({ ...h, [tipo]: res.valor }));
            setGame((g) => ({
                ...g,
                totalScore: res.totalScore,
                artistRevealed: tipo === 'artista' ? true : g.artistRevealed,
            }));
        } catch (e) {
            alert(e.message);
        } finally {
            setBusy(false);
        }
    }

    async function saltar() {
        if (busy) return;
        setBusy(true);
        setFeedback(null);
        const audioActual = game.previewUrl;
        try {
            const res = await api.skip(game.id);
            if (res.status === 'over') {
                setGame((g) => ({ ...g, status: 'over', totalScore: res.totalScore, songsCompleted: res.songsCompleted }));
                setFeedback({ over: true, revealed: { ...res.revealed, previewUrl: audioActual } });
            } else {
                setGame(res);
            }
        } catch (e) {
            alert(e.message);
        } finally {
            setBusy(false);
        }
    }

    if (!game) return <p className="loading">Cargando partida...</p>;

    // --- Fin de partida: info de la canción + puntos + leaderboard ---
    if (game.status === 'over') {
        return (
            <div className="gameover">
                <p className="go-emoji">🏁</p>
                <h2>Fin de la partida</h2>
                <p className="final-score">
                    {game.totalScore} <span>puntos</span>
                </p>
                <p className="go-sub">Adivinaste {game.songsCompleted} canción(es) seguidas.</p>

                {feedback?.revealed && (
                    <div className="go-reveal-card">
                        <p className="go-reveal-label">La canción era:</p>
                        <SongReveal song={feedback.revealed} />
                    </div>
                )}

                <button className="btn-primary big" onClick={iniciar}>Jugar de nuevo</button>

                <div className="go-leaderboard">
                    <Leaderboard />
                </div>
            </div>
        );
    }

    // --- Pantalla de juego ---
    return (
        <div className="game">
            <div className="scorebar">
                <div><span className="lbl">Ronda</span> {game.currentRound}/6</div>
                <div><span className="lbl">Puntos</span> {game.totalScore}</div>
                <div><span className="lbl">Canciones</span> {game.songsCompleted}</div>
            </div>

            <AudioPlayer
                src={game.previewUrl}
                limit={game.allowedDuration}
                total={30}
                marks={[1, 2, 4, 8, 16, 30]}
            />

            {falladas.length > 0 && (
                <div className="falladas">
                    <span className="falladas-lbl">Ya intentaste:</span>
                    <ul>
                        {falladas.map((s) => (
                            <li key={s._id}>
                                ❌ {s.title} <span className="falladas-artist">— {s.artist}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            )}

            {feedback && feedback.correct === false && (
                <div className={`feedback ${feedback.sameArtist ? 'cerca' : 'erro'}`}>
                    {feedback.sameArtist ? '🟡 ¡Cerca! Acertaste el artista.' : '⚪ No era. Escuchá un poco más.'}
                </div>
            )}

            <SearchBox onSelect={adivinar} disabled={busy} />

            <button className="btn-ghost skip" onClick={saltar} disabled={busy}>
                {game.currentRound >= 6 ? '🏳️ Rendirse' : 'Escuchar más ⏭ (pasar ronda)'}
            </button>

            <Hints onHint={pista} revealed={revealedHints} artistRevealed={game.artistRevealed} />

            {/* Pop-up de acierto */}
            {winModal && (
                <Modal onClose={() => setWinModal(null)}>
                    <p className="win-emoji">🟢</p>
                    <h2>¡Correcto!</h2>
                    <p className="win-pts">+{winModal.points} puntos</p>
                    <SongReveal song={winModal.song} />
                    <button className="btn-primary" onClick={() => setWinModal(null)}>
                        Seguir jugando
                    </button>
                </Modal>
            )}
        </div>
    );
}
