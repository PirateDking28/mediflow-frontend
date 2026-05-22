import React, { useEffect, useState } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import api from '../services/api';
import './CalendarioCitas.css';

function CalendarioCitas({ citas, recargarCitas }) {
    // Función para ajustar la hora local sin conversión UTC
    const ajustarHoraLocal = (fechaISO) => {
        // La fecha viene como "2026-05-22T18:00:00.000Z"
        // Extraer la parte de fecha y hora directamente
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
            // Usar la función para ajustar hora local
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
        // Mostrar detalles de la cita (solo información, no edición)
        alert(`📋 Detalles de la cita:\n\nPaciente: ${info.event.extendedProps.paciente}\nMédico: ${info.event.extendedProps.medicano}\nDuración: ${info.event.extendedProps.duracion || 30} min\nEstado: ${info.event.backgroundColor === '#28a745' ? 'Activa' : 'Cancelada'}`);
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
                selectable={false}        // ← Deshabilitar selección de fechas
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