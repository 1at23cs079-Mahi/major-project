import React, { useState } from 'react';
import api from '../../services/api';

function DoctorCreatePrescription() {
    const [patientId, setPatientId] = useState('');
    const [diagnosis, setDiagnosis] = useState('');
    const [notes, setNotes] = useState('');
    const [medicines, setMedicines] = useState([]);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const addMedicine = () => {
        setMedicines([...medicines, {
            medicine_id: '',
            dosage: '',
            frequency: '',
            duration: '',
            instructions: ''
        }]);
    };

    const updateMedicine = (index, field, value) => {
        const updated = [...medicines];
        updated[index][field] = value;
        setMedicines(updated);
    };

    const removeMedicine = (index) => {
        setMedicines(medicines.filter((_, i) => i !== index));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        try {
            // Create prescription
            const rxResponse = await api.post('/prescriptions', {
                patient_id: patientId,
                diagnosis,
                notes
            });

            // Add medicines
            await api.post(`/prescriptions/${rxResponse.data.prescription.id}/items`, {
                items: medicines
            });

            setSuccess('Prescription created successfully!');
            // Reset form
            setPatientId('');
            setDiagnosis('');
            setNotes('');
            setMedicines([]);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to create prescription');
        }
    };

    return (
        <div className="container">
            <h1>Create Prescription</h1>

            {error && <div className="alert alert-error">{error}</div>}
            {success && <div className="alert alert-success">{success}</div>}

            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <label>Patient ID</label>
                    <input
                        type="number"
                        value={patientId}
                        onChange={(e) => setPatientId(e.target.value)}
                        required
                    />
                </div>

                <div className="form-group">
                    <label>Diagnosis</label>
                    <textarea
                        value={diagnosis}
                        onChange={(e) => setDiagnosis(e.target.value)}
                        required
                    />
                </div>

                <div className="form-group">
                    <label>Notes</label>
                    <textarea
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                    />
                </div>

                <h3>Medicines</h3>
                {medicines.map((med, index) => (
                    <div key={index} style={{ border: '1px solid #ccc', padding: '10px', marginBottom: '10px' }}>
                        <div className="form-group">
                            <label>Medicine ID</label>
                            <input
                                type="number"
                                value={med.medicine_id}
                                onChange={(e) => updateMedicine(index, 'medicine_id', e.target.value)}
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label>Dosage</label>
                            <input
                                type="text"
                                value={med.dosage}
                                onChange={(e) => updateMedicine(index, 'dosage', e.target.value)}
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label>Frequency</label>
                            <input
                                type="text"
                                value={med.frequency}
                                onChange={(e) => updateMedicine(index, 'frequency', e.target.value)}
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label>Duration</label>
                            <input
                                type="text"
                                value={med.duration}
                                onChange={(e) => updateMedicine(index, 'duration', e.target.value)}
                                required
                            />
                        </div>
                        <button type="button" onClick={() => removeMedicine(index)}>Remove</button>
                    </div>
                ))}

                <button type="button" onClick={addMedicine}>Add Medicine</button>
                <button type="submit">Create Prescription</button>
            </form>
        </div>
    );
}

export default DoctorCreatePrescription;
