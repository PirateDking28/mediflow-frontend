import React, { useEffect, useState } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import api from '../services/api';
import './CalendarioCitas.css';

function CalendarioCitas({ citas, recargarCitas }) {
    const [eventos, setEventos] = useState([]);

    useEffect(() => {
        // Convertir citas a eventos del calendario
        const eventosCalendario = citas.map(cita => ({
            id: cita.id,
            title: `${cita.paciente_nombre} - ${cita.medico_nombre}`,
            start: cita.fecha_hora,
            end: new Date(new Date(cita.fecha_hora).getTime() + (cita.duracion || 30) * 60000).toISOString(),
            backgroundColor: cita.estado_cita === 'cancelada' ? '#dc3545' : '#28a745',
            extendedProps: {
                paciente: cita.paciente_nombre,
                medico: cita.medico_nombre,
                notas: cita.notas
            }
        }));
        setEventos(eventosCalendario);
    }, [citas]);

    const handleDateClick = (info) => {
        // Abrir modal para crear cita en la fecha/hora seleccionada
        alert(`Crear cita para: ${info.dateStr}`);
        // Aquí se abriría el formulario de cita
    };

    const handleEventClick = (info) => {
        // Mostrar detalles de la cita
        alert(`Cita: ${info.event.title}\nPaciente: ${info.event.extendedProps.paciente}\nMédico: ${info.event.extendedProps.medico}`);
    };

    return (
        <div className="calendario-container">
            <FullCalendar
                plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
                headerToolbar={{
                    left: 'prev,next today',
                    center: 'title',
                    right: 'dayGridMonth,timeGridWeek,timeGridDay'
                }}
                initialView="timeGridDay"
                editable={false}
                selectable={true}
                selectMirror={true}
                dayMaxEvents={true}
                weekends={true}
                events={eventos}
                dateClick={handleDateClick}
                eventClick={handleEventClick}
                locale="es"
                buttonText={{
                    today: 'Hoy',
                    month: 'Mes',
                    week: 'Semana',
                    day: 'Día'
                }}
            />
        </div>
    );
}

export default CalendarioCitas;