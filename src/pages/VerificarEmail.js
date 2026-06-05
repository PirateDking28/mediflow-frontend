import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../services/api';

function VerificarEmail() {
    const { token } = useParams();
    const [mensaje, setMensaje] = useState('');
    const [cargando, setCargando] = useState(true);
    const [exito, setExito] = useState(false);

    useEffect(() => {
        const verificar = async () => {
            try {
                const res = await api.get(`/auth/verificar/${token}`);
                setMensaje(res.data.mensaje);
                setExito(true);
            } catch (error) {
                setMensaje(error.response?.data?.mensaje || 'Error al verificar el correo');
                setExito(false);
            } finally {
                setCargando(false);
            }
        };
        verificar();
    }, [token]);

    if (cargando) return <div className="container"><h2>Verificando...</h2></div>;

    return (
        <div className="container">
            <h1>🏥 MediFlow Pro</h1>
            <div className={exito ? 'exito' : 'error'}>
                {mensaje}
            </div>
            {exito && (
                <Link to="/login">
                    <button>Ir al Login</button>
                </Link>
            )}
        </div>
    );
}

export default VerificarEmail;