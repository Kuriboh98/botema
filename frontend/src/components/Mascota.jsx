// src/components/Mascota.jsx
// La mascota de BoTema (máscara de murga) en sus distintas poses.
// pose: inicio | correcta | incorrecta | cerca | lejos | 404 | login
export default function Mascota({ pose, className = '', alt = '' }) {
    return <img className={`mascota ${className}`} src={`/mascota/${pose}.png`} alt={alt} />;
}
