import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import './Auth.css';
import API_URL from '../config';

function Registro() {
    const [formData, setFormData] = useState({
        nombre: '',
        email: '',
        password: '',
        telefono: '',
        direccion: ''
    });
    const [error, setError] = useState('');
    const [exito, setExito] = useState('');
    const [cargando, setCargando] = useState(false);
    const navigate = useNavigate();

    const API = axios.create({ baseURL: '' });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
    e.preventDefault();
    setCargando(true);
    setError('');
    setExito('');
    
    try {
        const res = await axios.post(`${API_URL}/api/registro`, formData);
        
        console.log('Respuesta:', res.data);
        
        if (res.data.exito) {
            setExito('Consultorio registrado correctamente. Redirigiendo al login...');
            setTimeout(() => navigate('/login'), 2000);
        }
    } catch (error) {
        console.error('Error completo:', error);
        console.error('Response:', error.response);
        setError(error.response?.data?.mensaje || 'Error al registrar');
    } finally {
        setCargando(false);
    }
};

    return (
        <div className="auth-container">
            <div className="auth-card">
                <h1>🏥 MediFlow Pro</h1>
                <h2>Registrar Consultorio</h2>
                {error && <div className="error">{error}</div>}
                {exito && <div className="exito">{exito}</div>}
                <form onSubmit={handleSubmit}>
                    <input type="text" name="nombre" placeholder="Nombre del consultorio" value={formData.nombre} onChange={handleChange} required />
                    <input type="email" name="email" placeholder="Email" value={formData.email} onChange={handleChange} required />
                    <input type="password" name="password" placeholder="Contraseña" value={formData.password} onChange={handleChange} required />
                    <input type="text" name="telefono" placeholder="Teléfono (opcional)" value={formData.telefono} onChange={handleChange} />
                    <input type="text" name="direccion" placeholder="Dirección (opcional)" value={formData.direccion} onChange={handleChange} />
                    <button type="submit" disabled={cargando}>{cargando ? 'Registrando...' : 'Registrarse'}</button>
                </form>
                <p>¿Ya tienes cuenta? <Link to="/login">Inicia sesión aquí</Link></p>
            </div>
        </div>
    );
}

export default Registro;