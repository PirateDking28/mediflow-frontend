import React, { useEffect, useState } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import './CalendarioCitas.css';

function CalendarioCitas({ citas, recargarCitas }) {
    const [eventos, setEventos] = useState([]);

    // Función para ajustar la hora local sin conversión UTC
    const ajustarHoraLocal = (fechaISO) => {
        const fecha = new Date(fechaISO);
        const año = fecha.getFullYear();
        const mes = fecha.getMonth();
        const dia = fecha.getDate();
        const hora = fecha.getHours();
        const minutos = fecha.getMinutes();

        // Crear fecha en zona horaria local sin conversión
        return new Date(año, mes, dia, hora, minutos);
    };

    useEffect(() => {
        const eventosCalendario = citas.map(cita => {
            const inicio = ajustarHoraLocal(cita.fecha_hora);
            const fin = new Date(inicio.getTime() + (cita.duracion || 30) * 60000);

            return {
                id: cita.id,
                title: `${cita.paciente_nombre} - ${cita.medico_nombre}`,
                start: inicio,
                end: fin,
                backgroundColor: cita.estado_cita === 'cancelada' ? '#dc3545' : '#28a745',
                extendedProps: {
                    paciente: cita.paciente_nombre,
                    medico: cita.medico_nombre,
                    duracion: cita.duracion,
                    notas: cita.notas
                }
            };
        });
        setEventos(eventosCalendario);
    }, [citas]);

    const handleEventClick = (info) => {
        alert(`📋 Detalles de la cita:\n\nPaciente: ${info.event.extendedProps.paciente}\nMédico: ${info.event.extendedProps.medico}\nDuración: ${info.event.extendedProps.duracion || 30} min`);
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

export default CalendarioCitas;s