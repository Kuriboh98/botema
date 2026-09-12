// src/components/Auth.jsx
import { useState } from 'react';
import { api } from '../api';
import { saveSession } from '../auth';

export default function Auth({ onLogin }) {
    const [modo, setModo] = useState('login'); // 'login' | 'register'
    const [form, setForm] = useState({ username: '', email: '', password: '' });
    const [error, setError] = useState('');
    const [cargando, setCargando] = useState(false);

    const cambiar = (e) => setForm({ ...form, [e.target.name]: e.target.value });

    const enviar = async (e) => {
        e.preventDefault();
        setError('');
        setCargando(true);
        try {
            // Si es registro, primero creamos la cuenta; después siempre logueamos.
            if (modo === 'register') await api.register(form);
            const { token, user } = await api.login({ email: form.email, password: form.password });
            saveSession(token, user);
            onLogin(user);
        } catch (err) {
            setError(err.message);
        } finally {
            setCargando(false);
        }
    };

    return (
        <div className="auth-wrap">
            <div className="auth-card">
                <h1 className="brand">
                    BoTema<span className="dot">.</span>
                </h1>
                <p className="tagline">Adiviná canciones uruguayas de oído.</p>

                <div className="tabs">
                    <button className={modo === 'login' ? 'active' : ''} onClick={() => setModo('login')}>
                        Ingresar
                    </button>
                    <button className={modo === 'register' ? 'active' : ''} onClick={() => setModo('register')}>
                        Crear cuenta
                    </button>
                </div>

                <form onSubmit={enviar}>
                    {modo === 'register' && (
                        <input
                            name="username"
                            placeholder="Nombre de usuario"
                            value={form.username}
                            onChange={cambiar}
                            required
                        />
                    )}
                    <input
                        name="email"
                        type="email"
                        placeholder="Email"
                        value={form.email}
                        onChange={cambiar}
                        required
                    />
                    <input
                        name="password"
                        type="password"
                        placeholder="Contraseña"
                        value={form.password}
                        onChange={cambiar}
                        required
                    />

                    {error && <div className="error">{error}</div>}

                    <button type="submit" className="btn-primary" disabled={cargando}>
                        {cargando ? 'Cargando...' : modo === 'login' ? 'Ingresar' : 'Crear cuenta y jugar'}
                    </button>
                </form>
            </div>
        </div>
    );
}
