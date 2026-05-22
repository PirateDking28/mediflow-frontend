import React, { useEffect, useState } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import './CalendarioCitas.css';

function CalendarioCitas({ citas }) {
    const [eventos, setEventos] = useState([]);

    useEffect(() => {
        const eventosCalendario = citas.map(cita => {
            // Crear fecha sin conversión de zona horaria
            const fecha = new Date(cita.fecha_hora);
            const inicio = new Date(
                fecha.getFullYear(),
                fecha.getMonth(),
                fecha.getDate(),
                fecha.getHours(),
                fecha.getMinutes()
            );
            const fin = new Date(inicio.getTime() + (cita.duracion || 30) * 60000);
            
            return {
                id: cita.id,
                title: cita.paciente_nombre + ' - ' + cita.medico_nombre,
                start: inicio,
                end: fin,
                backgroundColor: cita.estado_cita === 'cancelada' ? '#dc3545' : '#28a745',
                extendedProps: {
                    paciente: cita.paciente_nombre,
                    medico: cita.medico_nombre,
                    duracion: cita.duracion
                }
            };
        });
        setEventos(eventosCalendario);
    }, [citas]);

    const handleEventClick = (info) => {
        const props = info.event.extendedProps;
        alert('📋 Detalles de la cita:\n\nPaciente: ' + props.paciente + '\nMédico: ' + props.medico + '\nDuración: ' + (props.duracion || 30) + ' min');
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
                selectable={false}
                dayMaxEvents={true}
                weekends={true}
                events={eventos}
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