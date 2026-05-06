import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';

function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [cargando, setCargando] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setCargando(true);
        setError('');

        try {
            const res = await api.post('/auth/login', { email, password });
            console.log('Respuesta del login:', res.data);  // ← Agregar log
            console.log('Token recibido:', res.data.token); // ← Agregar log

            if (res.data.exito !== false) {
                localStorage.setItem('token', res.data.token);
                localStorage.setItem('usuario', JSON.stringify(res.data.usuario));
                console.log('Token guardado:', localStorage.getItem('token')); // ← Agregar log
                navigate('/dashboard');
            }
        } catch (error) {
            console.error('Error de login:', error);
            setError(error.response?.data?.error || 'Error al iniciar sesión');
        } finally {
            setCargando(false);
        }
    };

    return (
        <div className="container">
            <h1>MediFlow Pro</h1>
            <h2>Iniciar Sesión</h2>
            {error && <div className="error">{error}</div>}
            <form onSubmit={handleSubmit}>
                <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} required />
                <input type="password" placeholder="Contraseña" value={password} onChange={e => setPassword(e.target.value)} required />
                <button type="submit" disabled={cargando}>{cargando ? 'Cargando...' : 'Ingresar'}</button>
            </form>
            <p>¿No tienes cuenta? <Link to="/registro">Regístrate aquí</Link></p>
        </div>
    );
}

export default Login;