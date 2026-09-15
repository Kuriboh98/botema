// config/blocklist.js
// Canciones que NO queremos en el catálogo aunque iTunes las devuelva
// (temas explícitos, remixes/versiones duplicadas, o el mismo tema acreditado a
// dos artistas distintos: dejamos una sola versión).
//
// Cada entrada: { title, artist?, year? }  — se bloquea si coinciden TODOS los campos puestos.
//   - `title`  : nombre EXACTO de la canción (obligatorio). Respeta tildes y puntuación;
//                solo ignora mayúsculas/minúsculas.
//   - `artist` : opcional. Coincide si el nombre del artista lo contiene (útil para colaboraciones).
//   - `year`   : opcional. Distingue grabaciones del mismo tema en años distintos.

export const CANCIONES_BLOQUEADAS = [
    // "Candombe de Mucho Palo" (Jorge Do Prado): dejamos SOLO la original de 1983.
    { title: 'Candombé de Mucho Palo' },                                        // versiones "de" (2005, solo y con Malembe)
    { title: 'Candombe del Mucho Palo', artist: 'Jorge Do Prado', year: 1991 }, // la "del" de 1991
    { title: 'Candombé Del Mucho Palo', artist: 'Pareceres', year: 2026 },      // la de Pareceres & Jorge Do Prado (2026)

    // Duplicados por doble crédito / remixes / versiones que no van:
    { title: 'A Dónde Vamos?', artist: 'Grupo Cañaveral de Humberto Pabón & Matías Valdez', year: 2023 },
    { title: 'Al otro lado del Río', artist: 'Jorge Drexler, Jeff Eckels, Carina Voly, John Vriesacker, Ana Laan, Leo Sidran & Ben Sidran', year: 2004 },
    { title: 'Brindis por Pierrot (feat. Canario Luna & Falta y Resto) [Remastered]', artist: 'Jaime Roos', year: 2016 },
    { title: 'Brindis por Pierrot (Remastered 2023)', artist: 'Jaime Roos & Canario Luna', year: 2023 },
    { title: 'Cielo De Un Solo Color', artist: 'No Te Va Gustar, Jorge Drexler, Agarrate Catalina & Hugo Fattoruso', year: 2026 },
    { title: 'Cuando Juega Uruguay (Remastered 2023)', artist: 'Jaime Roos & Falta y Resto', year: 1997 },
    { title: 'Dile (Remix by Dj Sammy)', artist: 'La Nueva Escuela & J Alvarez', year: 2006 },
    { title: 'Doña Solédad', artist: 'Alfredo Zitarrosa', year: 1972 },
    { title: 'Durazno y Convención (Jaime Roos)', artist: 'Jaime Roos', year: 1991 },
    { title: 'El Grito del Canilla (feat. Canario Luna) [Remastered]', artist: 'Jaime Roos', year: 1985 },
    { title: 'El Murguero Oriental (feat. Zurdo Bessio)', artist: 'Tabaré Cardozo & Canario Luna', year: 2002 },
    { title: 'El Víolín de Becho', artist: 'Alfredo Zitarrosa', year: 1972 },
    { title: 'Enganchado Fantástico', artist: 'Agapornis', year: 2017 },
    { title: 'Enganchados "Una Mas Para el Cuaderno"', artist: 'Sonido Cristal & Ke personajes', year: 2019 },
    { title: 'Ensayo y Error', artist: 'Tabaré Cardozo & Jorge Drexler', year: 2018 },
    { title: 'Gloriosa Celeste', artist: 'Canario Luna & Los 8 de Momo', year: 2000 },
    { title: 'La Rubia (Remix 2)', artist: 'La Nueva Escuela & Omar Montes', year: 2019 },
    { title: 'Latidos', artist: "La K'onga & Matías Valdez", year: 2022 },
    { title: 'Lo Que el Tiempo Me Enseño (feat. Emiliano y El Zurdo)', artist: 'Canario Luna & Tabaré Cardozo', year: 2002 },
    { title: 'Lo Que el Tiempo Me Enseñó (feat. Emiliano y El Zurdo)', artist: 'Tabaré Cardozo & Canario Luna', year: 2002 },
    { title: 'Mi Papi Es Mio (feat. La Muñeka, El Fecho RD & Yomel El Meloso) [Remix]', artist: 'La Nueva Escuela, La Ross Maria & La Perversa', year: 2020 },
    { title: 'Mi Revolución', artist: 'Cuatro Pesos de Propina & Francisco Fattoruso', year: 2012 },
    { title: 'Mix Cumbia 2', artist: 'The La Planta, Flor Alvarez & Pushi', year: 2025 },
    { title: 'Mix Cumbia 3', artist: 'The La Planta, Valen Vargas & Pushi', year: 2025 },
    { title: 'Mix Cumbia 4', artist: 'The La Planta & La Penúltima', year: 2025 },
    { title: 'No Es Lluvia de Verano / Cinco Minutos / Me Encanta (feat. Chacho Ramos)', artist: 'Lucas Sugo & Matías Valdez', year: 2021 },
    { title: 'Noche loca (feat. Marama)', artist: 'Rombai', year: 2015 },
    { title: 'Que Tiene la Noche / Latidos / Hechicera (feat. Chacho Ramos)', artist: 'Matías Valdez & Lucas Sugo', year: 2021 },
    { title: 'Sácate la Tanga (feat. Garotihnio & La Moña)', artist: 'The La Planta, Pekeño 77 & Franux BB', year: 2021 },
    { title: 'Siempre Tu', artist: 'Los Shakers, Otroshakers & Hugo Fattoruso', year: 2020 },
    { title: 'Soltera (feat. La Kuppé)', artist: 'Sonido Cristal', year: 2020 },
    { title: 'Tengo un Candombé para Gardel', artist: 'Ruben Rada', year: 1995 },
    { title: 'Vientos Del Sur', artist: 'Pareceres, Dino Gastón Ciarlo & Jorge Do Prado', year: 2025 },
    { title: 'Zamba Para Vos', artist: 'Alfredo Zitarrosa', year: 1972 },
];
