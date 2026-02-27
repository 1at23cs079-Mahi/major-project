import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import { useWeb3 } from '../../context/Web3Context';
import BlockchainBadge from '../../components/BlockchainBadge';
import { dashboardAPI, patientAccessAPI } from '../../services/api';

function PatientDashboard() {
    const { user, logout } = useAuth();
    const { account, connectWallet, isConnected } = useWeb3();
    const navigate = useNavigate();
    const [stats, setStats] = useState({
        appointments: 0,
        prescriptions: 0,
        records: 0,
        consents: 0
    });
    const [dashboardData, setDashboardData] = useState(null);
    const [uniquePatientId, setUniquePatientId] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDashboard = async () => {
            try {
                // Fetch dynamic dashboard data from backend
                const response = await dashboardAPI.getPatientDashboard();
                setDashboardData(response.data);
                
                setStats({
                    appointments: response.data.upcomingAppointments?.length || 0,
                    prescriptions: response.data.activePrescriptions?.length || 0,
                    records: response.data.recentRecords?.length || 0,
                    consents: response.data.activeConsents?.length || 0
                });
                
                setUniquePatientId(response.data.patientInfo?.unique_patient_id);
            } catch (err) {
                console.error("Failed to fetch dashboard", err);
            } finally {
                setLoading(false);
            }
        };

        fetchDashboard();
    }, []);

    const handleInitializeId = async () => {
        try {
            const response = await patientAccessAPI.initializePatientId();
            setUniquePatientId(response.data.uniquePatientId);
            alert('Your unique patient ID has been generated!');
        } catch (err) {
            console.error("Failed to initialize patient ID", err);
            alert('Failed to generate unique ID');
        }
    };

    const dashboardCards = [
        {
            title: 'Book Appointment',
            desc: 'Schedule a visit with your preferred doctor.',
            icon: '📅',
            link: '/patient/appointments',
            color: 'var(--primary)',
            btnClass: 'btn-primary'
        },
        {
            title: 'My Prescriptions',
            desc: 'View active prescriptions and dosage history.',
            icon: '💊',
            link: '/patient/prescriptions',
            color: 'var(--secondary)',
            btnClass: 'btn-secondary',
            onChain: true
        },
        {
            title: 'Medical Vault',
            desc: 'Secure access to your immutable health records.',
            icon: '🔒',
            link: '/patient/medical-records',
            color: '#9b59b6',
            btnClass: 'btn-primary',
            onChain: true
        },
        {
            title: 'Family Health',
            desc: 'Manage records for your dependents.',
            icon: '👨‍👩‍👧‍👦',
            link: '/patient/family',
            color: '#e67e22',
            btnClass: 'btn-outline'
        },
        {
            title: 'Digital Health Card',
            desc: 'Your emergency health QR code.',
            icon: '💳',
            link: '/patient/health-card',
            color: '#1abc9c',
            btnClass: 'btn-primary'
        },
        {
            title: 'Sovereign Consents',
            desc: 'Control who accesses your data.',
            icon: '🛡️',
            link: '/patient/consent',
            color: '#34495e',
            btnClass: 'btn-secondary',
            onChain: true
        },
        {
            title: 'Emergency SOS',
            desc: 'Immediate assistance and alert system.',
            icon: '🚨',
            link: '/patient/emergency',
            color: 'var(--error)',
            btnClass: 'btn-danger'
        },
        {
            title: 'On-Chain Verify',
            desc: 'Validate record integrity on blockchain.',
            icon: '⛓️',
            link: '/patient/verify',
            color: '#f39c12',
            btnClass: 'btn-primary',
            onChain: true
        }
    ];

    return (
        <div style={{ minHeight: '100vh', background: 'var(--bg-primary)' }}>
            <nav className="navbar" style={{ backdropFilter: 'blur(10px)', sticky: 'top', zIndex: 100 }}>
                <div className="container navbar-content">
                    <h1 className="navbar-brand" style={{ background: 'linear-gradient(45deg, var(--primary), var(--secondary))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                        🏥 Healthcare Hub
                    </h1>
                    <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                        {isConnected ? (
                            <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem',
                                padding: '0.5rem 1rem',
                                background: 'rgba(52, 152, 219, 0.1)',
                                borderRadius: '12px',
                                border: '1px solid var(--primary)'
                            }}>
                                <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#2ecc71' }}></span>
                                <span style={{ fontSize: '0.85rem', fontWeight: '600' }}>{account.substring(0, 6)}...{account.substring(account.length - 4)}</span>
                            </div>
                        ) : (
                            <button onClick={connectWallet} className="btn btn-outline" style={{ borderRadius: '12px' }}>
                                🦊 Connect Web3
                            </button>
                        )}
                        <button onClick={logout} className="btn" style={{ background: 'rgba(231, 76, 60, 0.1)', color: 'var(--error)', borderRadius: '12px' }}>Logout</button>
                    </div>
                </div>
            </nav>

            <div className="container" style={{ padding: '3rem 1rem' }}>
                <div className="fade-in">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '2.5rem' }}>
                        <div>
                            <h1 style={{ fontSize: '3rem', fontWeight: '800', marginBottom: '0.5rem', letterSpacing: '-1px' }}>
                                Welcome, <span style={{ color: 'var(--primary)' }}>{user?.profile?.first_name || 'Patient'}</span>
                            </h1>
                            <p style={{ color: 'var(--text-secondary)', fontSize: '1.2rem' }}>
                                Your sovereign health dashboard is ready.
                            </p>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '0.25rem' }}>Network Status</p>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: isConnected ? 'var(--secondary)' : 'var(--text-muted)', fontWeight: '700' }}>
                                {isConnected ? '● Mainnet Verified' : '○ Not Connected'}
                            </div>
                        </div>
                    </div>

                    {/* Stats Section */}
                    <div className="card" style={{ background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', padding: '2rem', marginBottom: '3rem' }}>
                        <div className="grid grid-4">
                            <div style={{ textAlign: 'center' }}>
                                <p style={{ color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Appointments</p>
                                <h2 style={{ fontSize: '2.5rem', fontWeight: '800' }}>{loading ? '...' : stats.appointments}</h2>
                            </div>
                            <div style={{ textAlign: 'center', borderLeft: '1px solid var(--glass-border)' }}>
                                <p style={{ color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Prescriptions</p>
                                <h2 style={{ fontSize: '2.5rem', fontWeight: '800', color: 'var(--secondary)' }}>{loading ? '...' : stats.prescriptions}</h2>
                            </div>
                            <div style={{ textAlign: 'center', borderLeft: '1px solid var(--glass-border)' }}>
                                <p style={{ color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Medical Reports</p>
                                <h2 style={{ fontSize: '2.5rem', fontWeight: '800', color: 'var(--primary)' }}>{loading ? '...' : stats.records}</h2>
                            </div>
                            <div style={{ textAlign: 'center', borderLeft: '1px solid var(--glass-border)' }}>
                                <p style={{ color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Active Consents</p>
                                <h2 style={{ fontSize: '2.5rem', fontWeight: '800', color: '#f39c12' }}>{loading ? '...' : stats.consents}</h2>
                            </div>
                        </div>
                    </div>

                    {/* Main Features Grid */}
                    <h2 style={{ marginBottom: '2rem', fontWeight: '700' }}>Health Services & Blockchain Hub</h2>
                    <div className="grid grid-4">
                        {dashboardCards.map((card, idx) => (
                            <div
                                key={idx}
                                className="card hvr-grow"
                                style={{
                                    display: 'flex',
                                    flexDirection: 'column',
                                    justifyContent: 'space-between',
                                    height: '100%',
                                    position: 'relative',
                                    overflow: 'hidden',
                                    transition: 'transform 0.3s ease, box-shadow 0.3s ease'
                                }}
                            >
                                <div style={{ fontSize: '3rem', marginBottom: '1.5rem' }}>{card.icon}</div>
                                <div>
                                    <h3 style={{ fontSize: '1.4rem', fontWeight: '700', marginBottom: '0.75rem' }}>{card.title}</h3>
                                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', marginBottom: '1.5rem', lineHeight: '1.5' }}>
                                        {card.desc}
                                    </p>
                                </div>
                                <div>
                                    {card.onChain && <BlockchainBadge verified={true} />}
                                    <button
                                        onClick={() => navigate(card.link)}
                                        className={`btn ${card.btnClass}`}
                                        style={{ width: '100%', marginTop: 'auto' }}
                                    >
                                        Access
                                    </button>
                                </div>
                                <div style={{
                                    position: 'absolute',
                                    top: '-20px',
                                    right: '-20px',
                                    width: '60px',
                                    height: '60px',
                                    borderRadius: '50%',
                                    background: card.color,
                                    opacity: 0.05
                                }}></div>
                            </div>
                        ))}
                    </div>

                    {/* Sovereign Identity Card */}
                    <div style={{ marginTop: '4rem' }}>
                        <h2 style={{ marginBottom: '2rem', fontWeight: '700' }}>Your Unique Patient ID</h2>
                        <div className="card" style={{ 
                            background: 'linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%)', 
                            color: 'white',
                            padding: '2.5rem'
                        }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div>
                                    <p style={{ fontSize: '1rem', opacity: 0.9, marginBottom: '0.5rem' }}>Your Healthcare ID</p>
                                    <h1 style={{ fontSize: '3rem', fontWeight: '800', letterSpacing: '2px', fontFamily: 'monospace' }}>
                                        {uniquePatientId || 'Not Generated'}
                                    </h1>
                                    <p style={{ fontSize: '0.9rem', opacity: 0.8, marginTop: '0.5rem' }}>
                                        Use this ID for doctor/lab appointments
                                    </p>
                                </div>
                                <div>
                                    {!uniquePatientId ? (
                                        <button 
                                            onClick={handleInitializeId} 
                                            className="btn" 
                                            style={{ 
                                                background: 'white', 
                                                color: 'var(--primary)', 
                                                fontWeight: '700',
                                                padding: '1rem 2rem'
                                            }}
                                        >
                                            🔐 Generate ID
                                        </button>
                                    ) : (
                                        <div style={{ textAlign: 'center' }}>
                                            <div style={{ 
                                                background: 'white', 
                                                padding: '1rem', 
                                                borderRadius: '12px',
                                                marginBottom: '1rem'
                                            }}>
                                                <img 
                                                    src={dashboardData?.patientInfo?.qr_code_path || '/placeholder-qr.png'} 
                                                    alt="Patient QR Code" 
                                                    style={{ width: '120px', height: '120px' }}
                                                />
                                            </div>
                                            <p style={{ fontSize: '0.8rem', opacity: 0.9 }}>Scan for quick access</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Sovereign Data Protection Card */}
                    <div style={{ marginTop: '4rem' }}>
                        <div className="card" style={{
                            background: 'linear-gradient(135deg, #2c3e50, #000)',
                            color: '#fff',
                            padding: '3rem',
                            borderRadius: '24px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            flexWrap: 'wrap',
                            gap: '2rem'
                        }}>
                            <div style={{ flex: 1, minWidth: '300px' }}>
                                <h2 style={{ fontSize: '2rem', fontWeight: '800', marginBottom: '1rem' }}>Sovereign Data Protection</h2>
                                <p style={{ fontSize: '1.1rem', opacity: 0.8, marginBottom: '2rem' }}>
                                    Your health records are hashed and anchored on the Ethereum blockchain. You alone control the keys to your medical history.
                                </p>
                                <div style={{ display: 'flex', gap: '1rem' }}>
                                    <button className="btn btn-primary" style={{ background: '#fff', color: '#000', border: 'none' }}>Learn Moat Security</button>
                                    <button className="btn btn-outline" style={{ borderColor: 'rgba(255,255,255,0.3)', color: '#fff' }}>Audit Logs</button>
                                </div>
                            </div>
                            <div style={{
                                padding: '2rem',
                                background: 'rgba(255,255,255,0.05)',
                                borderRadius: '20px',
                                border: '1px solid rgba(255,255,255,0.1)',
                                textAlign: 'center'
                            }}>
                                <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🛡️</div>
                                <h4 style={{ fontSize: '1.2rem', fontWeight: '700' }}>Double Encryption</h4>
                                <p style={{ fontSize: '0.8rem', opacity: 0.6 }}>AES-256 + Blockchain Hashing</p>
                            </div>
                        </div>
                    </div>
                    <style>{`
                        .hvr-grow:hover {
                            transform: translateY(-10px);
                            box-shadow: var(--shadow-xl);
                        }
                    `}</style>
                </div>
            </div>
        </div>
    );
}

export default PatientDashboard;
