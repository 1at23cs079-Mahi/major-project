import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminAPI } from '../../services/api';

function AdminMedicines() {
    const navigate = useNavigate();
    const [medicines, setMedicines] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showAddModal, setShowAddModal] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        generic_name: '',
        manufacturer: '',
        description: '',
        category: '',
        dosage_form: '',
        strength: ''
    });

    useEffect(() => {
        fetchMedicines();
    }, []);

    const fetchMedicines = async () => {
        try {
            const response = await adminAPI.getMedicines();
            setMedicines(response.data.medicines || []);
        } catch (err) {
            console.error("Failed to fetch medicines", err);
        } finally {
            setLoading(false);
        }
    };

    const handleAddMedicine = async (e) => {
        e.preventDefault();
        try {
            await adminAPI.addMedicine(formData);
            alert('Medicine added successfully!');
            setShowAddModal(false);
            setFormData({
                name: '',
                generic_name: '',
                manufacturer: '',
                description: '',
                category: '',
                dosage_form: '',
                strength: ''
            });
            fetchMedicines();
        } catch (err) {
            console.error("Failed to add medicine", err);
            alert('Failed to add medicine');
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this medicine?')) {
            try {
                await adminAPI.deleteMedicine(id);
                alert('Medicine deleted successfully!');
                fetchMedicines();
            } catch (err) {
                console.error("Failed to delete medicine", err);
                alert('Failed to delete medicine');
            }
        }
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
                            <h1 style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>Medicine Management</h1>
                            <p style={{ color: 'var(--text-secondary)' }}>
                                Manage the medicine database
                            </p>
                        </div>
                        <button 
                            className="btn btn-primary"
                            onClick={() => setShowAddModal(true)}
                        >
                            ➕ Add Medicine
                        </button>
                    </div>

                    {loading ? (
                        <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
                            <p>Loading medicines...</p>
                        </div>
                    ) : medicines.length === 0 ? (
                        <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
                            <p style={{ color: 'var(--text-muted)' }}>No medicines found. Add your first medicine!</p>
                        </div>
                    ) : (
                        <div className="grid grid-3">
                            {medicines.map(medicine => (
                                <div key={medicine.id} className="card">
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                                        <span style={{
                                            background: 'var(--primary)',
                                            color: 'white',
                                            padding: '0.25rem 0.75rem',
                                            borderRadius: '8px',
                                            fontSize: '0.85rem'
                                        }}>
                                            {medicine.category || 'General'}
                                        </span>
                                    </div>
                                    {medicine.image_url && (
                                        <img 
                                            src={medicine.image_url} 
                                            alt={medicine.name}
                                            style={{ width: '100%', height: '150px', objectFit: 'cover', borderRadius: '8px', marginBottom: '1rem' }}
                                        />
                                    )}
                                    <h3 style={{ marginBottom: '0.5rem' }}>{medicine.name}</h3>
                                    <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '0.5rem' }}>
                                        {medicine.generic_name || 'N/A'}
                                    </p>
                                    <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
                                        {medicine.manufacturer || 'Unknown manufacturer'}
                                    </p>
                                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                                        <button 
                                            className="btn btn-outline"
                                            style={{ flex: 1, fontSize: '0.9rem' }}
                                            onClick={() => navigate(`/admin/medicines/${medicine.id}/edit`)}
                                        >
                                            ✏️ Edit
                                        </button>
                                        <button 
                                            className="btn btn-outline"
                                            style={{ flex: 1, fontSize: '0.9rem', borderColor: 'var(--error)', color: 'var(--error)' }}
                                            onClick={() => handleDelete(medicine.id)}
                                        >
                                            🗑️ Delete
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Add Medicine Modal */}
            {showAddModal && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: 'rgba(0,0,0,0.5)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 1000
                }}>
                    <div className="card" style={{ maxWidth: '600px', width: '90%', maxHeight: '90vh', overflow: 'auto' }}>
                        <h2 style={{ marginBottom: '1.5rem' }}>Add New Medicine</h2>
                        <form onSubmit={handleAddMedicine}>
                            <div className="form-group">
                                <label className="form-label">Medicine Name *</label>
                                <input
                                    type="text"
                                    className="form-input"
                                    value={formData.name}
                                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label className="form-label">Generic Name</label>
                                <input
                                    type="text"
                                    className="form-input"
                                    value={formData.generic_name}
                                    onChange={(e) => setFormData({...formData, generic_name: e.target.value})}
                                />
                            </div>

                            <div className="form-group">
                                <label className="form-label">Manufacturer</label>
                                <input
                                    type="text"
                                    className="form-input"
                                    value={formData.manufacturer}
                                    onChange={(e) => setFormData({...formData, manufacturer: e.target.value})}
                                />
                            </div>

                            <div className="form-group">
                                <label className="form-label">Category</label>
                                <select
                                    className="form-input"
                                    value={formData.category}
                                    onChange={(e) => setFormData({...formData, category: e.target.value})}
                                >
                                    <option value="">Select Category</option>
                                    <option value="Antibiotic">Antibiotic</option>
                                    <option value="Painkiller">Painkiller</option>
                                    <option value="Vitamin">Vitamin</option>
                                    <option value="Antacid">Antacid</option>
                                    <option value="Antihistamine">Antihistamine</option>
                                    <option value="Other">Other</option>
                                </select>
                            </div>

                            <div className="form-group">
                                <label className="form-label">Dosage Form</label>
                                <select
                                    className="form-input"
                                    value={formData.dosage_form}
                                    onChange={(e) => setFormData({...formData, dosage_form: e.target.value})}
                                >
                                    <option value="">Select Form</option>
                                    <option value="Tablet">Tablet</option>
                                    <option value="Capsule">Capsule</option>
                                    <option value="Syrup">Syrup</option>
                                    <option value="Injection">Injection</option>
                                    <option value="Cream">Cream</option>
                                    <option value="Drops">Drops</option>
                                </select>
                            </div>

                            <div className="form-group">
                                <label className="form-label">Strength</label>
                                <input
                                    type="text"
                                    className="form-input"
                                    placeholder="e.g., 500mg"
                                    value={formData.strength}
                                    onChange={(e) => setFormData({...formData, strength: e.target.value})}
                                />
                            </div>

                            <div className="form-group">
                                <label className="form-label">Description</label>
                                <textarea
                                    className="form-input"
                                    rows="3"
                                    value={formData.description}
                                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                                />
                            </div>

                            <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
                                <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>
                                    Add Medicine
                                </button>
                                <button 
                                    type="button" 
                                    className="btn btn-outline" 
                                    style={{ flex: 1 }}
                                    onClick={() => setShowAddModal(false)}
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

export default AdminMedicines;
