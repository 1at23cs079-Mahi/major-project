import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useWeb3 } from '../../context/Web3Context';

function Emergency() {
    const navigate = useNavigate();
    const { user } = useAuth();
    const { account } = useWeb3();
    const [sosActive, setSosActive] = useState(false);
    const [msg, setMsg] = useState('');

    const handleSOS = () => {
        setSosActive(true);
        setMsg('Emergency Alert Broadcasted! Medical responders are being notified...');

        // Simulate blockchain event for emergency access
        console.log('Broadcasting Emergency SOS to chain...');

        setTimeout(() => {
            setSosActive(false);
            setMsg('Emergency contacts have been notified via SMS/Email.');
        }, 5000);
    };

    const emergencyContacts = [
        { name: 'Dr. Sarah Wilson', relation: 'Primary Doctor', phone: '+1 234 567 8901' },
        { name: 'John Doe', relation: 'Family (Brother)', phone: '+1 234 567 8902' }
    ];

    return (
        <div className="emergency-container" style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto' }}>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '2rem' }}>
                <button
                    className="btn-outline"
                    onClick={() => navigate('/patient/dashboard')}
                    style={{ marginRight: '1.5rem', padding: '0.5rem 1rem' }}
                >
                    ← Back
                </button>
                <h1 style={{ margin: 0, color: '#ff4444', fontWeight: '800' }}>Emergency SOS</h1>
            </div>

            <div className="glass-card" style={{
                padding: '3rem',
                textAlign: 'center',
                borderRadius: '32px',
                border: '1px solid rgba(255, 68, 68, 0.2)',
                background: 'rgba(255, 68, 68, 0.05)',
                marginBottom: '2rem'
            }}>
                <div style={{ position: 'relative', width: '250px', height: '250px', margin: '0 auto 2rem' }}>
                    {/* SOS Pulse Effect */}
                    <div className={sosActive ? "pulse-animation" : ""} style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        borderRadius: '50%',
                        backgroundColor: 'rgba(255, 68, 68, 0.3)',
                        zIndex: 0
                    }}></div>

                    <button
                        onClick={handleSOS}
                        disabled={sosActive}
                        className="sos-btn"
                        style={{
                            position: 'relative',
                            width: '200px',
                            height: '200px',
                            borderRadius: '50%',
                            border: 'none',
                            background: 'linear-gradient(135deg, #ff4444, #cc0000)',
                            color: 'white',
                            fontSize: '2.5rem',
                            fontWeight: 'bold',
                            cursor: 'pointer',
                            boxShadow: '0 10px 40px rgba(255, 68, 68, 0.5)',
                            top: '25px',
                            zIndex: 1,
                            transition: 'all 0.3s ease'
                        }}
                    >
                        {sosActive ? 'SENDING...' : 'SOS'}
                    </button>
                </div>

                <h2 style={{ marginBottom: '1rem' }}>{sosActive ? 'Emergency Active' : 'Emergency Assistance'}</h2>
                <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '1.1rem' }}>
                    Press the button above to instantly notify your emergency contacts and broadcast your medical location on the network.
                </p>

                {msg && (
                    <div className="alert" style={{
                        marginTop: '2rem',
                        background: 'rgba(76, 175, 80, 0.1)',
                        color: '#4caf50',
                        border: '1px solid #4caf50',
                        borderRadius: '12px'
                    }}>
                        {msg}
                    </div>
                )}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                <div className="glass-card" style={{ padding: '2rem', borderRadius: '24px' }}>
                    <h3 style={{ marginBottom: '1.5rem', fontSize: '1.2rem' }}>Emergency Contacts</h3>
                    {emergencyContacts.map((contact, idx) => (
                        <div key={idx} style={{
                            padding: '1rem',
                            background: 'rgba(255,255,255,0.05)',
                            borderRadius: '16px',
                            marginBottom: '1rem',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center'
                        }}>
                            <div>
                                <div style={{ fontWeight: 'bold' }}>{contact.name}</div>
                                <div style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.6)' }}>{contact.relation}</div>
                            </div>
                            <div style={{ color: 'var(--primary)', fontWeight: 'bold' }}>{contact.phone}</div>
                        </div>
                    ))}
                    <button className="btn-link" style={{ width: '100%', textAlign: 'center', marginTop: '0.5rem' }}>
                        + Add New Contact
                    </button>
                </div>

                <div className="glass-card" style={{ padding: '2rem', borderRadius: '24px' }}>
                    <h3 style={{ marginBottom: '1.5rem', fontSize: '1.2rem' }}>Sovereign Access</h3>
                    <div style={{
                        padding: '1.5rem',
                        background: 'rgba(var(--primary-rgb), 0.1)',
                        borderRadius: '16px',
                        border: '1px solid rgba(var(--primary-rgb), 0.3)',
                        marginBottom: '1rem'
                    }}>
                        <p style={{ fontSize: '0.9rem', margin: 0, lineHeight: '1.5' }}>
                            <strong>Smart Consent:</strong> Your medical records will be temporarily accessible to verified emergency responders in your vicinity if SOS is triggered.
                        </p>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', color: 'rgba(255,255,255,0.6)', fontSize: '0.85rem' }}>
                        <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#4caf50' }}></div>
                        On-chain emergency protocol active
                    </div>
                </div>
            </div>

            <style>{`
                .pulse-animation {
                    animation: pulse-ring 2s cubic-bezier(0.455, 0.03, 0.515, 0.955) infinite;
                }
                @keyframes pulse-ring {
                    0% { transform: scale(0.8); opacity: 0.5; }
                    50% { transform: scale(1.2); opacity: 0.3; }
                    100% { transform: scale(1.5); opacity: 0; }
                }
                .sos-btn:active {
                    transform: scale(0.95);
                }
            `}</style>
        </div>
    );
}

export default Emergency;

