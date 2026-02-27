import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { dashboardAPI, patientAccessAPI } from '../../services/api';

function LabDashboard() {
    const { user, logout } = useAuth();
    const [dashboardData, setDashboardData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [uniquePatientId, setUniquePatientId] = useState('');
    const [lookupResult, setLookupResult] = useState(null);
    const [lookupError, setLookupError] = useState('');

    useEffect(() => {
        const fetchDashboard = async () => {
            try {
                const response = await dashboardAPI.getLabDashboard();
                setDashboardData(response.data);
            } catch (err) {
                console.error("Failed to fetch lab dashboard", err);
            } finally {
                setLoading(false);
            }
        };

        fetchDashboard();
    }, []);

    const handlePatientLookup = async (e) => {
        e.preventDefault();
        setLookupError('');
        setLookupResult(null);

        try {
            const response = await patientAccessAPI.labLookup(uniquePatientId);
            if (response.data.success) {
                setLookupResult(response.data.data);
            }
        } catch (err) {
            setLookupError(err.response?.data?.message || 'Failed to lookup patient. Verify the unique ID and consent.');
        }
    };

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
                    <h1 style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>Laboratory Dashboard</h1>
                    <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>
                        Manage test requests and upload reports.
                    </p>

                    <div className="grid grid-3">
                        <div className="card">
                            <h3 style={{ color: 'var(--primary)' }}>🧪 Pending Reports</h3>
                            <h2 style={{ fontSize: '2.5rem', margin: '1rem 0' }}>
                                {loading ? '...' : dashboardData?.stats?.pendingReports || 0}
                            </h2>
                            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Awaiting upload</p>
                        </div>

                        <div className="card">
                            <h3 style={{ color: 'var(--secondary)' }}>✅ Uploaded Today</h3>
                            <h2 style={{ fontSize: '2.5rem', margin: '1rem 0' }}>
                                {loading ? '...' : dashboardData?.stats?.uploadedToday || 0}
                            </h2>
                            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Blockchain-anchored</p>
                        </div>

                        <div className="card">
                            <h3 style={{ color: 'var(--accent)' }}>📊 Total Reports</h3>
                            <h2 style={{ fontSize: '2.5rem', margin: '1rem 0' }}>
                                {loading ? '...' : dashboardData?.stats?.totalReports || 0}
                            </h2>
                            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>All time</p>
                        </div>
                    </div>

                    {/* Patient Lookup for Lab Report Upload */}
                    <div className="card" style={{ marginTop: '2rem' }}>
                        <h3 style={{ marginBottom: '1.5rem' }}>🔍 Patient Lookup (for Report Upload)</h3>
                        <form onSubmit={handlePatientLookup} style={{ display: 'flex', gap: '1rem', alignItems: 'flex-end', maxWidth: '600px' }}>
                            <div className="form-group" style={{ flex: 1, marginBottom: 0 }}>
                                <label className="form-label">Enter Unique Patient ID</label>
                                <input
                                    type="text"
                                    className="form-input"
                                    placeholder="e.g., HID-2026-00142"
                                    value={uniquePatientId}
                                    onChange={(e) => setUniquePatientId(e.target.value)}
                                    required
                                    style={{ fontFamily: 'monospace', fontSize: '1.1rem' }}
                                />
                            </div>
                            <button type="submit" className="btn btn-primary">
                                🔐 Lookup Patient
                            </button>
                        </form>

                        {lookupError && (
                            <div className="alert alert-error" style={{ marginTop: '1rem' }}>
                                {lookupError}
                            </div>
                        )}

                        {lookupResult && (
                            <div className="fade-in" style={{ marginTop: '2rem', padding: '1.5rem', background: 'rgba(46, 204, 113, 0.05)', borderRadius: '12px', border: '1px solid var(--secondary)' }}>
                                <h4 style={{ color: 'var(--secondary)', marginBottom: '1rem' }}>✅ Patient Found</h4>
                                <div className="grid grid-2">
                                    <div>
                                        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Patient Name</p>
                                        <p style={{ fontWeight: '600', fontSize: '1.1rem' }}>
                                            {lookupResult.patient?.first_name} {lookupResult.patient?.last_name}
                                        </p>
                                    </div>
                                    <div>
                                        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Patient ID (DB)</p>
                                        <p style={{ fontWeight: '600', fontSize: '1.1rem' }}>{lookupResult.patient?.id}</p>
                                    </div>
                                </div>
                                <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '1rem' }}>
                                    ✅ Consent verified. You can now upload lab reports for this patient.
                                </p>
                                <button className="btn btn-primary" style={{ marginTop: '1rem' }}>
                                    📤 Upload Lab Report
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default LabDashboard;
