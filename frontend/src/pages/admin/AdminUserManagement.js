import React, { useState, useEffect } from 'react';
import api from '../../services/api';

function AdminUserManagement() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');

    useEffect(() => {
        fetchUsers();
    }, [filter]);

    const fetchUsers = async () => {
        try {
            const response = await api.get(`/admin/users${filter !== 'all' ? `?role=${filter}` : ''}`);
            setUsers(response.data.users);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const activateUser = async (id) => {
        try {
            await api.put(`/admin/users/${id}/activate`);
            fetchUsers();
        } catch (err) {
            alert('Failed to activate user');
        }
    };

    const deactivateUser = async (id) => {
        if (!window.confirm('Deactivate this user?')) return;

        try {
            await api.put(`/admin/users/${id}/deactivate`);
            fetchUsers();
        } catch (err) {
            alert('Failed to deactivate user');
        }
    };

    if (loading) return <div>Loading...</div>;

    return (
        <div className="container">
            <h1>User Management</h1>

            <div style={{ marginBottom: '20px' }}>
                <label>Filter by role: </label>
                <select value={filter} onChange={(e) => setFilter(e.target.value)}>
                    <option value="all">All Users</option>
                    <option value="Patient">Patients</option>
                    <option value="Doctor">Doctors</option>
                    <option value="Pharmacy">Pharmacies</option>
                    <option value="Lab">Labs</option>
                    <option value="Admin">Admins</option>
                </select>
            </div>

            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                    <tr style={{ borderBottom: '1px solid #ccc' }}>
                        <th style={{ padding: '10px', textAlign: 'left' }}>ID</th>
                        <th style={{ padding: '10px', textAlign: 'left' }}>Email</th>
                        <th style={{ padding: '10px', textAlign: 'left' }}>Role</th>
                        <th style={{ padding: '10px', textAlign: 'left' }}>Status</th>
                        <th style={{ padding: '10px', textAlign: 'left' }}>Created</th>
                        <th style={{ padding: '10px', textAlign: 'left' }}>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {users.map(user => (
                        <tr key={user.id} style={{ borderBottom: '1px solid #eee' }}>
                            <td style={{ padding: '10px' }}>{user.id}</td>
                            <td style={{ padding: '10px' }}>{user.email}</td>
                            <td style={{ padding: '10px' }}>{user.role?.name}</td>
                            <td style={{ padding: '10px' }}>{user.is_active ? 'Active' : 'Inactive'}</td>
                            <td style={{ padding: '10px' }}>
                                {new Date(user.created_at).toLocaleDateString()}
                            </td>
                            <td style={{ padding: '10px' }}>
                                {user.is_active ? (
                                    <button onClick={() => deactivateUser(user.id)}>Deactivate</button>
                                ) : (
                                    <button onClick={() => activateUser(user.id)}>Activate</button>
                                )}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

export default AdminUserManagement;
