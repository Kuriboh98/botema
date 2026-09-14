// src/components/Home.jsx
import { useState, useEffect } from 'react';
import { Icon } from '@iconify/react';
import { api } from '../api';
import Leaderboard from './Leaderboard';
import Mascota from './Mascota';

// Menú principal tras iniciar sesión: descripción, jugar, tus datos,
// el ranking y el acceso al catálogo de canciones.
export default function Home({ user, onPlay, onVerCanciones }) {
    const [perfil, setPerfil] = useState(null);

    // Traemos las estadísticas frescas de la cuenta cada vez que se entra al inicio.
    useEffect(() => {
        api.me().then(setPerfil).catch(() => setPerfil(null));
    }, []);

    const stats = perfil || user;

    return (
        <div className="home">
            <section className="hero">
                <Mascota pose="inicio" className="mascota-hero" alt="" />
                <h2 className="hero-title">La música uruguaya también se juega</h2>
                <p className="hero-sub">Escuchá, adiviná y encadená aciertos para mantener tu racha.</p>
                <button className="btn-primary big" onClick={onPlay}>
                    <Icon icon="game-icons:play-button" className="ic" /> Jugar ahora
                </button>
            </section>

            <section className="account">
                <h3 className="section-title">Tu cuenta</h3>
                <div className="stats">
                    <div className="stat-card">
                        <span className="stat-num">{stats?.gamesPlayed ?? 0}</span>
                        <span className="stat-lbl">Partidas jugadas</span>
                    </div>
                    <div className="stat-card">
                        <span className="stat-num">{stats?.songsCompleted ?? 0}</span>
                        <span className="stat-lbl">Canciones completadas</span>
                    </div>
                    <div className="stat-card">
                        <span className="stat-num">{stats?.bestScore ?? 0}</span>
                        <span className="stat-lbl">Mejor puntaje</span>
                    </div>
                </div>
            </section>

            <section className="home-lb">
                <Leaderboard />
            </section>

            <button className="btn-ghost ver-canciones" onClick={onVerCanciones}>
                <Icon icon="game-icons:musical-notes" className="ic" /> Ver todas las canciones disponibles
            </button>
        </div>
    );
}
