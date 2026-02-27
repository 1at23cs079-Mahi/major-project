import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { dashboardAPI } from '../../services/api';

function AdminDashboard() {
    const { logout } = useAuth();
    const navigate = useNavigate();
    const [dashboardData, setDashboardData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDashboard = async () => {
            try {
                const response = await dashboardAPI.getAdminDashboard();
                setDashboardData(response.data);
            } catch (err) {
                console.error("Failed to fetch admin dashboard", err);
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
                        <span style={{ color: 'var(--text-secondary)' }}>Admin</span>
                        <button onClick={logout} className="btn btn-outline">Logout</button>
                    </div>
                </div>
            </nav>

            <div className="container" style={{ padding: '2rem 1rem' }}>
                <div className="fade-in">
                    <h1 style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>Admin Dashboard</h1>
                    <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>
                        Manage users, approvals, and system settings.
                    </p>

                    <div className="grid grid-4">
                        <div className="card">
                            <h3 style={{ color: 'var(--primary)' }}>👥 Total Users</h3>
                            <h2 style={{ fontSize: '2.5rem', margin: '1rem 0' }}>
                                {loading ? '...' : dashboardData?.stats?.totalUsers || 0}
                            </h2>
                            <button 
                                className="btn btn-primary" 
                                style={{ width: '100%' }}
                                onClick={() => navigate('/admin/users')}
                            >
                                Manage
                            </button>
                        </div>

                        <div className="card">
                            <h3 style={{ color: 'var(--warning)' }}>⏳ Pending Doctors</h3>
                            <h2 style={{ fontSize: '2.5rem', margin: '1rem 0' }}>
                                {loading ? '...' : dashboardData?.pendingApprovals?.doctors || 0}
                            </h2>
                            <button 
                                className="btn btn-primary" 
                                style={{ width: '100%' }}
                                onClick={() => navigate('/admin/approvals')}
                            >
                                Approve
                            </button>
                        </div>

                        <div className="card">
                            <h3 style={{ color: 'var(--warning)' }}>⏳ Pending Pharmacies</h3>
                            <h2 style={{ fontSize: '2.5rem', margin: '1rem 0' }}>
                                {loading ? '...' : dashboardData?.pendingApprovals?.pharmacies || 0}
                            </h2>
                            <button 
                                className="btn btn-primary" 
                                style={{ width: '100%' }}
                                onClick={() => navigate('/admin/approvals')}
                            >
                                Approve
                            </button>
                        </div>

                        <div className="card">
                            <h3 style={{ color: 'var(--secondary)' }}>💊 Medicines</h3>
                            <h2 style={{ fontSize: '2.5rem', margin: '1rem 0' }}>
                                {loading ? '...' : dashboardData?.stats?.totalMedicines || 0}
                            </h2>
                            <button 
                                className="btn btn-secondary" 
                                style={{ width: '100%' }}
                                onClick={() => navigate('/admin/medicines')}
                            >
                                Manage
                            </button>
                        </div>
                    </div>

                    <div style={{ marginTop: '2rem' }} className="grid grid-2">
                        <div className="card">
                            <h3 style={{ marginBottom: '1rem' }}>📊 System Statistics</h3>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <span>Total Appointments:</span>
                                    <strong>{loading ? '...' : dashboardData?.stats?.totalAppointments || 0}</strong>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <span>Total Prescriptions:</span>
                                    <strong>{loading ? '...' : dashboardData?.stats?.totalPrescriptions || 0}</strong>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <span>Active Patients:</span>
                                    <strong>{loading ? '...' : dashboardData?.stats?.activePatients || 0}</strong>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <span>Active Doctors:</span>
                                    <strong>{loading ? '...' : dashboardData?.stats?.activeDoctors || 0}</strong>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <span>Blockchain Logs:</span>
                                    <strong>{loading ? '...' : dashboardData?.stats?.blockchainLogs || 0}</strong>
                                </div>
                            </div>
                        </div>

                        <div className="card">
                            <h3 style={{ marginBottom: '1rem' }}>📝 Audit Logs</h3>
                            <p style={{ color: 'var(--text-muted)', marginBottom: '1rem' }}>
                                Monitor all system activities and blockchain transactions
                            </p>
                            <button 
                                className="btn btn-outline" 
                                style={{ width: '100%' }}
                                onClick={() => navigate('/admin/audit-logs')}
                            >
                                View Logs
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default AdminDashboard;
