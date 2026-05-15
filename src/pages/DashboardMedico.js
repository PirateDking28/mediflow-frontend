import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import './DashboardMedico.css';

function DashboardMedico() {
    const [usuario, setUsuario] = useState(null);
    const [citas, setCitas] = useState([]);
    const [cargando, setCargando] = useState(true);
    const [expedienteVisible, setExpedienteVisible] = useState(false);
    const [expedienteData, setExpedienteData] = useState([]);
    const [pacienteSeleccionado, setPacienteSeleccionado] = useState(null);
    const [notaMedica, setNotaMedica] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        const token = localStorage.getItem('token');
        const usuarioData = localStorage.getItem('usuario');
        
        if (!token) {
            navigate('/login');
        } else {
            const user = JSON.parse(usuarioData);
            if (user.rol !== 'medico') {
                navigate('/dashboard');
            }
            setUsuario(user);
            cargarCitas();
        }
    }, [navigate]);

    const cargarCitas = async () => {
        try {
            const res = await api.get('/medico/citas/hoy');
            setCitas(res.data.citas || []);
        } catch (error) {
            console.error('Error al cargar citas:', error);
        } finally {
            setCargando(false);
        }
    };

    const verExpediente = async (pacienteId, pacienteNombre) => {
        setPacienteSeleccionado({ id: pacienteId, nombre: pacienteNombre });
        try {
            const res = await api.get(`/paciente/${pacienteId}/expediente`);
            setExpedienteData(res.data.expediente || []);
            setExpedienteVisible(true);
        } catch (error) {
            console.error('Error al cargar expediente:', error);
            alert('Error al cargar expediente');
        }
    };

    const marcarAtendida = async (citaId) => {
        if (!window.confirm('¿Marcar esta cita como atendida?')) return;
        try {
            await api.put(`/citas/${citaId}/atender`);
            alert('Cita marcada como atendida');
            cargarCitas();
        } catch (error) {
            console.error(error);
            alert(error.response?.data?.error || 'Error al marcar cita');
        }
    };

    const agregarNotaMedica = async () => {
        if (!notaMedica.trim()) {
            alert('Escriba una nota médica');
            return;
        }
        try {
            // Endpoint para agregar nota médica (pendiente implementar)
            alert('Nota agregada (endpoint pendiente)');
            setNotaMedica('');
        } catch (error) {
            console.error(error);
            alert('Error al agregar nota');
        }
    };

    const cerrarSesion = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('usuario');
        navigate('/login');
    };

    if (cargando) return <div className="dashboard-medico-container"><h2>Cargando...</h2></div>;

    return (
        <div className="dashboard-medico-container">
            <div className="header">
                <h1>👨‍⚕️ MediFlow Pro - Dr. {usuario?.nombre}</h1>
                <button onClick={cerrarSesion}>Cerrar Sesión</button>
            </div>

            <h2>Citas de Hoy</h2>
            
            {citas.length === 0 ? (
                <p>No hay citas programadas para hoy</p>
            ) : (
                <div className="citas-lista">
                    {citas.map(cita => (
                        <div key={cita.id} className="cita-card">
                            <div className="cita-info">
                                <h3>{cita.paciente_nombre}</h3>
                                <p>Hora: {new Date(cita.fecha_hora).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                                <p>Teléfono: {cita.paciente_telefono || 'No registrado'}</p>
                                <p>Servicios: {cita.tiene_servicios > 0 ? '✅ Agregados' : '❌ Sin servicios'}</p>
                            </div>
                            <div className="cita-acciones">
                                <button onClick={() => verExpediente(cita.paciente_id, cita.paciente_nombre)}>📋 Expediente</button>
                                {cita.tiene_servicios > 0 && (
                                    <button onClick={() => marcarAtendida(cita.id)} className="btn-atender">✅ Atender</button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Modal Expediente */}
            {expedienteVisible && (
                <div className="modal-overlay" onClick={() => setExpedienteVisible(false)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '600px' }}>
                        <h3>📋 Expediente de {pacienteSeleccionado?.nombre}</h3>
                        
                        <h4>Notas médicas anteriores</h4>
                        {expedienteData.length === 0 ? (
                            <p>No hay notas médicas previas</p>
                        ) : (
                            expedienteData.map(nota => (
                                <div key={nota.id} className="nota-item">
                                    <p><strong>{new Date(nota.fecha).toLocaleDateString()}</strong> - Dr. {nota.medico_nombre}</p>
                                    <p>{nota.nota}</p>
                                </div>
                            ))
                        )}
                        
                        <h4>Agregar nota médica</h4>
                        <textarea 
                            rows="3" 
                            placeholder="Escribir nota médica (diagnóstico, recetas, observaciones)..."
                            value={notaMedica}
                            onChange={e => setNotaMedica(e.target.value)}
                            style={{ width: '100%', marginBottom: '10px' }}
                        />
                        <button onClick={agregarNotaMedica} style={{ background: '#28a745' }}>Guardar Nota</button>
                        
                        <button onClick={() => setExpedienteVisible(false)} style={{ marginTop: '15px', background: '#6c757d' }}>Cerrar</button>
                    </div>
                </div>
            )}
        </div>
    );
}

export default DashboardMedico;