import React, { useState } from 'react';
import { pharmacyAPI } from '../../services/api';
import { useNavigate } from 'react-router-dom';

function VerifyPrescription() {
    const [prescriptionId, setPrescriptionId] = useState('');
    const [prescription, setPrescription] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [successMsg, setSuccessMsg] = useState('');
    const navigate = useNavigate();

    const handleVerify = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setPrescription(null);
        setSuccessMsg('');

        try {
            const response = await pharmacyAPI.verifyPrescription({ prescription_number: prescriptionId });
            if (response.data.success) {
                setPrescription(response.data.prescription);
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Verification failed. Please check the ID.');
        } finally {
            setLoading(false);
        }
    };

    const handleDispense = async () => {
        if (!prescription) return;
        if (!window.confirm('Mark this prescription as dispensed?')) return;

        setLoading(true);
        try {
            await pharmacyAPI.markDispensed(prescription.id);
            setSuccessMsg('Prescription dispensed successfully!');
            // Refresh details
            const response = await pharmacyAPI.verifyPrescription({ prescription_number: prescriptionId });
            setPrescription(response.data.prescription);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to dispense.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ minHeight: '100vh', background: 'var(--bg-secondary)' }}>
            <div className="navbar">
                <div className="container navbar-content">
                    <h1 className="navbar-brand" style={{ cursor: 'pointer' }} onClick={() => navigate('/pharmacy/dashboard')}>
                        🏥 My Pharmacy
                    </h1>
                    <button className="btn btn-outline" onClick={() => navigate('/pharmacy/dashboard')}>
                        Back to Dashboard
                    </button>
                </div>
            </div>

            <div className="container" style={{ padding: '2rem 1rem' }}>
                <div className="fade-in">
                    <h1 style={{ fontSize: '2rem', marginBottom: '2rem' }}>Verify Prescription</h1>

                    <div className="card" style={{ maxWidth: '600px', margin: '0 auto' }}>
                        <form onSubmit={handleVerify}>
                            <div className="form-group">
                                <label className="form-label">Prescription Number / ID</label>
                                <div style={{ display: 'flex', gap: '1rem' }}>
                                    <input
                                        type="text"
                                        className="form-input"
                                        placeholder="Enter RX Number (e.g. RX-1234...)"
                                        value={prescriptionId}
                                        onChange={(e) => setPrescriptionId(e.target.value)}
                                        required
                                    />
                                    <button type="submit" className="btn btn-primary" disabled={loading}>
                                        {loading ? 'Verifying...' : 'Verify'}
                                    </button>
                                </div>
                            </div>
                        </form>

                        {error && <div className="alert alert-error">{error}</div>}
                        {successMsg && <div className="alert alert-success">{successMsg}</div>}
                    </div>

                    {prescription && (
                        <div className="card fade-in" style={{ marginTop: '2rem' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem', borderBottom: '1px solid var(--glass-border)', paddingBottom: '1rem' }}>
                                <div>
                                    <h2 style={{ color: 'var(--primary)', marginBottom: '0.5rem' }}>
                                        Prescription #{prescription.prescription_number}
                                    </h2>
                                    <p style={{ color: 'var(--text-secondary)' }}>
                                        Date: {new Date(prescription.created_at).toLocaleDateString()}
                                    </p>
                                </div>
                                <div style={{ textAlign: 'right' }}>
                                    <div className={`alert ${prescription.is_dispensed ? 'alert-success' : 'alert-warning'}`} style={{ display: 'inline-block', padding: '0.5rem 1rem', marginBottom: 0 }}>
                                        {prescription.is_dispensed ? 'DISPENSED' : 'PENDING'}
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-2" style={{ marginBottom: '2rem' }}>
                                <div>
                                    <h3 style={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>Patient Details</h3>
                                    <p><strong>Name:</strong> {prescription.patient?.user?.first_name} {prescription.patient?.user?.last_name || 'N/A'}</p>
                                </div>
                                <div>
                                    <h3 style={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>Doctor Details</h3>
                                    <p><strong>Name:</strong> Dr. {prescription.doctor?.user?.last_name || prescription.doctor?.specialization || 'Doctor'}</p>
                                </div>
                            </div>

                            <div style={{ marginBottom: '2rem' }}>
                                <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem' }}>Prescribed Medicines</h3>
                                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                    <thead>
                                        <tr style={{ borderBottom: '1px solid var(--glass-border)', textAlign: 'left' }}>
                                            <th style={{ padding: '0.5rem' }}>Medicine</th>
                                            <th style={{ padding: '0.5rem' }}>Dosage</th>
                                            <th style={{ padding: '0.5rem' }}>Frequency</th>
                                            <th style={{ padding: '0.5rem' }}>Duration</th>
                                            <th style={{ padding: '0.5rem' }}>Instructions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {prescription.items?.map((item, index) => (
                                            <tr key={index} style={{ borderBottom: '1px solid var(--glass-border)' }}>
                                                <td style={{ padding: '0.5rem' }}>{item.medicine?.name || 'Unknown'}</td>
                                                <td style={{ padding: '0.5rem' }}>{item.dosage}</td>
                                                <td style={{ padding: '0.5rem' }}>{item.frequency}</td>
                                                <td style={{ padding: '0.5rem' }}>{item.duration}</td>
                                                <td style={{ padding: '0.5rem' }}>{item.instructions}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {!prescription.is_dispensed && (
                                <div style={{ textAlign: 'right' }}>
                                    <button
                                        className="btn btn-secondary"
                                        onClick={handleDispense}
                                        disabled={loading}
                                    >
                                        Mark as Dispensed
                                    </button>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default VerifyPrescription;
