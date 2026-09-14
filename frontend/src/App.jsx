// src/App.jsx
import { useState } from 'react';
import Auth from './components/Auth';
import Home from './components/Home';
import Game from './components/Game';
import SongsList from './components/SongsList';
import { getUser, logout } from './auth';

export default function App() {
    const [user, setUser] = useState(getUser());
    const [view, setView] = useState('home'); // 'home' | 'game' | 'songs'

    // Si no hay sesión, mostramos login/registro.
    if (!user) return <Auth onLogin={(u) => { setUser(u); setView('home'); }} />;

    const salir = () => {
        logout();
        setUser(null);
    };

    return (
        <div className="app">
            <header className="topbar">
                <button className="brand-sm brand-btn" onClick={() => setView('home')}>
                    BoTema<span className="dot">.</span>
                </button>
                <div className="user-box">
                    <span className="hola">Hola, {user.username}</span>
                    <button className="btn-ghost" onClick={salir}>
                        Salir
                    </button>
                </div>
            </header>

            <main className="centro">
                {view === 'game' && <Game onHome={() => setView('home')} />}
                {view === 'songs' && <SongsList onBack={() => setView('home')} />}
                {view === 'home' && (
                    <Home
                        user={user}
                        onPlay={() => setView('game')}
                        onVerCanciones={() => setView('songs')}
                    />
                )}
            </main>
        </div>
    );
}
