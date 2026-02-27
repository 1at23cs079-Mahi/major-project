import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useWeb3 } from '../../context/Web3Context';
import { dashboardAPI } from '../../services/api';
import { useState, useEffect } from 'react';

function DoctorDashboard() {
    const { user, logout } = useAuth();
    const { account, connectWallet, isConnected } = useWeb3();
    const navigate = useNavigate();
    const [dashboardData, setDashboardData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDashboard = async () => {
            try {
                const response = await dashboardAPI.getDoctorDashboard();
                setDashboardData(response.data);
            } catch (err) {
                console.error("Failed to fetch doctor dashboard", err);
            } finally {
                setLoading(false);
            }
        };

        fetchDashboard();
    }, []);

    return (
        <div style={{ minHeight: '100vh' }}>
            <nav className="navbar">
                <div className="container navbar-content">
                    <h1 className="navbar-brand">🏥 Healthcare System</h1>
                    <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                        {isConnected ? (
                            <span style={{
                                padding: '0.4rem 0.8rem',
                                backgroundColor: 'rgba(16, 185, 129, 0.1)',
                                border: '1px solid var(--secondary)',
                                borderRadius: '8px',
                                color: 'var(--secondary)',
                                fontSize: '0.8rem',
                                fontWeight: '600'
                            }}>
                                🔗 {account.substring(0, 6)}...{account.substring(account.length - 4)}
                            </span>
                        ) : (
                            <button onClick={connectWallet} className="btn btn-outline" style={{ borderColor: 'var(--primary)', color: 'var(--primary)' }}>
                                🦊 Connect Wallet
                            </button>
                        )}
                        <span style={{ color: 'var(--text-secondary)' }}>
                            Dr. {user?.profile?.first_name} {user?.profile?.last_name}
                        </span>
                        <button onClick={logout} className="btn btn-outline">Logout</button>
                    </div>
                </div>
            </nav>

            <div className="container" style={{ padding: '2rem 1rem' }}>
                <div className="fade-in">
                    <h1 style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>Doctor Dashboard</h1>
                    <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>
                        Manage appointments, patients, and prescriptions.
                    </p>

                    <div className="grid grid-3">
                        <div className="card">
                            <h3 style={{ color: 'var(--primary)' }}>📅 Today's Appointments</h3>
                            <h2 style={{ fontSize: '2.5rem', margin: '1rem 0' }}>
                                {loading ? '...' : dashboardData?.todayAppointments?.length || 0}
                            </h2>
                            <button className="btn btn-primary" style={{ width: '100%' }} onClick={() => navigate('/doctor/appointments')}>
                                View Schedule
                            </button>
                        </div>

                        <div className="card">
                            <h3 style={{ color: 'var(--secondary)' }}>⏱️ Current Queue</h3>
                            <h2 style={{ fontSize: '2.5rem', margin: '1rem 0' }}>
                                {loading ? '...' : dashboardData?.queueLength || 0}
                            </h2>
                            <button className="btn btn-secondary" style={{ width: '100%' }} onClick={() => navigate('/doctor/appointments')}>
                                Manage Queue
                            </button>
                        </div>

                        <div className="card">
                            <h3 style={{ color: 'var(--accent)' }}>💊 Create Prescription</h3>
                            <p style={{ color: 'var(--text-secondary)', margin: '1rem 0' }}>
                                Add medicine with photos (blockchain-anchored)
                            </p>
                            <button className="btn btn-primary" style={{ width: '100%' }} onClick={() => navigate('/doctor/create-prescription')}>
                                New Prescription
                            </button>
                        </div>

                        <div className="card">
                            <h3 style={{ color: 'var(--primary)' }}>🔍 Patient Record Vault</h3>
                            <p style={{ color: 'var(--text-secondary)', margin: '1rem 0' }}>
                                Access records with patient consent (verified on-chain)
                            </p>
                            <button className="btn btn-primary" style={{ width: '100%' }} onClick={() => navigate('/doctor/lookup')}>
                                Lookup Patient by ID
                            </button>
                        </div>

                        <div className="card">
                            <h3 style={{ color: 'var(--secondary)' }}>👥 Total Patients</h3>
                            <h2 style={{ fontSize: '2.5rem', margin: '1rem 0' }}>
                                {loading ? '...' : dashboardData?.stats?.totalPatients || 0}
                            </h2>
                            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Under your care</p>
                        </div>

                        <div className="card">
                            <h3 style={{ color: '#f39c12' }}>📋 Prescriptions Issued</h3>
                            <h2 style={{ fontSize: '2.5rem', margin: '1rem 0' }}>
                                {loading ? '...' : dashboardData?.stats?.totalPrescriptions || 0}
                            </h2>
                            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>All time</p>
                        </div>
                    </div>

                    <div style={{ marginTop: '2rem' }} className="card">
                        <h3 style={{ marginBottom: '1rem' }}>Recent Activity</h3>
                        <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '2rem' }}>
                            No recent activity. Start managing appointments to see updates here.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default DoctorDashboard;
