import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';

function Registro() {
    const [nombre, setNombre] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [exito, setExito] = useState('');
    const [cargando, setCargando] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setCargando(true);
        setError('');
        setExito('');

        try {
            await api.post('/auth/registro', { nombre, email, password });
            setExito('Registro exitoso. Redirigiendo al login...');
            setTimeout(() => navigate('/login'), 2000);
        } catch (error) {
            setError(error.response?.data?.error || 'Error al registrar');
        } finally {
            setCargando(false);
        }
    };

    return (
        <div className="container">
            <h1>MediFlow Pro</h1>
            <h2>Registrar Consultorio</h2>
            {error && <div className="error">{error}</div>}
            {exito && <div className="exito">{exito}</div>}
            <form onSubmit={handleSubmit}>
                <input type="text" placeholder="Nombre del consultorio" value={nombre} onChange={e => setNombre(e.target.value)} required />
                <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} required />
                <input type="password" placeholder="Contraseña" value={password} onChange={e => setPassword(e.target.value)} required />
                <button type="submit" disabled={cargando}>{cargando ? 'Registrando...' : 'Registrarse'}</button>
            </form>
            <p>¿Ya tienes cuenta? <Link to="/login">Inicia sesión aquí</Link></p>
        </div>
    );
}

export default Registro;