import React, { useState, useEffect } from 'react';
import api from '../../services/api';

function AdminApprovals() {
    const [pendingDoctors, setPendingDoctors] = useState([]);
    const [pendingPharmacies, setPendingPharmacies] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchPendingApprovals();
    }, []);

    const fetchPendingApprovals = async () => {
        try {
            const response = await api.get('/admin/approvals/pending');
            setPendingDoctors(response.data.pending.doctors);
            setPendingPharmacies(response.data.pending.pharmacies);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const approveDoctor = async (id) => {
        try {
            await api.put(`/admin/doctors/${id}/approve`);
            fetchPendingApprovals();
            alert('Doctor approved successfully');
        } catch (err) {
            alert('Failed to approve doctor');
        }
    };

    const approvePharmacy = async (id) => {
        try {
            await api.put(`/admin/pharmacies/${id}/approve`);
            fetchPendingApprovals();
            alert('Pharmacy approved successfully');
        } catch (err) {
            alert('Failed to approve pharmacy');
        }
    };

    if (loading) return <div>Loading...</div>;

    return (
        <div className="container">
            <h1>Pending Approvals</h1>

            <h2>Doctors ({pendingDoctors.length})</h2>
            {pendingDoctors.length === 0 ? (
                <p>No pending doctor approvals</p>
            ) : (
                <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '30px' }}>
                    <thead>
                        <tr style={{ borderBottom: '1px solid #ccc' }}>
                            <th style={{ padding: '10px', textAlign: 'left' }}>Name</th>
                            <th style={{ padding: '10px', textAlign: 'left' }}>Email</th>
                            <th style={{ padding: '10px', textAlign: 'left' }}>License</th>
                            <th style={{ padding: '10px', textAlign: 'left' }}>Specialization</th>
                            <th style={{ padding: '10px', textAlign: 'left' }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {pendingDoctors.map(doctor => (
                            <tr key={doctor.id} style={{ borderBottom: '1px solid #eee' }}>
                                <td style={{ padding: '10px' }}>
                                    Dr. {doctor.first_name} {doctor.last_name}
                                </td>
                                <td style={{ padding: '10px' }}>{doctor.user?.email}</td>
                                <td style={{ padding: '10px' }}>{doctor.license_number}</td>
                                <td style={{ padding: '10px' }}>{doctor.specialization}</td>
                                <td style={{ padding: '10px' }}>
                                    <button onClick={() => approveDoctor(doctor.id)}>Approve</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}

            <h2>Pharmacies ({pendingPharmacies.length})</h2>
            {pendingPharmacies.length === 0 ? (
                <p>No pending pharmacy approvals</p>
            ) : (
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr style={{ borderBottom: '1px solid #ccc' }}>
                            <th style={{ padding: '10px', textAlign: 'left' }}>Name</th>
                            <th style={{ padding: '10px', textAlign: 'left' }}>Email</th>
                            <th style={{ padding: '10px', textAlign: 'left' }}>License</th>
                            <th style={{ padding: '10px', textAlign: 'left' }}>Address</th>
                            <th style={{ padding: '10px', textAlign: 'left' }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {pendingPharmacies.map(pharmacy => (
                            <tr key={pharmacy.id} style={{ borderBottom: '1px solid #eee' }}>
                                <td style={{ padding: '10px' }}>{pharmacy.name}</td>
                                <td style={{ padding: '10px' }}>{pharmacy.user?.email}</td>
                                <td style={{ padding: '10px' }}>{pharmacy.license_number}</td>
                                <td style={{ padding: '10px' }}>{pharmacy.address}</td>
                                <td style={{ padding: '10px' }}>
                                    <button onClick={() => approvePharmacy(pharmacy.id)}>Approve</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    );
}

export default AdminApprovals;
