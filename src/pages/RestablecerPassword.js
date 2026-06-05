import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../services/api';

function RestablecerPassword() {
    const { token } = useParams();
    const [nuevaPassword, setNuevaPassword] = useState('');
    const [confirmarPassword, setConfirmarPassword] = useState('');
    const [mensaje, setMensaje] = useState('');
    const [error, setError] = useState('');
    const [cargando, setCargando] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (nuevaPassword !== confirmarPassword) {
            setError('Las contraseñas no coinciden');
            return;
        }
        
        if (nuevaPassword.length < 6) {
            setError('La contraseña debe tener al menos 6 caracteres');
            return;
        }
        
        setCargando(true);
        setError('');
        setMensaje('');
        
        try {
            const res = await api.post(`/auth/restablecer/${token}`, {
                nueva_password: nuevaPassword
            });
            setMensaje(res.data.mensaje);
            setTimeout(() => navigate('/login'), 3000);
        } catch (error) {
            setError(error.response?.data?.mensaje || 'Error al restablecer contraseña');
        } finally {
            setCargando(false);
        }
    };

    return (
        <div className="container">
            <h1>🏥 MediFlow Pro</h1>
            <h2>Restablecer Contraseña</h2>
            
            {error && <div className="error">{error}</div>}
            {mensaje && <div className="exito">{mensaje}</div>}
            
            <form onSubmit={handleSubmit}>
                <input 
                    type="password" 
                    placeholder="Nueva contraseña" 
                    value={nuevaPassword} 
                    onChange={e => setNuevaPassword(e.target.value)} 
                    required 
                />
                <input 
                    type="password" 
                    placeholder="Confirmar contraseña" 
                    value={confirmarPassword} 
                    onChange={e => setConfirmarPassword(e.target.value)} 
                    required 
                />
                <button type="submit" disabled={cargando}>
                    {cargando ? 'Restableciendo...' : 'Restablecer Contraseña'}
                </button>
            </form>
            
            <p><Link to="/login">Volver al inicio de sesión</Link></p>
        </div>
    );
}

export default RestablecerPassword;