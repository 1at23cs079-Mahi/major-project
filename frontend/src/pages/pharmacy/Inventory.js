import React, { useState, useEffect } from 'react';
import { medicineAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

function Inventory() {
    const [medicines, setMedicines] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [category, setCategory] = useState('');
    const { user } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        fetchMedicines();
    }, [search, category]);

    const fetchMedicines = async () => {
        try {
            const response = await medicineAPI.getAll({ search, category });
            if (response.data.success) {
                setMedicines(response.data.medicines);
            }
        } catch (error) {
            console.error('Error fetching medicines:', error);
        } finally {
            setLoading(false);
        }
    };

    const categories = ['Antibiotic', 'Painkiller', 'Vitamin', 'Cold & Flu', 'First Aid', 'Other'];

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
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                        <div>
                            <h1 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>Medicine Inventory</h1>
                            <p style={{ color: 'var(--text-secondary)' }}>Manage and view available medicines</p>
                        </div>
                        <button className="btn btn-primary" onClick={() => navigate('/pharmacy/upload')}>
                            + Add New Medicine
                        </button>
                    </div>

                    <div className="card" style={{ marginBottom: '2rem' }}>
                        <div className="grid grid-2">
                            <div className="form-group">
                                <label className="form-label">Search Medicines</label>
                                <input
                                    type="text"
                                    className="form-input"
                                    placeholder="Search by name..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Filter by Category</label>
                                <select
                                    className="form-select"
                                    value={category}
                                    onChange={(e) => setCategory(e.target.value)}
                                >
                                    <option value="">All Categories</option>
                                    {categories.map(cat => (
                                        <option key={cat} value={cat}>{cat}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </div>

                    {loading ? (
                        <div className="loading">
                            <div className="spinner"></div>
                        </div>
                    ) : (
                        <div className="grid grid-4" style={{ gap: '1.5rem' }}>
                            {medicines.map(medicine => (
                                <div key={medicine.id} className="card" style={{ padding: '1rem', display: 'flex', flexDirection: 'column' }}>
                                    <div style={{
                                        height: '150px',
                                        background: 'var(--bg-tertiary)',
                                        borderRadius: 'var(--radius-sm)',
                                        marginBottom: '1rem',
                                        overflow: 'hidden',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center'
                                    }}>
                                        {medicine.image_path ? (
                                            <img
                                                src={`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/${medicine.image_path}`}
                                                alt={medicine.name}
                                                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                            />
                                        ) : (
                                            <span style={{ fontSize: '3rem' }}>💊</span>
                                        )}
                                    </div>
                                    <h3 style={{ marginBottom: '0.5rem', fontSize: '1.1rem' }}>{medicine.name}</h3>
                                    <div style={{ marginBottom: '0.5rem' }}>
                                        <span style={{
                                            background: 'rgba(37, 99, 235, 0.1)',
                                            color: 'var(--primary)',
                                            padding: '0.25rem 0.5rem',
                                            borderRadius: '1rem',
                                            fontSize: '0.8rem'
                                        }}>
                                            {medicine.category}
                                        </span>
                                    </div>
                                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '0.5rem' }}>
                                        {medicine.manufacturer}
                                    </p>
                                    <div style={{ marginTop: 'auto', paddingTop: '1rem', borderTop: '1px solid var(--glass-border)' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                                                {medicine.default_dosage}
                                            </span>
                                            <span style={{ fontWeight: 'bold' }}>
                                                {medicine.unit}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {!loading && medicines.length === 0 && (
                        <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                            <h3>No medicines found</h3>
                            <p>Try adjusting your search filters</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default Inventory;
