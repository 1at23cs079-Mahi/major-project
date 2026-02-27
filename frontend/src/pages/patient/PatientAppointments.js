import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useWeb3 } from '../../context/Web3Context';
import api from '../../services/api';

function PatientAppointments() {
    const { user } = useAuth();
    const { account } = useWeb3();
    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchAppointments();
    }, []);

    const fetchAppointments = async () => {
        try {
            const response = await api.get('/appointments/patient');
            setAppointments(response.data.appointments || []);
        } catch (err) {
            setError('Failed to load appointments');
        } finally {
            setLoading(false);
        }
    };

    const cancelAppointment = async (id) => {
        if (!window.confirm('Are you sure you want to cancel this appointment? This action will be logged.')) return;

        try {
            await api.delete(`/appointments/${id}/cancel`, {
                data: { cancellation_reason: 'Patient cancelled' }
            });
            fetchAppointments();
        } catch (err) {
            setError('Failed to cancel appointment');
        }
    };

    const getStatusStyle = (status) => {
        switch (status.toLowerCase()) {
            case 'completed': return { bg: 'rgba(76, 175, 80, 0.1)', color: '#4caf50', border: '1px solid #4caf50' };
            case 'pending': return { bg: 'rgba(255, 152, 0, 0.1)', color: '#ff9800', border: '1px solid #ff9800' };
            case 'cancelled': return { bg: 'rgba(244, 67, 54, 0.1)', color: '#f44336', border: '1px solid #f44336' };
            default: return { bg: 'rgba(255, 255, 255, 0.1)', color: '#fff', border: '1px solid rgba(255,255,255,0.2)' };
        }
    };

    if (loading) return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
            <div className="loader"></div>
        </div>
    );

    return (
        <div className="patient-appointments-container" style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem' }}>
                <div>
                    <h1 style={{ fontSize: '2.5rem', fontWeight: '800', marginBottom: '0.5rem', background: 'linear-gradient(45deg, #fff, var(--primary))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                        My Appointments
                    </h1>
                    <p style={{ color: 'rgba(255,255,255,0.7)' }}>Manage your scheduled visits and medical consultations.</p>
                </div>
                <button className="btn-primary" style={{ padding: '0.8rem 1.5rem', borderRadius: '12px', fontWeight: 'bold' }}>
                    + Book New Appointment
                </button>
            </div>

            {error && <div className="alert alert-error" style={{ marginBottom: '2rem' }}>{error}</div>}

            {appointments.length === 0 ? (
                <div className="glass-card" style={{ padding: '4rem', textAlign: 'center', borderRadius: '24px' }}>
                    <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>📅</div>
                    <h3>No Appointments Scheduled</h3>
                    <p style={{ color: 'rgba(255,255,255,0.6)' }}>Browse doctors and schedule your first consultation.</p>
                </div>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '2rem' }}>
                    {appointments.map(apt => {
                        const style = getStatusStyle(apt.status);
                        return (
                            <div key={apt.id} className="glass-card hvr-grow" style={{
                                padding: '2rem',
                                borderRadius: '24px',
                                border: '1px solid rgba(255,255,255,0.1)',
                                position: 'relative'
                            }}>
                                <div style={{
                                    position: 'absolute',
                                    top: '1.5rem',
                                    right: '1.5rem',
                                    padding: '0.4rem 0.8rem',
                                    borderRadius: '50px',
                                    fontSize: '0.75rem',
                                    fontWeight: 'bold',
                                    backgroundColor: style.bg,
                                    color: style.color,
                                    border: style.border,
                                    textTransform: 'uppercase'
                                }}>
                                    {apt.status}
                                </div>

                                <div style={{ marginBottom: '1.5rem' }}>
                                    <div style={{ fontSize: '0.8rem', color: 'var(--primary)', fontWeight: 'bold', marginBottom: '0.4rem' }}>DOCTOR</div>
                                    <div style={{ display: 'flex', alignItems: 'center' }}>
                                        <div style={{
                                            width: '45px',
                                            height: '45px',
                                            borderRadius: '50%',
                                            background: 'rgba(255,255,255,0.1)',
                                            display: 'flex',
                                            justifyContent: 'center',
                                            alignItems: 'center',
                                            marginRight: '1rem',
                                            fontSize: '1.2rem'
                                        }}>
                                            👨‍⚕️
                                        </div>
                                        <div>
                                            <div style={{ fontWeight: 'bold', fontSize: '1.1rem' }}>Dr. {apt.doctor?.first_name} {apt.doctor?.last_name}</div>
                                            <div style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.6)' }}>{apt.doctor?.specialization || 'General Physician'}</div>
                                        </div>
                                    </div>
                                </div>

                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
                                    <div>
                                        <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.5)', marginBottom: '0.2rem' }}>DATE</div>
                                        <div style={{ fontWeight: '600' }}>{new Date(apt.appointment_date).toLocaleDateString()}</div>
                                    </div>
                                    <div>
                                        <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.5)', marginBottom: '0.2rem' }}>TIME</div>
                                        <div style={{ fontWeight: '600' }}>{apt.appointment_time}</div>
                                    </div>
                                </div>

                                <div style={{ pt: '1.5rem', borderTop: '1px solid rgba(255,255,255,0.1)', display: 'flex', justifyContent: 'flex-end' }}>
                                    {apt.status.toLowerCase() === 'pending' && (
                                        <button
                                            onClick={() => cancelAppointment(apt.id)}
                                            style={{
                                                background: 'transparent',
                                                color: '#f44336',
                                                border: '1px solid #f44336',
                                                padding: '0.5rem 1rem',
                                                borderRadius: '8px',
                                                cursor: 'pointer',
                                                fontSize: '0.85rem',
                                                transition: 'all 0.3s ease'
                                            }}
                                            onMouseOver={(e) => { e.target.style.background = 'rgba(244, 67, 54, 0.1)' }}
                                            onMouseOut={(e) => { e.target.style.background = 'transparent' }}
                                        >
                                            Cancel Appointment
                                        </button>
                                    )}
                                    {apt.status.toLowerCase() === 'completed' && (
                                        <button
                                            className="btn-link"
                                            style={{ fontSize: '0.85rem', color: 'var(--primary)' }}
                                            onClick={() => {/* Navigate to records or prescriptions */ }}
                                        >
                                            View Summary →
                                        </button>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}

export default PatientAppointments;

