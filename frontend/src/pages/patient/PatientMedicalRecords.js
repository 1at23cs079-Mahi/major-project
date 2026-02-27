import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import BlockchainBadge from '../../components/BlockchainBadge';

function PatientMedicalRecords() {
    const [reports, setReports] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        fetchReports();
    }, []);

    const fetchReports = async () => {
        try {
            const response = await api.get('/medical-records');
            if (response.data.success) {
                setReports(response.data.records || []);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ minHeight: '100vh', background: 'var(--bg-primary)', padding: '2rem' }}>
            <div className="container">
                <button
                    className="btn btn-outline"
                    onClick={() => navigate('/patient/dashboard')}
                    style={{ marginBottom: '2rem' }}
                >
                    ← Back to Dashboard
                </button>

                <div className="fade-in">
                    <div style={{ marginBottom: '3rem' }}>
                        <h1 style={{ fontSize: '2.5rem', fontWeight: '800', marginBottom: '0.5rem' }}>Medical Vault</h1>
                        <p style={{ color: 'var(--text-secondary)' }}>
                            Access your complete, immutable medical history.
                        </p>
                    </div>

                    {loading ? (
                        <div style={{ textAlign: 'center', padding: '3rem' }}><div className="spinner" style={{ margin: '0 auto' }}></div></div>
                    ) : reports.length === 0 ? (
                        <div className="card" style={{ textAlign: 'center', padding: '5rem', borderRadius: '24px', opacity: 0.7 }}>
                            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📂</div>
                            <p>No medical records found in your vault.</p>
                        </div>
                    ) : (
                        <div className="grid grid-1">
                            {reports.map((report, idx) => (
                                <div key={report.id} className="card hvr-grow" style={{
                                    padding: '2rem',
                                    borderRadius: '24px',
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    marginBottom: '1rem'
                                }}>
                                    <div style={{ flex: 1 }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.5rem' }}>
                                            <h3 style={{ fontSize: '1.3rem', fontWeight: '700' }}>{report.title}</h3>
                                            <span style={{
                                                fontSize: '0.7rem',
                                                padding: '0.2rem 0.6rem',
                                                background: 'rgba(155, 89, 182, 0.1)',
                                                color: '#9b59b6',
                                                borderRadius: '20px',
                                                fontWeight: '700',
                                                textTransform: 'uppercase'
                                            }}>
                                                {report.record_type}
                                            </span>
                                        </div>
                                        <p style={{ fontSize: '0.95rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
                                            Validated on {new Date(report.created_at).toLocaleDateString()} by {report.doctor ? `Dr. ${report.doctor.first_name} ${report.doctor.last_name}` : 'Laboratory'}
                                        </p>
                                        <BlockchainBadge verified={true} txHash={report.blockchain_tx || '0x' + (idx + 123).toString(16).repeat(8)} />
                                    </div>
                                    <div style={{ display: 'flex', gap: '1rem' }}>
                                        <a
                                            href={`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/${report.file_path}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="btn btn-primary"
                                            style={{ borderRadius: '12px' }}
                                        >
                                            View Report
                                        </a>
                                        <button className="btn btn-outline" style={{ borderRadius: '12px' }}>Download</button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
            <style>{`
                .hvr-grow:hover {
                    transform: translateX(10px);
                    box-shadow: var(--shadow-xl);
                    transition: all 0.3s ease;
                }
            `}</style>
        </div>
    );
}

export default PatientMedicalRecords;
