import React, { useState, useEffect } from 'react';
import api from '../../services/api';

function DoctorAppointmentCalendar() {
    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchAppointments();
    }, []);

    const fetchAppointments = async () => {
        try {
            const response = await api.get('/appointments/doctor/calendar');
            setAppointments(response.data.appointments);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const acceptAppointment = async (id) => {
        try {
            await api.put(`/appointments/${id}/accept`);
            fetchAppointments();
        } catch (err) {
            alert('Failed to accept appointment');
        }
    };

    const rejectAppointment = async (id) => {
        const reason = prompt('Reason for rejection:');
        if (!reason) return;

        try {
            await api.put(`/appointments/${id}/reject`, { reason });
            fetchAppointments();
        } catch (err) {
            alert('Failed to reject appointment');
        }
    };

    if (loading) return <div>Loading...</div>;

    return (
        <div className="container">
            <h1>Appointment Calendar</h1>

            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                    <tr style={{ borderBottom: '1px solid #ccc' }}>
                        <th style={{ padding: '10px', textAlign: 'left' }}>Date</th>
                        <th style={{ padding: '10px', textAlign: 'left' }}>Time</th>
                        <th style={{ padding: '10px', textAlign: 'left' }}>Patient</th>
                        <th style={{ padding: '10px', textAlign: 'left' }}>Reason</th>
                        <th style={{ padding: '10px', textAlign: 'left' }}>Status</th>
                        <th style={{ padding: '10px', textAlign: 'left' }}>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {appointments.map(apt => (
                        <tr key={apt.id} style={{ borderBottom: '1px solid #eee' }}>
                            <td style={{ padding: '10px' }}>{apt.appointment_date}</td>
                            <td style={{ padding: '10px' }}>{apt.appointment_time}</td>
                            <td style={{ padding: '10px' }}>
                                {apt.patient?.first_name} {apt.patient?.last_name}
                            </td>
                            <td style={{ padding: '10px' }}>{apt.reason}</td>
                            <td style={{ padding: '10px' }}>{apt.status}</td>
                            <td style={{ padding: '10px' }}>
                                {apt.status === 'pending' && (
                                    <>
                                        <button onClick={() => acceptAppointment(apt.id)}>Accept</button>
                                        <button onClick={() => rejectAppointment(apt.id)}>Reject</button>
                                    </>
                                )}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

export default DoctorAppointmentCalendar;
