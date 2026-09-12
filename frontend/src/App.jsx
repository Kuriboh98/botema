// src/App.jsx
import { useState } from 'react';
import Auth from './components/Auth';
import Game from './components/Game';
import Leaderboard from './components/Leaderboard';
import { getUser, logout } from './auth';

export default function App() {
    const [user, setUser] = useState(getUser());
    const [view, setView] = useState('game'); // 'game' | 'leaderboard'

    // Si no hay sesión, mostramos login/registro.
    if (!user) return <Auth onLogin={setUser} />;

    const salir = () => {
        logout();
        setUser(null);
    };

    return (
        <div className="app">
            <header className="topbar">
                <span className="brand-sm">
                    BoTema<span className="dot">.</span>
                </span>
                <nav className="nav">
                    <button className={`nav-btn ${view === 'game' ? 'active' : ''}`} onClick={() => setView('game')}>
                        Jugar
                    </button>
                    <button
                        className={`nav-btn ${view === 'leaderboard' ? 'active' : ''}`}
                        onClick={() => setView('leaderboard')}
                    >
                        Ranking
                    </button>
                </nav>
                <div className="user-box">
                    <span className="hola">Hola, {user.username}</span>
                    <button className="btn-ghost" onClick={salir}>
                        Salir
                    </button>
                </div>
            </header>

            <main className="centro">{view === 'game' ? <Game /> : <Leaderboard />}</main>
        </div>
    );
}
