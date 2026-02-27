import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { dashboardAPI } from '../../services/api';

function PharmacyDashboard() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [dashboardData, setDashboardData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDashboard = async () => {
            try {
                const response = await dashboardAPI.getPharmacyDashboard();
                setDashboardData(response.data);
            } catch (err) {
                console.error("Failed to fetch pharmacy dashboard", err);
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
                        <span style={{ color: 'var(--text-secondary)' }}>{user?.profile?.name}</span>
                        <button onClick={logout} className="btn btn-outline">Logout</button>
                    </div>
                </div>
            </nav>

            <div className="container" style={{ padding: '2rem 1rem' }}>
                <div className="fade-in">
                    <h1 style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>Pharmacy Dashboard</h1>
                    <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>
                        Verify prescriptions and manage inventory with blockchain verification.
                    </p>

                    {/* Stats Cards */}
                    <div className="card" style={{ marginBottom: '2rem', background: 'var(--glass-bg)', border: '1px solid var(--glass-border)' }}>
                        <div className="grid grid-4">
                            <div style={{ textAlign: 'center' }}>
                                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '0.5rem' }}>Verified Today</p>
                                <h2 style={{ fontSize: '2rem', fontWeight: '800', color: 'var(--primary)' }}>
                                    {loading ? '...' : dashboardData?.stats?.verifiedToday || 0}
                                </h2>
                            </div>
                            <div style={{ textAlign: 'center', borderLeft: '1px solid var(--glass-border)' }}>
                                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '0.5rem' }}>Pending Verification</p>
                                <h2 style={{ fontSize: '2rem', fontWeight: '800', color: 'var(--secondary)' }}>
                                    {loading ? '...' : dashboardData?.stats?.pendingVerification || 0}
                                </h2>
                            </div>
                            <div style={{ textAlign: 'center', borderLeft: '1px solid var(--glass-border)' }}>
                                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '0.5rem' }}>Medicine Inventory</p>
                                <h2 style={{ fontSize: '2rem', fontWeight: '800', color: '#9b59b6' }}>
                                    {loading ? '...' : dashboardData?.stats?.medicineCount || 0}
                                </h2>
                            </div>
                            <div style={{ textAlign: 'center', borderLeft: '1px solid var(--glass-border)' }}>
                                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '0.5rem' }}>Total Dispensed</p>
                                <h2 style={{ fontSize: '2rem', fontWeight: '800', color: '#e67e22' }}>
                                    {loading ? '...' : dashboardData?.stats?.totalDispensed || 0}
                                </h2>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-3">
                        <div className="card">
                            <h3 style={{ color: 'var(--primary)' }}>📋 Verify Prescription</h3>
                            <p style={{ color: 'var(--text-secondary)', margin: '1rem 0' }}>Scan QR code or enter ID to dispense</p>
                            <button className="btn btn-primary" style={{ width: '100%' }} onClick={() => navigate('/pharmacy/verify')}>
                                Verify / Scan
                            </button>
                        </div>

                        <div className="card">
                            <h3 style={{ color: 'var(--secondary)' }}>💊 Inventory</h3>
                            <p style={{ color: 'var(--text-secondary)', margin: '1rem 0' }}>Manage medicine stock and list</p>
                            <button className="btn btn-secondary" style={{ width: '100%' }} onClick={() => navigate('/pharmacy/inventory')}>
                                View Inventory
                            </button>
                        </div>

                        <div className="card">
                            <h3 style={{ color: 'var(--accent)' }}>📸 Upload Medicine Photo</h3>
                            <p style={{ color: 'var(--text-secondary)', margin: '1rem 0' }}>Add to master database</p>
                            <button className="btn btn-primary" style={{ width: '100%' }} onClick={() => navigate('/pharmacy/upload')}>
                                Upload
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default PharmacyDashboard;
