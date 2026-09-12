// src/components/Modal.jsx
// Ventana emergente genérica (fondo oscuro + tarjeta centrada).
export default function Modal({ children, onClose }) {
    return (
        <div className="modal-overlay" onClick={onClose}>
            {/* stopPropagation: clicar la tarjeta no cierra el modal */}
            <div className="modal" onClick={(e) => e.stopPropagation()}>
                {children}
            </div>
        </div>
    );
}
