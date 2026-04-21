import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import './Auth.css';
import API_URL from '../config';

function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [cargando, setCargando] = useState(false);
    const navigate = useNavigate();

    const API = axios.create({ baseURL: '' });

    const handleSubmit = async (e) => {
    e.preventDefault();
    setCargando(true);
    setError('');
    
    try {
        const res = await axios.post(`${API_URL}/api/login`, { email, password });
        
        console.log('Respuesta:', res.data);
        
        if (res.data.exito) {
            localStorage.setItem('token', res.data.token);
            localStorage.setItem('consultorio', JSON.stringify(res.data.consultorio));
            window.location.href = '/dashboard';
        }
    } catch (error) {
        console.error('Error completo:', error);
        console.error('Response:', error.response);
        setError(error.response?.data?.mensaje || 'Error al iniciar sesión');
    } finally {
        setCargando(false);
    }
};

    return (
        <div className="auth-container">
            <div className="auth-card">
                <h1>🏥 MediFlow Pro</h1>
                <h2>Iniciar Sesión</h2>
                {error && <div className="error">{error}</div>}
                <form onSubmit={handleSubmit}>
                    <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} required />
                    <input type="password" placeholder="Contraseña" value={password} onChange={e => setPassword(e.target.value)} required />
                    <button type="submit" disabled={cargando}>{cargando ? 'Cargando...' : 'Ingresar'}</button>
                </form>
                <p>¿No tienes cuenta? <Link to="/registro">Regístrate aquí</Link></p>
            </div>
        </div>
    );
}

export default Login;