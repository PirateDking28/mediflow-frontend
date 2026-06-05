import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';

function RecuperarPassword() {
    const [email, setEmail] = useState('');
    const [mensaje, setMensaje] = useState('');
    const [error, setError] = useState('');
    const [cargando, setCargando] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setCargando(true);
        setError('');
        setMensaje('');
        
        try {
            const res = await api.post('/auth/recuperar', { email });
            setMensaje(res.data.mensaje);
        } catch (error) {
            setError(error.response?.data?.mensaje || 'Error al enviar solicitud');
        } finally {
            setCargando(false);
        }
    };

    return (
        <div className="container">
            <h1>🏥 MediFlow Pro</h1>
            <h2>Recuperar Contraseña</h2>
            
            <p>Ingresa tu correo electrónico y te enviaremos un enlace para restablecer tu contraseña.</p>
            
            {error && <div className="error">{error}</div>}
            {mensaje && <div className="exito">{mensaje}</div>}
            
            <form onSubmit={handleSubmit}>
                <input 
                    type="email" 
                    placeholder="Correo electrónico" 
                    value={email} 
                    onChange={e => setEmail(e.target.value)} 
                    required 
                />
                <button type="submit" disabled={cargando}>
                    {cargando ? 'Enviando...' : 'Enviar enlace'}
                </button>
            </form>
            
            <p><Link to="/login">Volver al inicio de sesión</Link></p>
        </div>
    );
}

export default RecuperarPassword;