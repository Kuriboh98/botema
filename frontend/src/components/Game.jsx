// src/components/Game.jsx
import { useState, useEffect } from 'react';
import { Icon } from '@iconify/react';
import { api } from '../api';
import AudioPlayer from './AudioPlayer';
import NowPlaying from './NowPlaying';
import SearchBox from './SearchBox';
import Hints from './Hints';
import Modal from './Modal';
import SongReveal from './SongReveal';
import Leaderboard from './Leaderboard';
import Mascota from './Mascota';

export default function Game({ onHome }) {
    const [game, setGame] = useState(null); // estado de la partida
    const [feedback, setFeedback] = useState(null); // resultado del último intento (erró/cerca/over)
    const [winModal, setWinModal] = useState(null); // pop-up de "¡Correcto!" { song, points }
    const [revealedHints, setRevealedHints] = useState({}); // pistas ya reveladas
    const [falladas, setFalladas] = useState([]); // canciones que erraste para la canción actual
    const [showHints, setShowHints] = useState(false); // modal de pistas
    const [busy, setBusy] = useState(false);

    async function iniciar() {
        setBusy(true);
        setFeedback(null);
        setWinModal(null);
        setRevealedHints({});
        setFalladas([]);
        setShowHints(false);
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
        setShowHints(false);
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
                // si acertaste el artista, se revela solo en la ficha (la canción errada es de ese artista)
                if (res.sameArtist) setRevealedHints((h) => ({ ...h, artista: song.artist }));
                // recordamos la que erraste para no repetirla (con si acertó el artista)
                setFalladas((f) =>
                    f.some((x) => x._id === song._id) ? f : [...f, { ...song, sameArtist: res.sameArtist }]
                );
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
        setShowHints(false);
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

    async function rendirse() {
        if (busy) return;
        setBusy(true);
        setShowHints(false);
        setFeedback(null);
        const audioActual = game.previewUrl;
        try {
            const res = await api.surrender(game.id);
            setGame((g) => ({ ...g, status: 'over', totalScore: res.totalScore, songsCompleted: res.songsCompleted }));
            setFeedback({ over: true, revealed: { ...res.revealed, previewUrl: audioActual } });
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
                <Mascota pose="incorrecta" className="mascota-go" alt="" />
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

                <div className="go-actions">
                    <button className="btn-primary big" onClick={iniciar}>Jugar de nuevo</button>
                    <button className="btn-ghost" onClick={onHome}><Icon icon="game-icons:house" className="ic" /> Volver al inicio</button>
                </div>

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

            <NowPlaying revealed={revealedHints} onPistas={() => setShowHints(true)} />

            <div className="player-zone">
                <div className="mascota-col">
                    <Mascota pose={!feedback ? 'lejos' : feedback.sameArtist ? 'cerca' : '404'} className="mascota-partida" alt="" />
                    {feedback && feedback.correct === false && (
                        <p className={`feedback-min ${feedback.sameArtist ? 'cerca' : 'erro'}`}>
                            <Icon icon={feedback.sameArtist ? 'game-icons:bullseye' : 'game-icons:circle'} className="ic" />{' '}
                            {feedback.sameArtist ? '¡Cerca! Acertaste el artista.' : 'No era, escuchá un poco más.'}
                        </p>
                    )}
                </div>
                <AudioPlayer
                    src={game.previewUrl}
                    limit={game.allowedDuration}
                    total={30}
                    marks={[1, 2, 4, 8, 16, 30]}
                />
            </div>

            <SearchBox onSelect={adivinar} disabled={busy} />

            <div className="acciones">
                {game.currentRound < 6 && (
                    <button className="btn-ghost" onClick={saltar} disabled={busy}>
                        Escuchar más <Icon icon="game-icons:fast-forward-button" className="ic" /> (pasar ronda)
                    </button>
                )}
                <button className="btn-ghost rendirse" onClick={rendirse} disabled={busy}>
                    <Icon icon="game-icons:flying-flag" className="ic" /> Rendirse
                </button>
            </div>

            {/* El historial va abajo para no empujar el buscador */}
            {falladas.length > 0 && (
                <div className="falladas">
                    <span className="falladas-lbl">Ya intentaste:</span>
                    <ul>
                        {falladas.map((s) => (
                            <li key={s._id} className={s.sameArtist ? 'fallada-cerca' : ''}>
                                <Icon icon={s.sameArtist ? 'game-icons:bullseye' : 'game-icons:cross-mark'} className="ic" /> {s.title} <span className="falladas-artist">— {s.artist}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            )}

            {/* Pistas en un modal (se abre con la lupa de la ficha) */}
            {showHints && (
                <Modal onClose={() => setShowHints(false)}>
                    <h2><Icon icon="game-icons:magnifying-glass" className="ic" /> Pistas</h2>
                    <p className="hints-sub">Cada pista descuenta puntos y completa la ficha.</p>
                    <Hints onHint={pista} revealed={revealedHints} artistRevealed={game.artistRevealed} />
                    <button className="btn-ghost hints-close" onClick={() => setShowHints(false)}>Listo</button>
                </Modal>
            )}

            {/* Pop-up de acierto */}
            {winModal && (
                <Modal onClose={() => setWinModal(null)}>
                    <Mascota pose="correcta" className="mascota-win" alt="" />
                    <h2>¡Correcto!</h2>
                    <p className="win-pts">+{winModal.points} puntos</p>
                    <SongReveal song={winModal.song} />
                    <button className="btn-primary" onClick={() => setWinModal(null)}>
                        Siguiente canción →
                    </button>
                </Modal>
            )}
        </div>
    );
}
