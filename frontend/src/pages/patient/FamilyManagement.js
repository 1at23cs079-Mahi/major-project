import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import Modal from '../../components/Modal';
import { useToast } from '../../context/ToastContext';
import { useWeb3 } from '../../context/Web3Context';

function FamilyManagement() {
    const { account } = useWeb3();
    const { addToast } = useToast();
    const [familyMembers, setFamilyMembers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingMember, setEditingMember] = useState(null);

    const [formData, setFormData] = useState({
        first_name: '',
        last_name: '',
        relationship: '',
        date_of_birth: '',
        gender: '',
        blood_group: '',
        allergies: '',
        chronic_conditions: ''
    });

    useEffect(() => {
        fetchFamilyMembers();
    }, []);

    const fetchFamilyMembers = async () => {
        try {
            const response = await api.get('/family');
            setFamilyMembers(response.data.familyMembers || []);
        } catch (err) {
            addToast('Failed to load family members', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleOpenModal = (member = null) => {
        if (member) {
            setEditingMember(member);
            setFormData(member);
        } else {
            setEditingMember(null);
            setFormData({
                first_name: '',
                last_name: '',
                relationship: '',
                date_of_birth: '',
                gender: '',
                blood_group: '',
                allergies: '',
                chronic_conditions: ''
            });
        }
        setIsModalOpen(true);
    };

    const handleSubmit = async (e) => {
        if (e) e.preventDefault();

        try {
            if (editingMember) {
                await api.put(`/family/${editingMember.id}`, formData);
                addToast('Family member updated successfully', 'success');
            } else {
                await api.post('/family', formData);
                addToast('Family member added successfully', 'success');
            }

            setIsModalOpen(false);
            fetchFamilyMembers();
        } catch (err) {
            addToast('Failed to save family member', 'error');
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to remove this family member? All associated secure records will be unlinked.')) return;

        try {
            await api.delete(`/family/${id}`);
            addToast('Family member removed successfully', 'success');
            fetchFamilyMembers();
        } catch (err) {
            addToast('Failed to remove family member', 'error');
        }
    };

    if (loading) return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
            <div className="loader"></div>
        </div>
    );

    return (
        <div className="family-management-container" style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem' }}>
                <div>
                    <h1 style={{ fontSize: '2.5rem', fontWeight: '800', marginBottom: '0.5rem', background: 'linear-gradient(45deg, #fff, var(--primary))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                        Family Health Hub
                    </h1>
                    <p style={{ color: 'rgba(255,255,255,0.7)' }}>Manage health profiles and digital records for your loved ones.</p>
                </div>
                <button className="btn-primary" style={{ padding: '0.8rem 1.5rem', borderRadius: '12px', fontWeight: 'bold' }} onClick={() => handleOpenModal()}>
                    + Add New Member
                </button>
            </div>

            {familyMembers.length === 0 ? (
                <div className="glass-card" style={{ padding: '4rem', textAlign: 'center', borderRadius: '24px' }}>
                    <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>👨‍👩‍👧‍👦</div>
                    <h3>No Family Members Added</h3>
                    <p style={{ color: 'rgba(255,255,255,0.6)', maxWidth: '400px', margin: '0 auto 2rem' }}>
                        Create profiles for your family members to manage their prescriptions and appointments from your dashboard.
                    </p>
                    <button className="btn-outline" onClick={() => handleOpenModal()}>Add First Member</button>
                </div>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '2rem' }}>
                    {familyMembers.map(member => (
                        <div key={member.id} className="glass-card hvr-grow" style={{
                            padding: '2rem',
                            borderRadius: '24px',
                            border: '1px solid rgba(255,255,255,0.1)',
                            display: 'flex',
                            flexDirection: 'column'
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '1.5rem' }}>
                                <div style={{
                                    width: '60px',
                                    height: '60px',
                                    borderRadius: '16px',
                                    background: 'rgba(var(--primary-rgb), 0.2)',
                                    display: 'flex',
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                    fontSize: '2rem',
                                    marginRight: '1rem'
                                }}>
                                    {member.gender === 'Female' ? '👩' : '👨'}
                                </div>
                                <div>
                                    <h3 style={{ margin: 0, fontSize: '1.25rem' }}>{member.first_name} {member.last_name}</h3>
                                    <span style={{
                                        fontSize: '0.8rem',
                                        padding: '0.2rem 0.6rem',
                                        borderRadius: '50px',
                                        background: 'rgba(255,255,255,0.1)',
                                        color: 'var(--primary)',
                                        fontWeight: 'bold'
                                    }}>
                                        {member.relationship}
                                    </span>
                                </div>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
                                <div>
                                    <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.5)', marginBottom: '0.2rem' }}>BLOOD GROUP</div>
                                    <div style={{ fontWeight: 'bold', color: '#ff4444' }}>{member.blood_group || 'Not Set'}</div>
                                </div>
                                <div>
                                    <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.5)', marginBottom: '0.2rem' }}>DATE OF BIRTH</div>
                                    <div style={{ fontWeight: '600' }}>{new Date(member.date_of_birth).toLocaleDateString()}</div>
                                </div>
                            </div>

                            <div style={{ flex: 1, marginBottom: '1.5rem' }}>
                                <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.5)', marginBottom: '0.5rem' }}>ALLERGIES & CONDITIONS</div>
                                <div style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.8)', minHeight: '40px' }}>
                                    {member.allergies || member.chronic_conditions ? (
                                        <>
                                            {member.allergies && <div style={{ marginBottom: '0.3rem' }}>• {member.allergies}</div>}
                                            {member.chronic_conditions && <div>• {member.chronic_conditions}</div>}
                                        </>
                                    ) : 'No reported conditions'}
                                </div>
                            </div>

                            <div style={{ display: 'flex', gap: '1rem', pt: '1.5rem', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
                                <button className="btn-outline" style={{ flex: 1, fontSize: '0.85rem' }} onClick={() => handleOpenModal(member)}>
                                    Edit Profile
                                </button>
                                <button
                                    style={{
                                        background: 'rgba(244, 67, 54, 0.1)',
                                        color: '#f44336',
                                        border: '1px solid rgba(244, 67, 54, 0.3)',
                                        padding: '0.5rem 1rem',
                                        borderRadius: '8px',
                                        cursor: 'pointer'
                                    }}
                                    onClick={() => handleDelete(member.id)}
                                >
                                    🗑️
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title={editingMember ? 'Update Family Member' : 'New Family Profile'}
                footer={
                    <div style={{ display: 'flex', gap: '1rem', width: '100%' }}>
                        <button className="btn-outline" style={{ flex: 1 }} onClick={() => setIsModalOpen(false)}>
                            Cancel
                        </button>
                        <button className="btn-primary" style={{ flex: 1 }} onClick={handleSubmit}>
                            {editingMember ? 'Save Changes' : 'Create Profile'}
                        </button>
                    </div>
                }
            >
                <div style={{ padding: '0.5rem' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
                        <div className="form-group">
                            <label className="form-label">First Name</label>
                            <input
                                className="form-input"
                                value={formData.first_name}
                                onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                                placeholder="e.g. Emily"
                            />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Last Name</label>
                            <input
                                className="form-input"
                                value={formData.last_name}
                                onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                                placeholder="e.g. Smith"
                            />
                        </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
                        <div className="form-group">
                            <label className="form-label">Relationship</label>
                            <select
                                className="form-select"
                                value={formData.relationship}
                                onChange={(e) => setFormData({ ...formData, relationship: e.target.value })}
                            >
                                <option value="">Select...</option>
                                <option value="Spouse">Spouse</option>
                                <option value="Child">Child</option>
                                <option value="Parent">Parent</option>
                                <option value="Sibling">Sibling</option>
                                <option value="Other">Other</option>
                            </select>
                        </div>
                        <div className="form-group">
                            <label className="form-label">Date of Birth</label>
                            <input
                                type="date"
                                className="form-input"
                                value={formData.date_of_birth}
                                onChange={(e) => setFormData({ ...formData, date_of_birth: e.target.value })}
                            />
                        </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
                        <div className="form-group">
                            <label className="form-label">Gender</label>
                            <select
                                className="form-select"
                                value={formData.gender}
                                onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                            >
                                <option value="">Select...</option>
                                <option value="Male">Male</option>
                                <option value="Female">Female</option>
                                <option value="Other">Other</option>
                            </select>
                        </div>
                        <div className="form-group">
                            <label className="form-label">Blood Group</label>
                            <input
                                className="form-input"
                                value={formData.blood_group}
                                onChange={(e) => setFormData({ ...formData, blood_group: e.target.value })}
                                placeholder="e.g. O+"
                            />
                        </div>
                    </div>

                    <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                        <label className="form-label">Known Allergies</label>
                        <textarea
                            className="form-input"
                            rows="2"
                            value={formData.allergies}
                            onChange={(e) => setFormData({ ...formData, allergies: e.target.value })}
                            placeholder="e.g. Penicillin, Peanuts"
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label">Chronic Conditions</label>
                        <textarea
                            className="form-input"
                            rows="2"
                            value={formData.chronic_conditions}
                            onChange={(e) => setFormData({ ...formData, chronic_conditions: e.target.value })}
                            placeholder="e.g. Asthma, Type 2 Diabetes"
                        />
                    </div>
                </div>
            </Modal>
        </div>
    );
}

export default FamilyManagement;

