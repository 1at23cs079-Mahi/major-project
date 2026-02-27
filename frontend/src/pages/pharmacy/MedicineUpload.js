import React, { useState, useEffect } from 'react';
import { medicineAPI } from '../../services/api';
import { useNavigate } from 'react-router-dom';

function MedicineUpload() {
    const [medicines, setMedicines] = useState([]);
    const [selectedMedicine, setSelectedMedicine] = useState('');
    const [image, setImage] = useState(null);
    const [preview, setPreview] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });
    const [search, setSearch] = useState('');

    const navigate = useNavigate();

    // Fetch medicines for selection
    useEffect(() => {
        const fetchMedicines = async () => {
            try {
                // If search is empty, maybe don't fetch all if too many? 
                // For now fetching with search param if exists, specific or empty.
                const response = await medicineAPI.getAll({ search });
                if (response.data.success) {
                    setMedicines(response.data.medicines);
                }
            } catch (error) {
                console.error('Error fetching medicines:', error);
            }
        };

        const timeoutId = setTimeout(() => {
            fetchMedicines();
        }, 500); // Debounce

        return () => clearTimeout(timeoutId);
    }, [search]);

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImage(file);
            setPreview(URL.createObjectURL(file));
        }
    };

    const handleUpload = async (e) => {
        e.preventDefault();
        if (!selectedMedicine || !image) {
            setMessage({ type: 'error', text: 'Please select a medicine and an image.' });
            return;
        }

        setLoading(true);
        setMessage({ type: '', text: '' });

        const formData = new FormData();
        formData.append('image', image);

        try {
            await medicineAPI.uploadImage(selectedMedicine, formData);
            setMessage({ type: 'success', text: 'Image uploaded successfully!' });
            setImage(null);
            setPreview('');
            setSelectedMedicine('');
        } catch (error) {
            console.error('Upload error:', error);
            setMessage({ type: 'error', text: error.response?.data?.message || 'Failed to upload image.' });
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
                    <h1 style={{ fontSize: '2rem', marginBottom: '2rem' }}>Upload Medicine Image</h1>

                    <div className="card" style={{ maxWidth: '600px', margin: '0 auto' }}>
                        <form onSubmit={handleUpload}>
                            <div className="form-group">
                                <label className="form-label">1. Search & Select Medicine</label>
                                <input
                                    type="text"
                                    className="form-input"
                                    placeholder="Type to search medicine..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    style={{ marginBottom: '0.5rem' }}
                                />
                                <select
                                    className="form-select"
                                    value={selectedMedicine}
                                    onChange={(e) => setSelectedMedicine(e.target.value)}
                                    required
                                    size={medicines.length > 0 && search ? 5 : 1} // Expand if searching
                                >
                                    <option value="">-- Select Medicine --</option>
                                    {medicines.map(med => (
                                        <option key={med.id} value={med.id}>
                                            {med.name} ({med.category})
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="form-group">
                                <label className="form-label">2. Select Image</label>
                                <div style={{
                                    border: '2px dashed var(--glass-border)',
                                    padding: '2rem',
                                    textAlign: 'center',
                                    borderRadius: 'var(--radius-sm)',
                                    cursor: 'pointer',
                                    position: 'relative'
                                }}>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={handleFileChange}
                                        style={{
                                            position: 'absolute',
                                            top: 0,
                                            left: 0,
                                            width: '100%',
                                            height: '100%',
                                            opacity: 0,
                                            cursor: 'pointer'
                                        }}
                                        required
                                    />
                                    {preview ? (
                                        <img
                                            src={preview}
                                            alt="Preview"
                                            style={{ maxHeight: '200px', maxWidth: '100%', objectFit: 'contain' }}
                                        />
                                    ) : (
                                        <div style={{ color: 'var(--text-muted)' }}>
                                            <p style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>📸</p>
                                            <p>Click or drag image here</p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {message.text && (
                                <div className={`alert alert-${message.type === 'error' ? 'error' : 'success'}`}>
                                    {message.text}
                                </div>
                            )}

                            <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={loading}>
                                {loading ? 'Uploading...' : 'Upload Image'}
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default MedicineUpload;
