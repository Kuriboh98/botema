// src/components/SongReveal.jsx
import AudioPlayer from './AudioPlayer';

// Muestra una canción revelada: tapa grande + info + reproductor de 30s.
export default function SongReveal({ song }) {
    return (
        <div className="reveal">
            {song.coverUrl && <img className="reveal-cover" src={song.coverUrl} alt={song.title} />}
            <h3 className="reveal-title">{song.title}</h3>
            <p className="reveal-artist">{song.artist}</p>
            {song.year && <p className="reveal-year">{song.year}</p>}
            {song.previewUrl && <AudioPlayer src={song.previewUrl} limit={30} total={30} />}
        </div>
    );
}
