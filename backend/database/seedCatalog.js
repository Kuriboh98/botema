
import 'dotenv/config';
import mongoose from 'mongoose';
import { connectMongoDB } from './mongodb.js';
import { importarArtista } from '../services/song.service.js';
import { Song } from '../models/song.model.js';

const ARTISTAS = [
    'No Te Va Gustar',
    'La Vela Puerca',
    'El Cuarteto de Nos',
    'Jorge Drexler',
    'Jaime Roos',
    'Rubén Rada',
    'Buitres Después de la Una',
    'La Trampa',
    'Márama',
    'Agarrate Catalina',
    'Cuatro Pesos de Propina',
    'Trotsky Vengarán',
    'Sonido Cristal',
    'Lucas Sugo',
    'Karibe con K',
    'Los Fatales',
    'Alfredo Zitarrosa',
    'Canario Luna',
    'Once Tiros',
    'Natalia Oreiro',
    'Tabaré Cardozo',
    'Chacho Ramos',
    'Luana',
    'Ana Prada',
    'Los Iracundos',
    'Rombai',
    'La Nueva Escuela',
    'The La Planta',
    'Matías Valdez',
    'Totem Uruguay',
    'Los Shakers',
    'Chala Madre',
    'Jorge Do Prado',
    'Niña Lobo',
];

await connectMongoDB();

// Limpiamos el catálogo para reconstruirlo desde cero (aplica los filtros nuevos).
await Song.deleteMany({});
console.log('Catálogo anterior borrado.');

let total = 0;
for (const artista of ARTISTAS) {
    const r = await importarArtista(artista);
    total += r.importadas;
    console.log(`  ${artista.padEnd(26)} ${r.importadas} nuevas (de ${r.encontradas})`);
}
console.log(`\nCatálogo listo: ${total} canciones importadas.`);

await mongoose.disconnect();
