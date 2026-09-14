import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { addCollection } from '@iconify/react';
import gameIcons from '@iconify-json/game-icons/icons.json';
import './index.css';
import App from './App.jsx';

// Cargamos el pack "game-icons" (game-icons.net) para usarlos offline (sin CDN).
addCollection(gameIcons);

createRoot(document.getElementById('root')).render(
    <StrictMode>
        <App />
    </StrictMode>
);
