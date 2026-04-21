import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './Dashboard.css';
import API_URL from '../config';

function Dashboard() {
  // ========== ESTADOS ==========
  const [utilidad, setUtilidad] = useState(null);
  const [gastos, setGastos] = useState([]);
  const [cobranza, setCobranza] = useState([]);
  const [resumenPacientes, setResumenPacientes] = useState([]);
  const [medicos, setMedicos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);
  const [consultorio, setConsultorio] = useState(null);
  const [busquedaPaciente, setBusquedaPaciente] = useState('');
  const [pacienteBuscado, setPacienteBuscado] = useState(null);
  
  const [nuevoGasto, setNuevoGasto] = useState({ concepto: '', monto: '', categoria: '', descripcion: '' });
  const [nuevaDeuda, setNuevaDeuda] = useState({ paciente_nombre: '', concepto: '', monto: '', medico_id: '', telefono: '', fecha_limite_pago: '' });
  const [pagoPorNombre, setPagoPorNombre] = useState({ nombre: '', monto: '' });
  const [nuevoMedico, setNuevoMedico] = useState({ nombre: '', especialidad: '', email: '', telefono: '' });

  const navigate = useNavigate();
  const token = localStorage.getItem('token');

  // ========== FUNCIONES ==========
  const cargarDatos = async () => {
    setCargando(true);
    setError(null);
    
    try {
      const [utilidadRes, gastosRes, cobranzaRes, resumenRes, medicosRes] = await Promise.all([
        axios.get('http://localhost:3000/api/utilidad', { headers: { Authorization: `Bearer ${token}` } }),
        axios.get('http://localhost:3000/api/gastos', { headers: { Authorization: `Bearer ${token}` } }),
        axios.get('http://localhost:3000/api/cobranza', { headers: { Authorization: `Bearer ${token}` } }),
        axios.get('http://localhost:3000/api/cobranza/resumen-pacientes', { headers: { Authorization: `Bearer ${token}` } }),
        axios.get('http://localhost:3000/api/medicos', { headers: { Authorization: `Bearer ${token}` } })
      ]);
      
      setUtilidad(utilidadRes.data);
      setGastos(gastosRes.data.gastos || []);
      setCobranza(cobranzaRes.data.cobranza || []);
      setResumenPacientes(resumenRes.data.pacientes || []);
      setMedicos(medicosRes.data.medicos || []);
    } catch (error) {
      console.error('Error cargando datos:', error);
      if (error.response?.status === 401) {
        cerrarSesion();
      } else {
        setError('No se pudo conectar con el servidor');
      }
    }
    setCargando(false);
  };

  const cerrarSesion = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('consultorio');
    navigate('/login');
  };

  const agregarGasto = async (e) => {
    e.preventDefault();
    try {
      await axios.get(`${API_URL}/api/utilidad`, { headers: { Authorization: `Bearer ${token}` } });
      setNuevoGasto({ concepto: '', monto: '', categoria: '', descripcion: '' });
      cargarDatos();
      alert('Gasto agregado correctamente');
    } catch (error) {
      console.error(error);
      alert('Error al agregar gasto');
    }
  };

  const agregarMedico = async (e) => {
    e.preventDefault();
    try {
      await axios.get(`${API_URL}/api/utilidad`, { headers: { Authorization: `Bearer ${token}` } });
      setNuevoMedico({ nombre: '', especialidad: '', email: '', telefono: '' });
      cargarDatos();
      alert('Médico agregado correctamente');
    } catch (error) {
      console.error(error);
      alert(error.response?.data?.mensaje || 'Error al agregar médico');
    }
  };

  const agregarDeuda = async (e) => {
    e.preventDefault();
    try {
      await axios.get(`${API_URL}/api/utilidad`, { headers: { Authorization: `Bearer ${token}` } });
      setNuevaDeuda({ paciente_nombre: '', concepto: '', monto: '', medico_id: '', telefono: '', fecha_limite_pago: '' });
      cargarDatos();
      alert('Deuda registrada correctamente');
    } catch (error) {
      console.error(error);
      alert('Error al registrar deuda');
    }
  };

  const buscarPaciente = async () => {
    if (!busquedaPaciente.trim()) {
      alert('Ingrese un nombre para buscar');
      return;
    }
    try {
      const res = await axios.get(`${API_URL}/api/utilidad`, { headers: { Authorization: `Bearer ${token}` } });
      setPacienteBuscado(res.data);
    } catch (error) {
      console.error(error);
      alert('Error al buscar paciente');
    }
  };

  const pagarPorNombre = async (e) => {
    e.preventDefault();
    if (!pagoPorNombre.nombre || !pagoPorNombre.monto) {
      alert('Ingrese nombre y monto a pagar');
      return;
    }
    try {
      await axios.get(`${API_URL}/api/utilidad`, { headers: { Authorization: `Bearer ${token}` } });
      setPagoPorNombre({ nombre: '', monto: '' });
      setPacienteBuscado(null);
      setBusquedaPaciente('');
      cargarDatos();
      alert('Pago registrado correctamente');
    } catch (error) {
      console.error(error);
      alert(error.response?.data?.mensaje || 'Error al registrar pago');
    }
  };

  // ========== EFECTO INICIAL ==========
  useEffect(() => {
    if (!token) {
      navigate('/login');
    } else {
      const consultorioData = localStorage.getItem('consultorio');
      if (consultorioData) {
        setConsultorio(JSON.parse(consultorioData));
      }
      cargarDatos();
    }
  }, []);

  // ========== RENDER ==========
  if (cargando) return <div className="dashboard-container"><h2>Cargando datos...</h2></div>;
  if (error) return <div className="dashboard-container"><h2>❌ {error}</h2><button onClick={cargarDatos}>Reintentar</button></div>;

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <div>
          <h1>🏥 MediFlow Pro</h1>
          <p className="consultorio-nombre">{consultorio?.nombre}</p>
        </div>
        <div className="header-info">
          <span className="plan">Plan: {consultorio?.plan} (hasta {consultorio?.medicos_max} médicos)</span>
          <button className="btn-cerrar" onClick={cerrarSesion}>Cerrar Sesión</button>
        </div>
      </div>

      <div className="tarjetas">
        <div className="tarjeta ingreso">
          <h3>💰 Total Ingresos</h3>
          <p className="numero">${utilidad?.total_ingresos?.toFixed(2) || 0}</p>
        </div>
        <div className="tarjeta gasto">
          <h3>📉 Total Gastos</h3>
          <p className="numero">${utilidad?.total_gastos?.toFixed(2) || 0}</p>
        </div>
        <div className="tarjeta utilidad">
          <h3>📊 Utilidad Neta</h3>
          <p className="numero">${utilidad?.utilidad_neta?.toFixed(2) || 0}</p>
          <p className="mensaje">{utilidad?.mensaje}</p>
        </div>
      </div>

      <div className="formularios">
        <div className="form-card">
          <h3>➕ Agregar Gasto</h3>
          <form onSubmit={agregarGasto}>
            <input type="text" placeholder="Concepto" value={nuevoGasto.concepto} onChange={e => setNuevoGasto({...nuevoGasto, concepto: e.target.value})} required />
            <input type="number" placeholder="Monto" value={nuevoGasto.monto} onChange={e => setNuevoGasto({...nuevoGasto, monto: e.target.value})} required />
            <input type="text" placeholder="Categoría" value={nuevoGasto.categoria} onChange={e => setNuevoGasto({...nuevoGasto, categoria: e.target.value})} />
            <input type="text" placeholder="Descripción" value={nuevoGasto.descripcion} onChange={e => setNuevoGasto({...nuevoGasto, descripcion: e.target.value})} />
            <button type="submit">Guardar Gasto</button>
          </form>
        </div>

        <div className="form-card">
          <h3>👨‍⚕️ Agregar Médico</h3>
          <form onSubmit={agregarMedico}>
            <input type="text" placeholder="Nombre" value={nuevoMedico.nombre} onChange={e => setNuevoMedico({...nuevoMedico, nombre: e.target.value})} required />
            <input type="text" placeholder="Especialidad" value={nuevoMedico.especialidad} onChange={e => setNuevoMedico({...nuevoMedico, especialidad: e.target.value})} />
            <input type="email" placeholder="Email" value={nuevoMedico.email} onChange={e => setNuevoMedico({...nuevoMedico, email: e.target.value})} />
            <input type="text" placeholder="Teléfono" value={nuevoMedico.telefono} onChange={e => setNuevoMedico({...nuevoMedico, telefono: e.target.value})} />
            <button type="submit">Agregar Médico</button>
          </form>
          <small>Usados: {medicos.length} / {consultorio?.medicos_max}</small>
        </div>

        <div className="form-card">
          <h3>➕ Registrar Deuda</h3>
          <form onSubmit={agregarDeuda}>
            <input type="text" placeholder="Nombre del paciente" value={nuevaDeuda.paciente_nombre} onChange={e => setNuevaDeuda({...nuevaDeuda, paciente_nombre: e.target.value})} required />
            <input type="text" placeholder="Concepto" value={nuevaDeuda.concepto} onChange={e => setNuevaDeuda({...nuevaDeuda, concepto: e.target.value})} required />
            <input type="number" placeholder="Monto" value={nuevaDeuda.monto} onChange={e => setNuevaDeuda({...nuevaDeuda, monto: e.target.value})} required />
            <select value={nuevaDeuda.medico_id} onChange={e => setNuevaDeuda({...nuevaDeuda, medico_id: e.target.value})}>
              <option value="">Seleccionar médico</option>
              {medicos.map(m => <option key={m.id} value={m.id}>{m.nombre}</option>)}
            </select>
            <input type="text" placeholder="Teléfono" value={nuevaDeuda.telefono} onChange={e => setNuevaDeuda({...nuevaDeuda, telefono: e.target.value})} />
            <input type="date" placeholder="Fecha límite" value={nuevaDeuda.fecha_limite_pago} onChange={e => setNuevaDeuda({...nuevaDeuda, fecha_limite_pago: e.target.value})} />
            <button type="submit">Registrar Deuda</button>
          </form>
        </div>

        <div className="form-card">
          <h3>🔍 Buscar Paciente</h3>
          <div className="buscar-group">
            <input type="text" placeholder="Nombre del paciente" value={busquedaPaciente} onChange={e => setBusquedaPaciente(e.target.value)} />
            <button type="button" onClick={buscarPaciente}>Buscar</button>
          </div>
          {pacienteBuscado && (
            <div className="resultado-busqueda">
              <p><strong>{pacienteBuscado.paciente}</strong></p>
              <p>Deuda total: ${pacienteBuscado.total_pendiente?.toFixed(2) || 0}</p>
              {pacienteBuscado.deudas?.map(d => (
                <div key={d.id} className="deuda-item">
                  <span>{d.concepto}</span>
                  <span>Saldo: ${parseFloat(d.saldo_pendiente).toFixed(2)}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="form-card">
          <h3>💵 Registrar Pago</h3>
          <form onSubmit={pagarPorNombre}>
            <input type="text" placeholder="Nombre del paciente" value={pagoPorNombre.nombre} onChange={e => setPagoPorNombre({...pagoPorNombre, nombre: e.target.value})} required />
            <input type="number" placeholder="Monto a pagar" value={pagoPorNombre.monto} onChange={e => setPagoPorNombre({...pagoPorNombre, monto: e.target.value})} required />
            <button type="submit">Registrar Pago</button>
          </form>
        </div>
      </div>

      <div className="seccion">
        <h3>📋 Médicos del Consultorio</h3>
        <table className="tabla">
          <thead>
            <tr><th>Nombre</th><th>Especialidad</th><th>Email</th><th>Teléfono</th></tr>
          </thead>
          <tbody>
            {medicos.length === 0 ? (
              <tr><td colSpan="4">No hay médicos registrados</td></tr>
            ) : (
              medicos.map(m => (
                <tr key={m.id}>
                  <td>{m.nombre}</td>
                  <td>{m.especialidad}</td>
                  <td>{m.email}</td>
                  <td>{m.telefono}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="seccion">
        <h3>📋 Resumen de Pacientes con Deuda</h3>
        <table className="tabla">
          <thead>
            <tr><th>Paciente</th><th>Deudas</th><th>Total</th><th>Pagado</th><th>Saldo</th></tr>
          </thead>
          <tbody>
            {resumenPacientes.length === 0 ? (
              <tr><td colSpan="5">No hay pacientes con deuda</td></tr>
            ) : (
              resumenPacientes.map(p => (
                <tr key={p.paciente_nombre}>
                  <td>{p.paciente_nombre}</td>
                  <td>{p.total_deudas}</td>
                  <td>${parseFloat(p.monto_total).toFixed(2)}</td>
                  <td>${parseFloat(p.monto_pagado).toFixed(2)}</td>
                  <td className="saldo-pendiente">${parseFloat(p.saldo_total).toFixed(2)}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="seccion">
        <h3>📋 Últimos Gastos</h3>
        <table className="tabla">
          <thead>
            <tr><th>Concepto</th><th>Monto</th><th>Categoría</th><th>Fecha</th></tr>
          </thead>
          <tbody>
            {gastos.length === 0 ? (
              <tr><td colSpan="4">No hay gastos registrados</td></tr>
            ) : (
              gastos.map(g => (
                <tr key={g.id}>
                  <td>{g.concepto}</td>
                  <td>${parseFloat(g.monto).toFixed(2)}</td>
                  <td>{g.categoria}</td>
                  <td>{g.fecha?.split('T')[0]}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default Dashboard;