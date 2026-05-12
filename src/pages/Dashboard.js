import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import './Dashboard.css';

function Dashboard() {
    const [usuario, setUsuario] = useState(null);
    const [medicos, setMedicos] = useState([]);
    const [pacientes, setPacientes] = useState([]);
    const [citas, setCitas] = useState([]);
    const [servicios, setServicios] = useState([]);
    const [cargando, setCargando] = useState(true);

    // Estados para búsqueda
    const [busquedaMedico, setBusquedaMedico] = useState('');
    const [busquedaPaciente, setBusquedaPaciente] = useState('');

    // Estados para formularios
    const [formMedico, setFormMedico] = useState({
        nombre: '',
        email: '',
        password: '',
        especialidad: '',
        cedula: '',
        telefono: '',
        activo: true
    });

    const [formPaciente, setFormPaciente] = useState({
        nombre: '',
        email: '',
        telefono: '',
        fecha_nacimiento: '',
        direccion: '',
        activo: true
    });

    const [formCita, setFormCita] = useState({
        paciente_id: '',
        medico_id: '',
        fecha: '',
        hora: '',
        duracion: 30,
        notas: ''
        // Eliminar: es_cortesia, servicios, servicio_seleccionado
    });

    const [formServicio, setFormServicio] = useState({
        nombre: '',
        descripcion: '',
        precio: ''
    });

    const [mostrarFormulario, setMostrarFormulario] = useState({
        medico: false,
        paciente: false,
        cita: false,
        servicio: false
    });

    // Estados para servicios de cita
    const [serviciosCita, setServiciosCita] = useState([]);
    const [citaSeleccionada, setCitaSeleccionada] = useState(null);
    const [servicioSeleccionado, setServicioSeleccionado] = useState('');
    const [cantidadServicio, setCantidadServicio] = useState(1);
    const [mostrarModalServicios, setMostrarModalServicios] = useState(false);
    const [serviciosDisponibles, setServiciosDisponibles] = useState([]);
    const [horariosDisponibles, setHorariosDisponibles] = useState([]);
    const [cargandoHorarios, setCargandoHorarios] = useState(false);

    // Estados para deudas
    const [deudasActivas, setDeudasActivas] = useState([]);
    const [historialDeudas, setHistorialDeudas] = useState([]);
    const [deudaSeleccionada, setDeudaSeleccionada] = useState(null);
    const [showModalAbono, setShowModalAbono] = useState(false);
    const [showModalEditarDeuda, setShowModalEditarDeuda] = useState(false);
    const [formAbono, setFormAbono] = useState({
        monto: '',
        metodo_pago: 'efectivo'
    });
    const [formEditarDeuda, setFormEditarDeuda] = useState({
        servicios: [],
        descuento: 0,
        notas: '',
        nuevo_servicio_id: ''
    });
    const [busquedaDeuda, setBusquedaDeuda] = useState('');
    const [filtroEstadoDeuda, setFiltroEstadoDeuda] = useState('todos');

    // Estados para edición de deuda (renombrados)
    const [nuevosServicios, setNuevosServicios] = useState([]);
    const [servicioSeleccionadoDeuda, setServicioSeleccionadoDeuda] = useState('');
    const [cantidadSeleccionadaDeuda, setCantidadSeleccionadaDeuda] = useState(1);

    // Estados para edición
    const [medicoEditando, setMedicoEditando] = useState(null);
    const [showModalMedico, setShowModalMedico] = useState(false);
    const [pacienteEditando, setPacienteEditando] = useState(null);
    const [showModalPaciente, setShowModalPaciente] = useState(false);

    // Paginación
    const [paginaMedicos, setPaginaMedicos] = useState(1);
    const [paginaPacientes, setPaginaPacientes] = useState(1);
    const [paginaCitas, setPaginaCitas] = useState(1);
    const [paginaServicios, setPaginaServicios] = useState(1);
    const itemsPorPagina = 10;

    const navigate = useNavigate();

    // ========== CONSTANTES DE ROL ==========
    const esAdminOSecretaria = usuario?.rol === 'admin' || usuario?.rol === 'secretaria';
    const esAdmin = usuario?.rol === 'admin';

    // ========== FUNCIONES DE CARGA ==========
    const cargarMedicos = async () => {
        try {
            const res = await api.get('/medicos');
            setMedicos(res.data.medicos || []);
            setCargando(false);
        } catch (error) {
            console.error('Error al cargar médicos:', error);
            setCargando(false);
        }
    };

    const cargarPacientes = async () => {
        try {
            const url = esAdmin ? '/pacientes?activos=false' : '/pacientes';
            const res = await api.get(url);
            let pacientesData = res.data.pacientes || [];

            if (busquedaPaciente.trim()) {
                pacientesData = pacientesData.filter(p =>
                    p.nombre.toLowerCase().includes(busquedaPaciente.toLowerCase())
                );
            }

            setPacientes(pacientesData);
        } catch (error) {
            console.error('Error al cargar pacientes:', error);
        }
    };

    const cargarCitas = async () => {
        try {
            const res = await api.get('/citas');
            setCitas(res.data.citas || []);
        } catch (error) {
            console.error('Error al cargar citas:', error);
        }
    };

    const cargarServiciosCatalogo = async () => {
        try {
            const res = await api.get('/servicios');
            setServicios(res.data.servicios || []);
        } catch (error) {
            console.error('Error al cargar servicios:', error);
        }
    };

    const cargarServiciosDisponibles = async () => {
        try {
            const res = await api.get('/servicios');
            const activos = res.data.servicios?.filter(s => s.activo === true) || [];
            setServiciosDisponibles(activos);
        } catch (error) {
            console.error('Error al cargar servicios disponibles:', error);
        }
    };

    const cargarDeudasActivas = async () => {
        try {
            const res = await api.get('/cobranza/activas');
            setDeudasActivas(res.data.deudas || []);
        } catch (error) {
            console.error('Error al cargar deudas activas:', error);
        }
    };

    const cargarHistorialDeudas = async () => {
        try {
            const res = await api.get('/cobranza/historial');
            setHistorialDeudas(res.data.historial || []);
        } catch (error) {
            console.error('Error al cargar historial:', error);
        }
    };

    const cargarHorariosDisponibles = async (medicoId, fecha) => {
        if (!medicoId || !fecha) {
            setHorariosDisponibles([]);
            return;
        }
        setCargandoHorarios(true);
        try {
            const res = await api.get(`/citas/disponible/${medicoId}/${fecha}`);
            setHorariosDisponibles(res.data.horarios || []);
        } catch (error) {
            console.error('Error al cargar horarios:', error);
            setHorariosDisponibles([]);
        } finally {
            setCargandoHorarios(false);
        }
    };

    const activarServicio = async (id) => {
        if (!window.confirm('¿Activar este servicio nuevamente?')) return;
        try {
            await api.put(`/servicios/${id}/activar`);
            alert('Servicio activado');
            cargarServiciosCatalogo();  // ← Cambiado
            cargarServiciosDisponibles();
        } catch (error) {
            console.error(error);
            alert(error.response?.data?.error || 'Error al activar servicio');
        }
    };

    const agregarServicioATemporal = () => {
        if (!servicioSeleccionadoDeuda) {
            alert('Seleccione un servicio');
            return;
        }
        const servicio = serviciosDisponibles.find(s => s.id === parseInt(servicioSeleccionadoDeuda));
        if (servicio) {
            setNuevosServicios([...nuevosServicios, {
                servicio_id: servicio.id,
                servicio_nombre: servicio.nombre,
                cantidad: cantidadSeleccionadaDeuda,
                precio_unitario: servicio.precio,
                subtotal: cantidadSeleccionadaDeuda * servicio.precio
            }]);
            setServicioSeleccionadoDeuda('');
            setCantidadSeleccionadaDeuda(1);
        }
    };

    const eliminarServicioTemporal = (index) => {
        const nuevos = [...nuevosServicios];
        nuevos.splice(index, 1);
        setNuevosServicios(nuevos);
    };

    const guardarEdicionDeuda = async () => {
        if (nuevosServicios.length === 0) {
            alert('No hay servicios nuevos para agregar');
            return;
        }

        try {
            await api.put(`/cobranza/${deudaSeleccionada.id}/editar`, {
                nuevos_servicios: nuevosServicios.map(s => ({
                    servicio_id: s.servicio_id,
                    cantidad: s.cantidad,
                    precio_unitario: s.precio_unitario
                }))
            });
            alert('Servicios agregados exitosamente');
            setShowModalEditarDeuda(false);
            setNuevosServicios([]);
            cargarDeudasActivas();
            cargarHistorialDeudas();
        } catch (error) {
            console.error(error);
            alert(error.response?.data?.error || 'Error al editar deuda');
        }
    };

    // ========== EFECTOS ==========
    useEffect(() => {
        const token = localStorage.getItem('token');
        const usuarioData = localStorage.getItem('usuario');

        if (!token) {
            navigate('/login');
        } else {
            setUsuario(JSON.parse(usuarioData));
            cargarMedicos();
            cargarPacientes();
            cargarCitas();
            cargarServiciosCatalogo();
            cargarDeudasActivas();
            cargarHistorialDeudas();
            window.scrollTo(0, 0);
        }
    }, [navigate]);

    useEffect(() => {
        const token = localStorage.getItem('token');
        const usuarioData = localStorage.getItem('usuario');

        if (!token) {
            navigate('/login');
        } else {
            setUsuario(JSON.parse(usuarioData));
            cargarMedicos();
            cargarPacientes();
            cargarCitas();
            cargarServiciosCatalogo();
            cargarDeudasActivas();
            cargarHistorialDeudas();
            cargarServiciosDisponibles();  // ← AGREGAR ESTA LÍNEA
            window.scrollTo(0, 0);
        }
    }, [navigate]);

    useEffect(() => {
        setPaginaMedicos(1);
        setPaginaPacientes(1);
        setPaginaCitas(1);
        setPaginaServicios(1);
    }, [medicos.length, pacientes.length, citas.length, servicios.length]);

    useEffect(() => {
        setPaginaMedicos(1);
    }, [busquedaMedico]);

    useEffect(() => {
        if (usuario) {
            cargarPacientes();
        }
    }, [busquedaPaciente]);

    useEffect(() => {
        if (mostrarFormulario.cita) {
            cargarServiciosDisponibles();
        }
    }, [mostrarFormulario.cita]);

    // ========== MÉDICOS ==========
    const handleCrearMedico = async (e) => {
        e.preventDefault();
        try {
            await api.post('/medicos', formMedico);
            alert('Médico creado exitosamente');
            setFormMedico({ nombre: '', email: '', password: '', especialidad: '', cedula: '', telefono: '', activo: true });
            setMostrarFormulario({ ...mostrarFormulario, medico: false });
            cargarMedicos();
        } catch (error) {
            console.error(error);
            alert(error.response?.data?.error || 'Error al crear médico');
        }
    };

    const abrirModalEditarMedico = (medico) => {
        setMedicoEditando(medico);
        setFormMedico({
            nombre: medico.nombre,
            email: medico.email,
            password: '',
            especialidad: medico.especialidad || '',
            cedula: medico.cedula || '',
            telefono: medico.telefono || '',
            activo: medico.activo
        });
        setShowModalMedico(true);
    };

    const actualizarMedico = async (e) => {
        e.preventDefault();
        try {
            const payload = { ...formMedico };
            if (!payload.password) delete payload.password;

            await api.put(`/medicos/${medicoEditando.id}`, payload);
            alert('Médico actualizado exitosamente');
            setShowModalMedico(false);
            setMedicoEditando(null);
            setFormMedico({ nombre: '', email: '', password: '', especialidad: '', cedula: '', telefono: '', activo: true });
            cargarMedicos();
        } catch (error) {
            console.error(error);
            alert(error.response?.data?.error || 'Error al actualizar médico');
        }
    };

    const desactivarMedico = async (id) => {
        if (!window.confirm('¿Desactivar este médico? Podrá volver a activarlo desde la edición.')) return;
        try {
            await api.delete(`/medicos/${id}`);
            alert('Médico desactivado');
            cargarMedicos();
        } catch (error) {
            console.error(error);
            alert(error.response?.data?.error || 'Error al desactivar médico');
        }
    };

    const activarMedico = async (id) => {
        if (!window.confirm('¿Activar este médico nuevamente?')) return;
        try {
            await api.put(`/medicos/${id}/activar`);
            alert('Médico activado');
            cargarMedicos();
        } catch (error) {
            console.error(error);
            alert(error.response?.data?.error || 'Error al activar médico');
        }
    };

    // ========== PACIENTES ==========
    const handleCrearPaciente = async (e) => {
        e.preventDefault();
        try {
            await api.post('/pacientes', formPaciente);
            alert('Paciente creado exitosamente');
            setFormPaciente({ nombre: '', email: '', telefono: '', fecha_nacimiento: '', direccion: '', activo: true });
            setMostrarFormulario({ ...mostrarFormulario, paciente: false });
            cargarPacientes();
        } catch (error) {
            console.error(error);
            alert(error.response?.data?.error || 'Error al crear paciente');
        }
    };

    const abrirModalEditarPaciente = (paciente) => {
        setPacienteEditando(paciente);
        setFormPaciente({
            nombre: paciente.nombre,
            email: paciente.email || '',
            telefono: paciente.telefono || '',
            fecha_nacimiento: paciente.fecha_nacimiento ? paciente.fecha_nacimiento.split('T')[0] : '',
            direccion: paciente.direccion || '',
            activo: paciente.activo
        });
        setShowModalPaciente(true);
    };

    const actualizarPaciente = async (e) => {
        e.preventDefault();
        try {
            await api.put(`/pacientes/${pacienteEditando.id}`, formPaciente);
            alert('Paciente actualizado exitosamente');
            setShowModalPaciente(false);
            setPacienteEditando(null);
            setFormPaciente({ nombre: '', email: '', telefono: '', fecha_nacimiento: '', direccion: '', activo: true });
            cargarPacientes();
        } catch (error) {
            console.error(error);
            alert(error.response?.data?.error || 'Error al actualizar paciente');
        }
    };

    const desactivarPaciente = async (id) => {
        if (!window.confirm('¿Desactivar este paciente? Podrá volver a activarlo desde la edición.')) return;
        try {
            await api.delete(`/pacientes/${id}`);
            alert('Paciente desactivado');
            cargarPacientes();
        } catch (error) {
            console.error(error);
            alert(error.response?.data?.error || 'Error al desactivar paciente');
        }
    };

    const activarPaciente = async (id) => {
        if (!window.confirm('¿Activar este paciente nuevamente?')) return;
        try {
            await api.put(`/pacientes/${id}/activar`);
            alert('Paciente activado');
            cargarPacientes();
        } catch (error) {
            console.error(error);
            alert(error.response?.data?.error || 'Error al activar paciente');
        }
    };

    // ========== CITAS ==========
    const handleMedicoChange = (e) => {
        const medicoId = e.target.value;
        setFormCita({ ...formCita, medico_id: medicoId, hora: '' });
        if (medicoId && formCita.fecha) {
            cargarHorariosDisponibles(medicoId, formCita.fecha);
        } else {
            setHorariosDisponibles([]);
        }
    };

    const handleFechaChange = (e) => {
        const fecha = e.target.value;
        setFormCita({ ...formCita, fecha, hora: '' });
        if (formCita.medico_id && fecha) {
            cargarHorariosDisponibles(formCita.medico_id, fecha);
        } else {
            setHorariosDisponibles([]);
        }
    };

    const handleCrearCita = async (e) => {
        e.preventDefault();
        try {
            const fechaHoraStr = `${formCita.fecha}T${formCita.hora}:00`;

            const payload = {
                paciente_id: formCita.paciente_id,
                medico_id: formCita.medico_id,
                fecha_hora: fechaHoraStr,
                duracion: formCita.duracion,
                notas: formCita.notas
            };

            await api.post('/citas', payload);

            // Pequeño retraso para asegurar que la BD se actualizó
            setTimeout(() => {
                cargarCitas();
            }, 500);

            // Limpiar formulario y cerrar
            setFormCita({
                paciente_id: '',
                medico_id: '',
                fecha: '',
                hora: '',
                duracion: 30,
                notas: ''
            });
            setMostrarFormulario({ ...mostrarFormulario, cita: false });
            setHorariosDisponibles([]);

            alert('Cita creada exitosamente');
        } catch (error) {
            console.error('❌ Error:', error.response?.data || error);
            alert(error.response?.data?.error || 'Error al crear cita');
        }
    };

    const cancelarCita = async (id) => {
        if (!window.confirm('¿Cancelar esta cita?')) return;
        try {
            await api.delete(`/citas/${id}`);
            alert('Cita cancelada');
            cargarCitas(); // Recargar lista (las canceladas no se muestran)
        } catch (error) {
            console.error(error);
            alert(error.response?.data?.error || 'Error al cancelar cita');
        }
    };

    const completarCita = async (citaId) => {
        if (!window.confirm('¿Marcar esta cita como completada? Se generará la deuda correspondiente.')) return;
        try {
            await api.put(`/citas/${citaId}/completar`);
            alert('Cita completada y deuda generada');
            cargarCitas();
            cargarDeudasActivas();
            cargarHistorialDeudas();
        } catch (error) {
            console.error(error);
            alert(error.response?.data?.error || 'Error al completar cita');
        }
    };

    // ========== SERVICIOS DE CITA ==========
    const cargarServiciosDeCita = async (citaId) => {
        try {
            const res = await api.get(`/citas/${citaId}/servicios`);
            setServiciosCita(res.data.servicios || []);
        } catch (error) {
            console.error('Error al cargar servicios de la cita:', error);
        }
    };

    const agregarServicioACita = async (e) => {
        e.preventDefault();
        if (!servicioSeleccionado) {
            alert('Seleccione un servicio');
            return;
        }
        try {
            await api.post(`/citas/${citaSeleccionada}/servicios`, {
                servicio_id: parseInt(servicioSeleccionado),
                cantidad: cantidadServicio
            });
            alert('Servicio agregado a la cita');
            setServicioSeleccionado('');
            setCantidadServicio(1);
            cargarServiciosDeCita(citaSeleccionada);
            cargarCitas();
        } catch (error) {
            console.error(error);
            alert(error.response?.data?.error || 'Error al agregar servicio');
        }
    };

    const eliminarServicioDeCita = async (servicioCitaId) => {
        if (!window.confirm('¿Eliminar este servicio de la cita?')) return;
        try {
            await api.delete(`/citas/${citaSeleccionada}/servicios/${servicioCitaId}`);
            alert('Servicio eliminado');
            cargarServiciosDeCita(citaSeleccionada);
            cargarCitas();
        } catch (error) {
            console.error(error);
            alert(error.response?.data?.error || 'Error al eliminar servicio');
        }
    };

    const abrirModalServicios = async (citaId) => {
        setCitaSeleccionada(citaId);
        setMostrarModalServicios(true);
        await cargarServiciosDisponibles();
        await cargarServiciosDeCita(citaId);
    };

    const cerrarModalServicios = () => {
        setMostrarModalServicios(false);
        setCitaSeleccionada(null);
        setServiciosCita([]);
        setServicioSeleccionado('');
        setCantidadServicio(1);
    };

    // ========== DEUDAS ==========
    const registrarAbono = async (e) => {
        e.preventDefault();
        if (!formAbono.monto || parseFloat(formAbono.monto) <= 0) {
            alert('Ingrese un monto válido');
            return;
        }

        try {
            await api.post(`/cobranza/${deudaSeleccionada.id}/abonar`, {
                monto: parseFloat(formAbono.monto),
                metodo_pago: formAbono.metodo_pago
            });
            alert('Abono registrado exitosamente');
            setShowModalAbono(false);
            setFormAbono({ monto: '', metodo_pago: 'efectivo' });
            cargarDeudasActivas();
            cargarHistorialDeudas();
        } catch (error) {
            console.error(error);
            alert(error.response?.data?.error || 'Error al registrar abono');
        }
    };

    const abrirModalEditarDeuda = async (deuda) => {
        setDeudaSeleccionada(deuda);
        try {
            // Cargar servicios disponibles si no están
            if (serviciosDisponibles.length === 0) {
                await cargarServiciosDisponibles();
            }

            const deudaRes = await api.get(`/cobranza/${deuda.id}`);
            const citaId = deudaRes.data.deuda.cita_id;

            if (citaId) {
                const serviciosRes = await api.get(`/citas/${citaId}/servicios`);
                setFormEditarDeuda(prev => ({
                    ...prev,
                    servicios: serviciosRes.data.servicios || [],
                    notas: deuda.notas || ''
                }));
            }
            setShowModalEditarDeuda(true);
        } catch (error) {
            console.error('Error al cargar datos de la deuda:', error);
            alert('Error al cargar los datos de la deuda');
        }
    };
    const guardarEdicionDeuda = async (e) => {
        e.preventDefault();
        try {
            let payload;

            if (formEditarDeuda.precio_personalizado) {
                // Usar monto personalizado
                payload = {
                    servicios_ids: formEditarDeuda.servicios.map(s => ({
                        servicio_id: s.servicio_id,
                        cantidad: s.cantidad,
                        precio_unitario: s.precio_unitario
                    })),
                    monto_personalizado: formEditarDeuda.monto_personalizado,
                    notas: formEditarDeuda.notas
                };
            } else {
                // Usar suma de servicios + descuento
                const subtotal = formEditarDeuda.servicios.reduce((sum, s) => sum + (s.cantidad * s.precio_unitario), 0);
                const total = Math.max(0, subtotal - (parseFloat(formEditarDeuda.descuento) || 0));
                payload = {
                    servicios_ids: formEditarDeuda.servicios.map(s => ({
                        servicio_id: s.servicio_id,
                        cantidad: s.cantidad,
                        precio_unitario: s.precio_unitario
                    })),
                    descuento: parseFloat(formEditarDeuda.descuento) || 0,
                    monto_personalizado: total,
                    notas: formEditarDeuda.notas
                };
            }

            await api.put(`/cobranza/${deudaSeleccionada.id}/editar`, payload);
            alert('Deuda actualizada exitosamente');
            setShowModalEditarDeuda(false);
            setDeudaSeleccionada(null);
            cargarDeudasActivas();
            cargarHistorialDeudas();
        } catch (error) {
            console.error(error);
            alert(error.response?.data?.error || 'Error al actualizar deuda');
        }
    };

    // ========== SERVICIOS ==========
    const handleCrearServicio = async (e) => {
        e.preventDefault();
        try {
            await api.post('/servicios', formServicio);
            alert('Servicio creado exitosamente');
            setFormServicio({ nombre: '', descripcion: '', precio: '' });
            setMostrarFormulario({ ...mostrarFormulario, servicio: false });
            cargarServiciosCatalogo();
            cargarServiciosDisponibles();
        } catch (error) {
            console.error(error);
            alert(error.response?.data?.error || 'Error al crear servicio');
        }
    };

    const eliminarServicio = async (id) => {
        if (!window.confirm('¿Desactivar este servicio?')) return;
        try {
            await api.delete(`/servicios/${id}`);
            alert('Servicio desactivado');
            cargarServiciosCatalogo();  // ← Cambiado
            cargarServiciosDisponibles();
        } catch (error) {
            console.error(error);
            alert(error.response?.data?.error || 'Error al desactivar servicio');
        }
    };

    const cerrarSesion = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('usuario');
        navigate('/login');
    };

    const formatearFecha = (fecha) => {
        if (!fecha) return '';
        return new Date(fecha).toLocaleString('es-MX', { timeZone: 'America/Tijuana' });
    };

    if (cargando) return <div className="container"><h2>Cargando...</h2></div>;

    // Paginación con filtros
    const medicosFiltrados = busquedaMedico.trim()
        ? medicos.filter(m => m.nombre.toLowerCase().includes(busquedaMedico.toLowerCase()))
        : medicos;
    const medicosPaginados = medicosFiltrados.slice((paginaMedicos - 1) * itemsPorPagina, paginaMedicos * itemsPorPagina);
    const totalPaginasMedicos = Math.ceil(medicosFiltrados.length / itemsPorPagina);

    const pacientesFiltrados = busquedaPaciente.trim()
        ? pacientes.filter(p => p.nombre.toLowerCase().includes(busquedaPaciente.toLowerCase()))
        : pacientes;
    const pacientesPaginados = pacientesFiltrados.slice((paginaPacientes - 1) * itemsPorPagina, paginaPacientes * itemsPorPagina);
    const totalPaginasPacientes = Math.ceil(pacientesFiltrados.length / itemsPorPagina);

    const citasPaginadas = citas.slice((paginaCitas - 1) * itemsPorPagina, paginaCitas * itemsPorPagina);
    const totalPaginasCitas = Math.ceil(citas.length / itemsPorPagina);

    const serviciosPaginados = servicios.slice((paginaServicios - 1) * itemsPorPagina, paginaServicios * itemsPorPagina);
    const totalPaginasServicios = Math.ceil(servicios.length / itemsPorPagina);

    return (
        <div className="container">
            <h1>🏥 MediFlow Pro</h1>
            <div className="header">
                <p>Bienvenido, <strong>{usuario?.nombre}</strong> (Rol: {usuario?.rol})</p>
                <button onClick={cerrarSesion}>Cerrar Sesión</button>
            </div>

            {/* ========== SECCIÓN CITAS ========== */}
            <h2>📅 Agenda de Citas</h2>

            {esAdminOSecretaria && (
                <button onClick={() => setMostrarFormulario({ ...mostrarFormulario, cita: !mostrarFormulario.cita })}>
                    {mostrarFormulario.cita ? 'Cancelar' : '+ Nueva Cita'}
                </button>
            )}

            {mostrarFormulario.cita && (
                <div className="form-card">
                    <h3>➕ Agendar Cita</h3>
                    <form onSubmit={handleCrearCita}>
                        <select value={formCita.paciente_id} onChange={e => setFormCita({ ...formCita, paciente_id: e.target.value })} required>
                            <option value="">Seleccionar paciente</option>
                            {pacientes.filter(p => p.activo === true).map(p => (
                                <option key={p.id} value={p.id}>{p.nombre}</option>
                            ))}
                        </select>

                        <select value={formCita.medico_id} onChange={handleMedicoChange} required>
                            <option value="">Seleccionar médico</option>
                            {medicos.filter(m => m.activo === true).map(m => (
                                <option key={m.id} value={m.id}>{m.nombre}</option>
                            ))}
                        </select>

                        <input type="date" value={formCita.fecha} onChange={handleFechaChange} required />

                        <select value={formCita.hora} onChange={e => setFormCita({ ...formCita, hora: e.target.value })} required>
                            <option value="">Seleccionar hora</option>
                            {cargandoHorarios ? (
                                <option disabled>Cargando horarios...</option>
                            ) : (
                                horariosDisponibles.map(h => <option key={h} value={h}>{h}</option>)
                            )}
                        </select>

                        <select value={formCita.duracion} onChange={e => setFormCita({ ...formCita, duracion: e.target.value })}>
                            <option value="30">30 minutos</option>
                            <option value="60">1 hora</option>
                        </select>

                        <textarea placeholder="Notas (opcional)" value={formCita.notas} onChange={e => setFormCita({ ...formCita, notas: e.target.value })} rows="2" />
                        <button type="submit">Guardar Cita</button>
                    </form>
                </div>
            )}

            {/* Tabla de citas */}
            <div className="table-container">
                <h3>Próximas Citas</h3>
                <table className="tabla tabla-citas">
                    <thead>
                        <tr>
                            <th>Paciente</th>
                            <th>Médico</th>
                            <th>Fecha</th>
                            <th>Hora</th>
                            <th>Duración</th>
                            <th>Estado</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {citasPaginadas.length === 0 ? (
                            <tr><td colSpan="7">No hay citas programadas</td></tr>
                        ) : (
                            citasPaginadas.map(cita => (
                                <tr key={cita.id}>
                                    <td>{cita.paciente_nombre}</td>
                                    <td>{cita.medico_nombre}</td>
                                    <td>{cita.fecha_hora ? cita.fecha_hora.split('T')[0] : '-'}</td>
                                    <td>{cita.fecha_hora ? cita.fecha_hora.split('T')[1].substring(0, 5) : '-'}</td>
                                    <td>{cita.duracion} min</td>
                                    <td className={`estado ${cita.estado_cita}`}>{cita.estado_cita}</td>
                                    <td>
                                        <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap' }}>
                                            <button onClick={() => abrirModalServicios(cita.id)} style={{ background: '#17a2b8' }}>📦</button>
                                            {cita.estado_cita !== 'completada' && cita.estado_cita !== 'cancelada' && (
                                                <button onClick={() => completarCita(cita.id)} style={{ background: '#28a745' }}>✅ Completar</button>
                                            )}
                                            {cita.estado_cita !== 'completada' && cita.estado_cita !== 'cancelada' && (
                                                <button onClick={() => cancelarCita(cita.id)}>❌</button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
                {totalPaginasCitas > 1 && <div className="paginacion">...</div>}
            </div>

            {/* Modal de Servicios de Cita */}
            {mostrarModalServicios && (
                <div className="modal-overlay" onClick={cerrarModalServicios}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <h3>📦 Servicios de la Cita</h3>

                        <div className="form-card" style={{ margin: '10px 0' }}>
                            <h4>Agregar servicio</h4>
                            <form onSubmit={agregarServicioACita}>
                                <select value={servicioSeleccionado} onChange={e => setServicioSeleccionado(e.target.value)} required>
                                    <option value="">Seleccionar servicio</option>
                                    {serviciosDisponibles.map(s => (
                                        <option key={s.id} value={s.id}>{s.nombre} - ${parseFloat(s.precio).toFixed(2)}</option>
                                    ))}
                                </select>
                                <input type="number" min="1" value={cantidadServicio} onChange={e => setCantidadServicio(e.target.value)} placeholder="Cantidad" style={{ width: '100%', marginTop: '10px' }} />
                                <button type="submit">Agregar</button>
                            </form>
                        </div>

                        <h4>Servicios agregados</h4>
                        <table className="tabla" style={{ minWidth: 'auto' }}>
                            <thead>
                                <tr><th>Servicio</th><th>Cantidad</th><th>Precio</th><th>Subtotal</th><th>Acción</th></tr>
                            </thead>
                            <tbody>
                                {serviciosCita.length === 0 ? (
                                    <td><td colSpan="5">No hay servicios agregados a esta cita</td></td>
                                ) : (
                                    serviciosCita.map(s => (
                                        <tr key={s.id}>
                                            <td>{s.servicio_nombre}</td>
                                            <td>{s.cantidad}</td>
                                            <td>${parseFloat(s.precio_unitario).toFixed(2)}</td>
                                            <td>${parseFloat(s.subtotal).toFixed(2)}</td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                        <p><strong>Total de la cita: ${citas.find(c => c.id === citaSeleccionada)?.total ? parseFloat(citas.find(c => c.id === citaSeleccionada).total).toFixed(2) : '0.00'}</strong></p>
                        <button onClick={cerrarModalServicios} style={{ marginTop: '15px', background: '#6c757d' }}>Cerrar</button>
                    </div>
                </div>
            )}

            {/* ========== SECCIÓN COBRANZA ========== */}
            <h2>💰 Gestión de Cobranza</h2>

            {/* Tabla de Deudas Activas */}
            <div className="table-container">
                <h3>Deudas Activas</h3>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px', flexWrap: 'wrap', gap: '10px' }}>
                    <input
                        type="text"
                        placeholder="🔍 Buscar deuda por paciente..."
                        value={busquedaDeuda}
                        onChange={(e) => setBusquedaDeuda(e.target.value)}
                        style={{ padding: '8px 12px', borderRadius: '5px', border: '1px solid #ddd', minWidth: '250px' }}
                    />
                    <select value={filtroEstadoDeuda} onChange={(e) => setFiltroEstadoDeuda(e.target.value)} style={{ padding: '8px 12px', borderRadius: '5px', border: '1px solid #ddd' }}>
                        <option value="todos">Todos los estados</option>
                        <option value="pendiente">Pendiente</option>
                        <option value="parcial">Parcial</option>
                    </select>
                </div>

                <table className="tabla tabla-cobranza">
                    <thead>
                        <tr>
                            <th>Paciente</th>
                            <th>Concepto</th>
                            <th>Monto</th>
                            <th>Pagado</th>
                            <th>Saldo</th>
                            <th>Estado</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {deudasActivas.filter(d => {
                            if (busquedaDeuda && !d.paciente_nombre.toLowerCase().includes(busquedaDeuda.toLowerCase())) return false;
                            if (filtroEstadoDeuda !== 'todos' && d.estado !== filtroEstadoDeuda) return false;
                            return true;
                        }).map(deuda => (
                            <tr key={deuda.id}>
                                <td>{deuda.paciente_nombre}</td>
                                <td>{deuda.concepto}</td>
                                <td>${parseFloat(deuda.monto).toFixed(2)}</td>
                                <td>${parseFloat(deuda.monto_pagado).toFixed(2)}</td>
                                <td>${parseFloat(deuda.saldo_pendiente).toFixed(2)}</td>
                                <td className={`estado ${deuda.estado}`}>{deuda.estado}</td>
                                <td>
                                    <div style={{ display: 'flex', gap: '5px' }}>
                                        <button onClick={() => abrirModalEditarDeuda(deuda)} style={{ background: '#ffc107', color: '#000' }}>✏️</button>
                                        <button onClick={() => {
                                            setDeudaSeleccionada(deuda);
                                            setShowModalAbono(true);
                                        }} style={{ background: '#28a745' }}>💰</button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {deudasActivas.length === 0 && <p className="mensaje-vacio">No hay deudas activas</p>}
            </div>

            {/* Tabla de Historial (últimos 7 días) */}
            <div className="table-container">
                <h3>Historial de Deudas (últimos 7 días)</h3>
                <table className="tabla tabla-cobranza">
                    <thead>
                        <tr>
                            <th>Paciente</th>
                            <th>Concepto</th>
                            <th>Monto</th>
                            <th>Pagado</th>
                            <th>Estado</th>
                            <th>Fecha</th>
                        </tr>
                    </thead>
                    <tbody>
                        {historialDeudas.filter(d => {
                            if (busquedaDeuda && !d.paciente_nombre.toLowerCase().includes(busquedaDeuda.toLowerCase())) return false;
                            return true;
                        }).map(deuda => (
                            <tr key={deuda.id}>
                                <td>{deuda.paciente_nombre}</td>
                                <td>{deuda.concepto}</td>
                                <td>${parseFloat(deuda.monto).toFixed(2)}</td>
                                <td>${parseFloat(deuda.monto_pagado).toFixed(2)}</td>
                                <td className={`estado ${deuda.estado}`}>{deuda.estado}</td>
                                <td>{new Date(deuda.fecha).toLocaleDateString()}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {historialDeudas.length === 0 && <p className="mensaje-vacio">No hay deudas liquidadas en los últimos 7 días</p>}
            </div>

            {/* ========== SECCIÓN SERVICIOS (solo admin) ========== */}
            {esAdmin && (
                <>
                    <h2>📦 Catálogo de Servicios</h2>
                    <button onClick={() => setMostrarFormulario({ ...mostrarFormulario, servicio: !mostrarFormulario.servicio })}>
                        {mostrarFormulario.servicio ? 'Cancelar' : '+ Nuevo Servicio'}
                    </button>
                    {mostrarFormulario.servicio && (
                        <div className="form-card">
                            <h3>➕ Agregar Servicio</h3>
                            <form onSubmit={handleCrearServicio}>
                                <input type="text" placeholder="Nombre del servicio" value={formServicio.nombre} onChange={e => setFormServicio({ ...formServicio, nombre: e.target.value })} required />
                                <textarea placeholder="Descripción" value={formServicio.descripcion} onChange={e => setFormServicio({ ...formServicio, descripcion: e.target.value })} rows="2" />
                                <input type="number" step="0.01" placeholder="Precio" value={formServicio.precio} onChange={e => setFormServicio({ ...formServicio, precio: e.target.value })} required />
                                <button type="submit">Crear Servicio</button>
                            </form>
                        </div>
                    )}
                    <div className="table-container">
                        <h3>Lista de Servicios</h3>
                        <table className="tabla tabla-servicios">
                            <thead>
                                <tr>
                                    <th>Nombre</th>
                                    <th>Descripción</th>
                                    <th>Precio</th>
                                    <th>Estado</th>
                                    <th>Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                {serviciosPaginados.length === 0 ? (
                                    <tr><td colSpan="5">No hay servicios registrados</td></tr>
                                ) : (
                                    serviciosPaginados.map(servicio => (
                                        <tr key={servicio.id}>
                                            <td>{servicio.nombre}</td>
                                            <td>{servicio.descripcion}</td>
                                            <td>${parseFloat(servicio.precio).toFixed(2)}</td>
                                            <td className={servicio.activo ? 'estado confirmada' : 'estado cancelada'}>
                                                {servicio.activo ? 'Activo' : 'Inactivo'}
                                            </td>
                                            <td>
                                                <div className="acciones-botones">
                                                    {servicio.activo ? (
                                                        <button onClick={() => eliminarServicio(servicio.id)} title="Desactivar servicio">🗑️</button>
                                                    ) : (
                                                        <button onClick={() => activarServicio(servicio.id)} title="Reactivar servicio">🔄</button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </>
            )}

            {/* ========== SECCIÓN MÉDICOS ========== */}
            {esAdminOSecretaria && (
                <>
                    <h2>👨‍⚕️ Gestión de Médicos</h2>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px', flexWrap: 'wrap', gap: '10px' }}>
                        <input
                            type="text"
                            placeholder="🔍 Buscar médico por nombre..."
                            value={busquedaMedico}
                            onChange={(e) => {
                                setBusquedaMedico(e.target.value);
                                setPaginaMedicos(1);
                            }}
                            style={{ padding: '8px 12px', borderRadius: '5px', border: '1px solid #ddd', minWidth: '250px' }}
                        />
                        <button onClick={() => setMostrarFormulario({ ...mostrarFormulario, medico: !mostrarFormulario.medico })}>
                            {mostrarFormulario.medico ? 'Cancelar' : '+ Nuevo Médico'}
                        </button>
                    </div>

                    {mostrarFormulario.medico && (
                        <div className="form-card">
                            <h3>➕ Agregar Médico</h3>
                            <form onSubmit={handleCrearMedico}>
                                <input type="text" placeholder="Nombre completo" value={formMedico.nombre} onChange={e => setFormMedico({ ...formMedico, nombre: e.target.value })} required />
                                <input type="email" placeholder="Email" value={formMedico.email} onChange={e => setFormMedico({ ...formMedico, email: e.target.value })} required />
                                <input type="password" placeholder="Contraseña" value={formMedico.password} onChange={e => setFormMedico({ ...formMedico, password: e.target.value })} required />
                                <input type="text" placeholder="Especialidad" value={formMedico.especialidad} onChange={e => setFormMedico({ ...formMedico, especialidad: e.target.value })} />
                                <input type="text" placeholder="Cédula profesional" value={formMedico.cedula} onChange={e => setFormMedico({ ...formMedico, cedula: e.target.value })} />
                                <input type="text" placeholder="Teléfono" value={formMedico.telefono} onChange={e => setFormMedico({ ...formMedico, telefono: e.target.value })} />
                                <button type="submit">Crear Médico</button>
                            </form>
                        </div>
                    )}

                    <div className="table-container">
                        <h3>Lista de Médicos</h3>
                        <table className="tabla tabla-medicos">
                            <thead>
                                <tr>
                                    <th>Nombre</th>
                                    <th>Email</th>
                                    <th>Especialidad</th>
                                    <th>Teléfono</th>
                                    <th>Estado</th>
                                    <th>Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                {medicosPaginados.length === 0 ? <tr><td colSpan="6">No hay médicos registrados</td></tr> :
                                    medicosPaginados.map(medico => (
                                        <tr key={medico.id}>
                                            <td>{medico.nombre}</td>
                                            <td>{medico.email}</td>
                                            <td>{medico.especialidad || '-'}</td>
                                            <td>{medico.telefono || '-'}</td>
                                            <td className={medico.activo ? 'estado confirmada' : 'estado cancelada'}>
                                                {medico.activo ? 'Activo' : 'Inactivo'}
                                            </td>
                                            <td>
                                                <div className="acciones-botones">
                                                    <button onClick={() => abrirModalEditarMedico(medico)} title="Editar médico">✏️</button>
                                                    {medico.activo ? (
                                                        <button onClick={() => desactivarMedico(medico.id)} title="Desactivar médico">🗑️</button>
                                                    ) : (
                                                        <button onClick={() => activarMedico(medico.id)} title="Reactivar médico">🔄</button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                }
                            </tbody>
                        </table>
                        {totalPaginasMedicos > 1 && (
                            <div className="paginacion">
                                <button onClick={() => setPaginaMedicos(1)} disabled={paginaMedicos === 1}>«</button>
                                <button onClick={() => setPaginaMedicos(paginaMedicos - 1)} disabled={paginaMedicos === 1}>Anterior</button>
                                <span>Página {paginaMedicos} de {totalPaginasMedicos}</span>
                                <button onClick={() => setPaginaMedicos(paginaMedicos + 1)} disabled={paginaMedicos === totalPaginasMedicos}>Siguiente</button>
                                <button onClick={() => setPaginaMedicos(totalPaginasMedicos)} disabled={paginaMedicos === totalPaginasMedicos}>»</button>
                            </div>
                        )}
                    </div>
                </>
            )}

            {/* ========== SECCIÓN PACIENTES ========== */}
            <h2>👥 Gestión de Pacientes</h2>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px', flexWrap: 'wrap', gap: '10px' }}>
                <input
                    type="text"
                    placeholder="🔍 Buscar paciente por nombre..."
                    value={busquedaPaciente}
                    onChange={(e) => {
                        setBusquedaPaciente(e.target.value);
                        setPaginaPacientes(1);
                    }}
                    style={{ padding: '8px 12px', borderRadius: '5px', border: '1px solid #ddd', minWidth: '250px' }}
                />
                {esAdminOSecretaria && (
                    <button onClick={() => setMostrarFormulario({ ...mostrarFormulario, paciente: !mostrarFormulario.paciente })}>
                        {mostrarFormulario.paciente ? 'Cancelar' : '+ Nuevo Paciente'}
                    </button>
                )}
            </div>

            {mostrarFormulario.paciente && (
                <div className="form-card">
                    <h3>➕ Agregar Paciente</h3>
                    <form onSubmit={handleCrearPaciente}>
                        <input type="text" placeholder="Nombre completo" value={formPaciente.nombre} onChange={e => setFormPaciente({ ...formPaciente, nombre: e.target.value })} required />
                        <input type="email" placeholder="Email" value={formPaciente.email} onChange={e => setFormPaciente({ ...formPaciente, email: e.target.value })} />
                        <input type="text" placeholder="Teléfono" value={formPaciente.telefono} onChange={e => setFormPaciente({ ...formPaciente, telefono: e.target.value })} />
                        <input type="date" value={formPaciente.fecha_nacimiento} onChange={e => setFormPaciente({ ...formPaciente, fecha_nacimiento: e.target.value })} max={new Date().toISOString().split('T')[0]} />
                        <input type="text" placeholder="Dirección" value={formPaciente.direccion} onChange={e => setFormPaciente({ ...formPaciente, direccion: e.target.value })} />
                        <button type="submit">Crear Paciente</button>
                    </form>
                </div>
            )}

            <div className="table-container">
                <h3>Lista de Pacientes</h3>
                <table className="tabla tabla-pacientes">
                    <thead>
                        <tr>
                            <th>Nombre</th>
                            <th>Email</th>
                            <th>Teléfono</th>
                            <th>Fecha Nacimiento</th>
                            <th>Dirección</th>
                            <th>Estado</th>
                            {esAdmin && <th>Acciones</th>}
                        </tr>
                    </thead>
                    <tbody>
                        {pacientesPaginados.length === 0 ? <tr><td colSpan={esAdmin ? 7 : 6}>No hay pacientes registrados</td></tr> :
                            pacientesPaginados.map(paciente => (
                                <tr key={paciente.id}>
                                    <td>{paciente.nombre}</td>
                                    <td>{paciente.email || '-'}</td>
                                    <td>{paciente.telefono || '-'}</td>
                                    <td>{paciente.fecha_nacimiento ? new Date(paciente.fecha_nacimiento).toLocaleDateString() : '-'}</td>
                                    <td>{paciente.direccion || '-'}</td>
                                    <td className={paciente.activo ? 'estado confirmada' : 'estado cancelada'}>
                                        {paciente.activo ? 'Activo' : 'Inactivo'}
                                    </td>
                                    {esAdmin && (
                                        <td>
                                            <div className="acciones-botones">
                                                <button onClick={() => abrirModalEditarPaciente(paciente)} title="Editar paciente">✏️</button>
                                                {paciente.activo ? (
                                                    <button onClick={() => desactivarPaciente(paciente.id)} title="Desactivar paciente">🗑️</button>
                                                ) : (
                                                    <button onClick={() => activarPaciente(paciente.id)} title="Reactivar paciente">🔄</button>
                                                )}
                                            </div>
                                        </td>
                                    )}
                                </tr>
                            ))
                        }
                    </tbody>
                </table>
                {totalPaginasPacientes > 1 && (
                    <div className="paginacion">
                        <button onClick={() => setPaginaPacientes(1)} disabled={paginaPacientes === 1}>«</button>
                        <button onClick={() => setPaginaPacientes(paginaPacientes - 1)} disabled={paginaPacientes === 1}>Anterior</button>
                        <span>Página {paginaPacientes} de {totalPaginasPacientes}</span>
                        <button onClick={() => setPaginaPacientes(paginaPacientes + 1)} disabled={paginaPacientes === totalPaginasPacientes}>Siguiente</button>
                        <button onClick={() => setPaginaPacientes(totalPaginasPacientes)} disabled={paginaPacientes === totalPaginasPacientes}>»</button>
                    </div>
                )}
            </div>

            {/* Modal de Abono */}
            {showModalAbono && (
                <div className="modal-overlay" onClick={() => setShowModalAbono(false)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <h3>💰 Registrar Abono</h3>
                        <p><strong>Paciente:</strong> {deudaSeleccionada?.paciente_nombre}</p>
                        <p><strong>Saldo pendiente:</strong> ${parseFloat(deudaSeleccionada?.saldo_pendiente || 0).toFixed(2)}</p>
                        <form onSubmit={registrarAbono}>
                            <input type="number" step="0.01" placeholder="Monto a pagar" value={formAbono.monto} onChange={e => setFormAbono({ ...formAbono, monto: e.target.value })} required />
                            <select value={formAbono.metodo_pago} onChange={e => setFormAbono({ ...formAbono, metodo_pago: e.target.value })}>
                                <option value="efectivo">Efectivo</option>
                                <option value="tarjeta">Tarjeta</option>
                                <option value="transferencia">Transferencia</option>
                            </select>
                            <button type="submit">Registrar Abono</button>
                            <button type="button" onClick={() => setShowModalAbono(false)} style={{ background: '#6c757d', marginTop: '10px' }}>Cancelar</button>
                        </form>
                    </div>
                </div>
            )}

            {/* Modal de Editar Deuda */}
            {showModalEditarDeuda && (
                <div className="modal-overlay" onClick={() => setShowModalEditarDeuda(false)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '700px' }}>
                        <h3>✏️ Editar Deuda</h3>
                        <p><strong>Paciente:</strong> {deudaSeleccionada?.paciente_nombre}</p>
                        <p><strong>Deuda actual:</strong> ${parseFloat(deudaSeleccionada?.monto || 0).toFixed(2)}</p>
                        <p><strong>Saldo pendiente:</strong> ${parseFloat(deudaSeleccionada?.saldo_pendiente || 0).toFixed(2)}</p>

                        <hr />

                        <h4>Agregar nuevo servicio</h4>
                        <div style={{ display: 'flex', gap: '10px', marginBottom: '15px', flexWrap: 'wrap' }}>
                            <select
                                value={servicioSeleccionado}
                                onChange={e => setServicioSeleccionado(e.target.value)}
                                style={{ flex: 2, padding: '8px' }}
                            >
                                <option value="">Seleccionar servicio...</option>
                                {serviciosDisponibles.map(s => (
                                    <option key={s.id} value={s.id}>{s.nombre} - ${parseFloat(s.precio).toFixed(2)}</option>
                                ))}
                            </select>
                            <input
                                type="number"
                                min="1"
                                value={cantidadSeleccionada}
                                onChange={e => setCantidadSeleccionada(parseInt(e.target.value) || 1)}
                                style={{ width: '80px', padding: '8px' }}
                            />
                            <button type="button" onClick={agregarServicioATemporal} style={{ background: '#28a745' }}>Agregar</button>
                        </div>

                        {nuevosServicios.length > 0 && (
                            <>
                                <h4>Servicios a agregar:</h4>
                                {nuevosServicios.map((s, idx) => (
                                    <div key={idx} style={{ display: 'flex', gap: '10px', alignItems: 'center', marginBottom: '10px' }}>
                                        <span style={{ flex: 2 }}>{s.servicio_nombre}</span>
                                        <span>x{s.cantidad}</span>
                                        <span>${s.precio_unitario.toFixed(2)} c/u</span>
                                        <span><strong>${s.subtotal.toFixed(2)}</strong></span>
                                        <button onClick={() => eliminarServicioTemporal(idx)} style={{ background: '#dc3545', padding: '5px 10px' }}>❌</button>
                                    </div>
                                ))}
                                <p><strong>Total a agregar: ${nuevosServicios.reduce((sum, s) => sum + s.subtotal, 0).toFixed(2)}</strong></p>
                            </>
                        )}

                        <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
                            <button onClick={guardarEdicionDeuda} style={{ background: '#28a745' }}>Guardar Cambios</button>
                            <button onClick={() => setShowModalEditarDeuda(false)} style={{ background: '#6c757d' }}>Cancelar</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal de Edición de Médico */}
            {
                showModalMedico && (
                    <div className="modal-overlay" onClick={() => setShowModalMedico(false)}>
                        <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                            <h3>✏️ Editar Médico</h3>
                            <form onSubmit={actualizarMedico}>
                                <input type="text" placeholder="Nombre completo" value={formMedico.nombre} onChange={e => setFormMedico({ ...formMedico, nombre: e.target.value })} required />
                                <input type="email" placeholder="Email" value={formMedico.email} onChange={e => setFormMedico({ ...formMedico, email: e.target.value })} required />
                                <input type="password" placeholder="Nueva contraseña (dejar vacío para no cambiar)" value={formMedico.password} onChange={e => setFormMedico({ ...formMedico, password: e.target.value })} />
                                <input type="text" placeholder="Especialidad" value={formMedico.especialidad} onChange={e => setFormMedico({ ...formMedico, especialidad: e.target.value })} />
                                <input type="text" placeholder="Cédula profesional" value={formMedico.cedula} onChange={e => setFormMedico({ ...formMedico, cedula: e.target.value })} />
                                <input type="text" placeholder="Teléfono" value={formMedico.telefono} onChange={e => setFormMedico({ ...formMedico, telefono: e.target.value })} />

                                <select value={formMedico.activo ? 'true' : 'false'} onChange={e => setFormMedico({ ...formMedico, activo: e.target.value === 'true' })}>
                                    <option value="true">Activo</option>
                                    <option value="false">Inactivo</option>
                                </select>

                                <button type="submit">Guardar Cambios</button>
                                <button type="button" onClick={() => setShowModalMedico(false)} style={{ background: '#6c757d', marginTop: '10px' }}>Cancelar</button>
                            </form>
                        </div>
                    </div>
                )
            }

            {/* Modal de Edición de Paciente */}
            {
                showModalPaciente && (
                    <div className="modal-overlay" onClick={() => setShowModalPaciente(false)}>
                        <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                            <h3>✏️ Editar Paciente</h3>
                            <form onSubmit={actualizarPaciente}>
                                <input type="text" placeholder="Nombre completo" value={formPaciente.nombre} onChange={e => setFormPaciente({ ...formPaciente, nombre: e.target.value })} required />
                                <input type="email" placeholder="Email" value={formPaciente.email} onChange={e => setFormPaciente({ ...formPaciente, email: e.target.value })} />
                                <input type="text" placeholder="Teléfono" value={formPaciente.telefono} onChange={e => setFormPaciente({ ...formPaciente, telefono: e.target.value })} />
                                <input type="date" value={formPaciente.fecha_nacimiento} onChange={e => setFormPaciente({ ...formPaciente, fecha_nacimiento: e.target.value })} max={new Date().toISOString().split('T')[0]} />
                                <input type="text" placeholder="Dirección" value={formPaciente.direccion} onChange={e => setFormPaciente({ ...formPaciente, direccion: e.target.value })} />

                                {esAdmin && (
                                    <select value={formPaciente.activo ? 'true' : 'false'} onChange={e => setFormPaciente({ ...formPaciente, activo: e.target.value === 'true' })}>
                                        <option value="true">Activo</option>
                                        <option value="false">Inactivo</option>
                                    </select>
                                )}

                                <button type="submit">Guardar Cambios</button>
                                <button type="button" onClick={() => setShowModalPaciente(false)} style={{ background: '#6c757d', marginTop: '10px' }}>Cancelar</button>
                            </form>
                        </div>
                    </div>
                )
            }
        </div >
    );
}

export default Dashboard;