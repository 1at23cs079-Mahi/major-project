import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminAPI } from '../../services/api';

function AdminAuditLogs() {
    const navigate = useNavigate();
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');

    useEffect(() => {
        fetchAuditLogs();
    }, []);

    const fetchAuditLogs = async () => {
        try {
            const response = await adminAPI.getAuditLogs();
            setLogs(response.data.logs || []);
        } catch (err) {
            console.error("Failed to fetch audit logs", err);
        } finally {
            setLoading(false);
        }
    };

    const filteredLogs = filter === 'all' 
        ? logs 
        : logs.filter(log => log.action_type?.toLowerCase().includes(filter.toLowerCase()));

    const getActionColor = (action) => {
        if (action?.includes('LOGIN')) return 'var(--secondary)';
        if (action?.includes('CREATE') || action?.includes('GRANTED')) return 'var(--primary)';
        if (action?.includes('DELETE') || action?.includes('REVOKED')) return 'var(--error)';
        if (action?.includes('UPDATE')) return 'var(--warning)';
        return 'var(--text-secondary)';
    };

    const getActionIcon = (action) => {
        if (action?.includes('LOGIN')) return '🔐';
        if (action?.includes('CREATE')) return '➕';
        if (action?.includes('DELETE')) return '🗑️';
        if (action?.includes('UPDATE')) return '✏️';
        if (action?.includes('PRESCRIPTION')) return '💊';
        if (action?.includes('CONSENT')) return '🛡️';
        if (action?.includes('MEDICAL')) return '📋';
        return '📝';
    };

    return (
        <div style={{ minHeight: '100vh' }}>
            <nav className="navbar">
                <div className="container navbar-content">
                    <h1 className="navbar-brand" style={{ cursor: 'pointer' }} onClick={() => navigate('/admin/dashboard')}>
                        🏥 Healthcare Admin
                    </h1>
                    <button className="btn btn-outline" onClick={() => navigate('/admin/dashboard')}>
                        Back to Dashboard
                    </button>
                </div>
            </nav>

            <div className="container" style={{ padding: '2rem 1rem' }}>
                <div className="fade-in">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                        <div>
                            <h1 style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>Audit Logs</h1>
                            <p style={{ color: 'var(--text-secondary)' }}>
                                Monitor all system activities and blockchain transactions
                            </p>
                        </div>
                        <div style={{ display: 'flex', gap: '1rem' }}>
                            <select 
                                className="form-input"
                                value={filter}
                                onChange={(e) => setFilter(e.target.value)}
                                style={{ width: '200px' }}
                            >
                                <option value="all">All Activities</option>
                                <option value="login">Login Events</option>
                                <option value="prescription">Prescriptions</option>
                                <option value="consent">Consents</option>
                                <option value="medical">Medical Records</option>
                            </select>
                            <button className="btn btn-outline" onClick={fetchAuditLogs}>
                                🔄 Refresh
                            </button>
                        </div>
                    </div>

                    {loading ? (
                        <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
                            <p>Loading audit logs...</p>
                        </div>
                    ) : filteredLogs.length === 0 ? (
                        <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
                            <p style={{ color: 'var(--text-muted)' }}>No audit logs found.</p>
                        </div>
                    ) : (
                        <div className="card">
                            <div style={{ overflowX: 'auto' }}>
                                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                    <thead>
                                        <tr style={{ borderBottom: '2px solid var(--border-color)' }}>
                                            <th style={{ padding: '1rem', textAlign: 'left' }}>Time</th>
                                            <th style={{ padding: '1rem', textAlign: 'left' }}>Action</th>
                                            <th style={{ padding: '1rem', textAlign: 'left' }}>User</th>
                                            <th style={{ padding: '1rem', textAlign: 'left' }}>Details</th>
                                            <th style={{ padding: '1rem', textAlign: 'left' }}>Blockchain</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredLogs.map((log, index) => (
                                            <tr 
                                                key={log.id || index}
                                                style={{ 
                                                    borderBottom: '1px solid var(--border-color)',
                                                    transition: 'background 0.2s'
                                                }}
                                                onMouseEnter={(e) => e.currentTarget.style.background = 'var(--glass-bg)'}
                                                onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                                            >
                                                <td style={{ padding: '1rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                                                    {new Date(log.timestamp || log.created_at).toLocaleString()}
                                                </td>
                                                <td style={{ padding: '1rem' }}>
                                                    <span style={{
                                                        display: 'inline-flex',
                                                        alignItems: 'center',
                                                        gap: '0.5rem',
                                                        padding: '0.25rem 0.75rem',
                                                        borderRadius: '8px',
                                                        background: `${getActionColor(log.action_type)}15`,
                                                        color: getActionColor(log.action_type),
                                                        fontSize: '0.85rem',
                                                        fontWeight: '600'
                                                    }}>
                                                        {getActionIcon(log.action_type)} {log.action_type}
                                                    </span>
                                                </td>
                                                <td style={{ padding: '1rem' }}>
                                                    <div>
                                                        <p style={{ fontSize: '0.9rem', marginBottom: '0.25rem' }}>
                                                            User #{log.user_id}
                                                        </p>
                                                        {log.user_role && (
                                                            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                                                {log.user_role}
                                                            </p>
                                                        )}
                                                    </div>
                                                </td>
                                                <td style={{ padding: '1rem', fontSize: '0.9rem' }}>
                                                    {log.details ? (
                                                        typeof log.details === 'string' 
                                                            ? log.details 
                                                            : JSON.stringify(log.details).substring(0, 50) + '...'
                                                    ) : 'N/A'}
                                                </td>
                                                <td style={{ padding: '1rem' }}>
                                                    {log.transaction_hash ? (
                                                        <span style={{
                                                            fontFamily: 'monospace',
                                                            fontSize: '0.75rem',
                                                            color: 'var(--secondary)',
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            gap: '0.25rem'
                                                        }}>
                                                            ⛓️ {log.transaction_hash.substring(0, 10)}...
                                                        </span>
                                                    ) : (
                                                        <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                                                            -
                                                        </span>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {filteredLogs.length > 0 && (
                                <div style={{ padding: '1rem', borderTop: '1px solid var(--border-color)', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                                    Showing {filteredLogs.length} log{filteredLogs.length !== 1 ? 's' : ''}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default AdminAuditLogs;
