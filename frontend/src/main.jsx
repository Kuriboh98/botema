import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { addCollection } from '@iconify/react';
import gameIcons from './gameIconsSubset.json';
import './index.css';
import App from './App.jsx';

// Cargamos SOLO los iconos de game-icons que usamos (subset generado a mano),
// para no empaquetar los 4134 del pack completo. Offline, sin CDN.
addCollection(gameIcons);

createRoot(document.getElementById('root')).render(
    <StrictMode>
        <App />
    </StrictMode>
);
