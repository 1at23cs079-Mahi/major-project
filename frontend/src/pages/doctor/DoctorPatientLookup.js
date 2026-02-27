import React, { useState } from 'react';
import { doctorAPI, consentAPI, patientAccessAPI } from '../../services/api';
import { useNavigate } from 'react-router-dom';

function DoctorPatientLookup() {
    const [uniquePatientId, setUniquePatientId] = useState('');
    const [patientData, setPatientData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const navigate = useNavigate();

    const handleLookup = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setPatientData(null);

        try {
            // Use new patient access API with unique patient ID
            const response = await patientAccessAPI.doctorLookup(uniquePatientId);
            
            if (response.data.success) {
                setPatientData(response.data.data);
            } else {
                setError(response.data.message || 'Patient not found or consent not granted');
            }
        } catch (err) {
            console.error(err);
            if (err.response?.status === 403) {
                setError('Access denied. Patient has not granted you consent to view their records.');
            } else if (err.response?.status === 404) {
                setError('Patient with this unique ID not found. Please verify the ID.');
            } else {
                setError(err.response?.data?.message || 'Failed to lookup patient. Please try again.');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ minHeight: '100vh', background: 'var(--bg-secondary)' }}>
            <nav className="navbar">
                <div className="container navbar-content">
                    <h1 className="navbar-brand" style={{ cursor: 'pointer' }} onClick={() => navigate('/doctor/dashboard')}>
                        🏥 Healthcare Doctor Portal
                    </h1>
                    <button className="btn btn-outline" onClick={() => navigate('/doctor/dashboard')}>
                        Back to Dashboard
                    </button>
                </div>
            </nav>

            <div className="container" style={{ padding: '2rem 1rem' }}>
                <div className="fade-in">
                    <h1 style={{ fontSize: '2rem', marginBottom: '2rem' }}>Patient Record Vault</h1>

                    <div className="card" style={{ maxWidth: '600px', margin: '0 0 2rem 0' }}>
                        <form onSubmit={handleLookup} style={{ display: 'flex', gap: '1rem', alignItems: 'flex-end' }}>
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
                                <small style={{ color: 'var(--text-muted)', display: 'block', marginTop: '0.5rem' }}>
                                    Format: HID-YYYY-XXXXX (blockchain-verified access)
                                </small>
                            </div>
                            <button type="submit" className="btn btn-primary" disabled={loading}>
                                {loading ? '🔍 Checking...' : '🔐 Secure Lookup'}
                            </button>
                        </form>
                    </div>

                    {error && (
                        <div className="alert alert-error fade-in" style={{ maxWidth: '800px' }}>
                            🚫 {error}
                        </div>
                    )}

                    {patientData && (
                        <div className="fade-in">
                            <h2 style={{ marginBottom: '1.5rem', fontSize: '1.5rem' }}>
                                Patient Information - {uniquePatientId}
                            </h2>
                            
                            {/* Patient Profile */}
                            <div className="card" style={{ marginBottom: '2rem', background: 'linear-gradient(135deg, rgba(52, 152, 219, 0.1), rgba(46, 204, 113, 0.1))' }}>
                                <h3 style={{ marginBottom: '1rem' }}>👤 Personal Details</h3>
                                <div className="grid grid-2">
                                    <div>
                                        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Full Name</p>
                                        <p style={{ fontWeight: '600', fontSize: '1.2rem' }}>
                                            {patientData.patient?.first_name} {patientData.patient?.last_name}
                                        </p>
                                    </div>
                                    <div>
                                        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Date of Birth</p>
                                        <p style={{ fontWeight: '600', fontSize: '1.2rem' }}>
                                            {patientData.patient?.date_of_birth || 'N/A'}
                                        </p>
                                    </div>
                                    <div>
                                        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Blood Group</p>
                                        <p style={{ fontWeight: '600', fontSize: '1.2rem', color: 'var(--error)' }}>
                                            {patientData.patient?.blood_group || 'N/A'}
                                        </p>
                                    </div>
                                    <div>
                                        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Blockchain Address</p>
                                        <p style={{ fontWeight: '600', fontSize: '0.9rem', fontFamily: 'monospace', color: 'var(--secondary)' }}>
                                            {patientData.patient?.blockchain_address ? 
                                                `${patientData.patient.blockchain_address.substring(0, 10)}...${patientData.patient.blockchain_address.substring(38)}` 
                                                : 'Not Set'
                                            }
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Medical Records */}
                            <h3 style={{ marginBottom: '1rem' }}>📋 Medical Records</h3>
                            {!patientData.medicalRecords || patientData.medicalRecords.length === 0 ? (
                                <div className="card" style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)' }}>
                                    <p>No medical records found for this patient.</p>
                                </div>
                            ) : (
                                <div className="grid grid-3">
                                    {patientData.medicalRecords.map(record => (
                                        <div key={record.id} className="card">
                                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                                                <span style={{
                                                    background: 'var(--primary)',
                                                    color: 'white',
                                                    padding: '0.25rem 0.75rem',
                                                    borderRadius: '8px',
                                                    fontSize: '0.85rem'
                                                }}>
                                                    {record.report_type || 'General'}
                                                </span>
                                                {record.blockchain_tx_hash && (
                                                    <span style={{ color: 'var(--secondary)', fontSize: '0.9rem' }}>⛓️ On-Chain</span>
                                                )}
                                            </div>
                                            <p style={{ fontWeight: '600', marginBottom: '0.5rem' }}>{record.report_name}</p>
                                            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1rem' }}>
                                                {new Date(record.created_at).toLocaleDateString()}
                                            </p>
                                            {record.file_path && (
                                                <a href={`/uploads/${record.file_path}`} target="_blank" rel="noopener noreferrer" className="btn btn-outline" style={{ width: '100%', fontSize: '0.9rem' }}>
                                                    View Report
                                                </a>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Prescriptions */}
                            <h3 style={{ marginBottom: '1rem', marginTop: '2rem' }}>💊 Prescriptions</h3>
                            {!patientData.prescriptions || patientData.prescriptions.length === 0 ? (
                                <div className="card" style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)' }}>
                                    <p>No prescriptions found for this patient.</p>
                                </div>
                            ) : (
                                <div className="grid grid-2">
                                    {patientData.prescriptions.map(prescription => (
                                        <div key={prescription.id} className="card">
                                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                                                <span style={{ fontWeight: '700', fontSize: '1.1rem' }}>Prescription #{prescription.id}</span>
                                                {prescription.blockchain_tx_hash && (
                                                    <span style={{ color: 'var(--secondary)', fontSize: '0.9rem' }}>⛓️ Verified</span>
                                                )}
                                            </div>
                                            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '0.5rem' }}>
                                                Issued: {new Date(prescription.created_at).toLocaleDateString()}
                                            </p>
                                            <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
                                                {prescription.diagnosis || 'No diagnosis provided'}
                                            </p>
                                            {prescription.blockchain_tx_hash && (
                                                <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginTop: '0.5rem', fontFamily: 'monospace', wordBreak: 'break-all' }}>
                                                    TX: {prescription.blockchain_tx_hash.substring(0, 20)}...
                                                </p>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Consent Information */}
                            <div className="card" style={{ marginTop: '2rem', background: 'rgba(46, 204, 113, 0.05)', border: '1px solid var(--secondary)' }}>
                                <h3 style={{ marginBottom: '1rem', color: 'var(--secondary)' }}>✅ Consent Status</h3>
                                <p style={{ fontSize: '0.95rem' }}>
                                    This patient has granted you <strong>active consent</strong> to view their medical records. 
                                    All access is logged on the blockchain for audit purposes.
                                </p>
                                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
                                    🔐 This lookup has been recorded as a blockchain transaction
                                </p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default DoctorPatientLookup;
