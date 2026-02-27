import React, { useState } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import api from '../../services/api';
import LoadingSpinner from '../../components/LoadingSpinner';
import { useToast } from '../../context/ToastContext';

function PharmacyVerification() {
    const [prescription, setPrescription] = useState(null);
    const [loading, setLoading] = useState(false);
    const [manualNumber, setManualNumber] = useState('');
    const { addToast } = useToast();

    const handleScanSuccess = async (decodedText) => {
        try {
            const qrData = JSON.parse(decodedText);
            if (qrData.type === 'prescription') {
                await verifyPrescription(qrData.number);
            }
        } catch (err) {
            addToast('Invalid QR code', 'error');
        }
    };

    const verifyPrescription = async (prescriptionNumber) => {
        setLoading(true);
        try {
            const response = await api.post('/prescriptions/verify', {
                prescription_number: prescriptionNumber
            });

            setPrescription(response.data.prescription);
            addToast('Prescription verified successfully', 'success');
        } catch (err) {
            addToast('Prescription not found', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleManualVerify = (e) => {
        e.preventDefault();
        if (manualNumber.trim()) {
            verifyPrescription(manualNumber);
        }
    };

    const handleDispense = async () => {
        if (!window.confirm('Mark this prescription as dispensed?')) return;

        try {
            await api.put(`/prescriptions/${prescription.id}/dispense`);
            addToast('Prescription marked as dispensed', 'success');
            setPrescription({ ...prescription, is_dispensed: true });
        } catch (err) {
            addToast('Failed to mark as dispensed', 'error');
        }
    };

    const startScanner = () => {
        const scanner = new Html5QrcodeScanner('qr-reader', {
            fps: 10,
            qrbox: 250
        });

        scanner.render(handleScanSuccess, (error) => {
            // Ignore scanning errors
        });
    };

    if (loading) return <LoadingSpinner message="Verifying prescription..." />;

    return (
        <div className="container" style={{ padding: '2rem 1rem' }}>
            <h1>Prescription Verification</h1>

            {!prescription && (
                <>
                    <div className="card" style={{ marginBottom: '2rem' }}>
                        <h3>Scan QR Code</h3>
                        <div id="qr-reader" style={{ width: '100%' }} />
                        <button className="btn btn-primary" onClick={startScanner}>
                            Start Scanner
                        </button>
                    </div>

                    <div className="card">
                        <h3>Manual Verification</h3>
                        <form onSubmit={handleManualVerify}>
                            <div className="form-group">
                                <label>Prescription Number</label>
                                <input
                                    className="form-input"
                                    placeholder="RX-1234567890-ABCD"
                                    value={manualNumber}
                                    onChange={(e) => setManualNumber(e.target.value)}
                                    required
                                />
                            </div>
                            <button type="submit" className="btn btn-primary">
                                Verify
                            </button>
                        </form>
                    </div>
                </>
            )}

            {prescription && (
                <div className="card">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                        <h2>Prescription Details</h2>
                        <button className="btn btn-outline" onClick={() => setPrescription(null)}>
                            New Scan
                        </button>
                    </div>

                    <p><strong>Number:</strong> {prescription.prescription_number}</p>
                    <p><strong>Patient:</strong> {prescription.patient?.first_name} {prescription.patient?.last_name}</p>
                    <p><strong>Doctor:</strong> Dr. {prescription.doctor?.first_name} {prescription.doctor?.last_name}</p>
                    <p><strong>Date:</strong> {new Date(prescription.created_at).toLocaleDateString()}</p>
                    <p><strong>Diagnosis:</strong> {prescription.diagnosis}</p>

                    <h3>Medicines</h3>
                    <table style={{ width: '100%', marginBottom: '1rem' }}>
                        <thead>
                            <tr>
                                <th style={{ textAlign: 'left', padding: '10px' }}>Medicine</th>
                                <th style={{ textAlign: 'left', padding: '10px' }}>Dosage</th>
                                <th style={{ textAlign: 'left', padding: '10px' }}>Frequency</th>
                                <th style={{ textAlign: 'left', padding: '10px' }}>Duration</th>
                            </tr>
                        </thead>
                        <tbody>
                            {prescription.items?.map(item => (
                                <tr key={item.id}>
                                    <td style={{ padding: '10px' }}>
                                        {item.medicine?.name}
                                        {item.medicine?.image_path && (
                                            <img
                                                src={`http://localhost:5000/${item.medicine.image_path}`}
                                                alt={item.medicine.name}
                                                style={{ display: 'block', maxWidth: '100px', marginTop: '5px' }}
                                            />
                                        )}
                                    </td>
                                    <td style={{ padding: '10px' }}>{item.dosage}</td>
                                    <td style={{ padding: '10px' }}>{item.frequency}</td>
                                    <td style={{ padding: '10px' }}>{item.duration}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    <p><strong>Status:</strong> {prescription.is_dispensed ? '✅ Dispensed' : '⏳ Pending'}</p>

                    {!prescription.is_dispensed && (
                        <button className="btn btn-secondary" onClick={handleDispense}>
                            Mark as Dispensed
                        </button>
                    )}
                </div>
            )}
        </div>
    );
}

export default PharmacyVerification;
