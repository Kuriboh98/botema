
import 'dotenv/config';
import mongoose from 'mongoose';
import { connectMongoDB } from './mongodb.js';
import { importarArtista, importarCancion } from '../services/song.service.js';
import { CANCIONES_EXTRA } from '../config/extraSongs.js';
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
    { name: 'La Nueva Escuela', id: 1368168510 }, // hay 2 homónimas; esta es la uruguaya
    'The La Planta',
    'Matías Valdez',
    'Totem Uruguay',
    'Los Shakers',
    'Chala Madre',
    'Jorge Do Prado',
    'Niña Lobo',
    'Los Olimareños',
    'La Penúltima',
    'Carlos Gardel',
    'Martín Buscaglia',
    'Peyote Asesino',
    'Falke 912',
    'Zeballos',
    'Knak',
];

await connectMongoDB();

// Limpiamos el catálogo para reconstruirlo desde cero (aplica los filtros nuevos).
await Song.deleteMany({});
console.log('Catálogo anterior borrado.');

let total = 0;
for (const artista of ARTISTAS) {
    const r = await importarArtista(artista);
    total += r.importadas;
    console.log(`  ${r.artista.padEnd(26)} ${r.importadas} nuevas (de ${r.encontradas})`);
}
// Canciones puntuales de otros artistas
if (CANCIONES_EXTRA.length) {
    console.log('\nCanciones extra:');
    for (const criterio of CANCIONES_EXTRA) {
        const r = await importarCancion(criterio);
        if (r.importada) {
            total += 1;
            console.log(`  ✓ "${r.title}" — ${r.artist}`);
        } else {
            console.log(`  ✗ "${criterio.title}" — ${criterio.artist} (${r.motivo})`);
        }
    }
}

console.log(`\nCatálogo listo: ${total} canciones importadas.`);

await mongoose.disconnect();
