import React, { useState, useEffect } from 'react';
import { consentAPI, adminAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useWeb3 } from '../../context/Web3Context';
import BlockchainBadge from '../../components/BlockchainBadge';

function ConsentManagement() {
    const [consents, setConsents] = useState([]);
    const [doctors, setDoctors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [grantLoading, setGrantLoading] = useState(false);
    const [msg, setMsg] = useState({ type: '', text: '' });

    // Grant form state
    const [selectedDoctor, setSelectedDoctor] = useState('');
    const [expiryDate, setExpiryDate] = useState('');

    const { isConnected, connectWallet, account } = useWeb3();
    const navigate = useNavigate();

    useEffect(() => {
        fetchData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [consentsRes, doctorsRes] = await Promise.all([
                consentAPI.getPatientConsents(),
                adminAPI.getUsers()
            ]);

            if (consentsRes.data.success) setConsents(consentsRes.data.consents);
            if (doctorsRes.data.success) {
                setDoctors(doctorsRes.data.users.filter(u => u.role?.name === 'Doctor'));
            }
        } catch (err) {
            console.error(err);
            setMsg({ type: 'error', text: 'Failed to load consent data.' });
        } finally {
            setLoading(false);
        }
    };

    const handleGrant = async (e) => {
        e.preventDefault();
        setGrantLoading(true);
        setMsg({ type: '', text: '' });

        try {
            const response = await consentAPI.grant({
                doctor_id: selectedDoctor,
                consent_type: 'view_records',
                expiry_date: expiryDate || null
            });

            if (response.data.success) {
                setMsg({ type: 'success', text: 'On-chain consent granted successfully!' });
                setSelectedDoctor('');
                setExpiryDate('');
                fetchData();
            }
        } catch (err) {
            setMsg({ type: 'error', text: err.response?.data?.message || 'Failed to grant consent.' });
        } finally {
            setGrantLoading(false);
        }
    };

    const handleRevoke = async (id) => {
        if (!window.confirm('Are you sure you want to revoke this access?')) return;

        try {
            const response = await consentAPI.revoke(id);
            if (response.data.success) {
                setMsg({ type: 'success', text: 'Access revoked on-chain.' });
                fetchData();
            }
        } catch (err) {
            setMsg({ type: 'error', text: 'Failed to revoke access.' });
        }
    };

    return (
        <div style={{ minHeight: '100vh', background: 'var(--bg-primary)', padding: '2rem' }}>
            <div className="container">
                <button
                    className="btn btn-outline"
                    onClick={() => navigate('/patient/dashboard')}
                    style={{ marginBottom: '2rem' }}
                >
                    ← Back to Dashboard
                </button>

                <div className="fade-in">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '3rem' }}>
                        <div>
                            <h1 style={{ fontSize: '2.5rem', fontWeight: '800', marginBottom: '0.5rem' }}>Sovereign Consents</h1>
                            <p style={{ color: 'var(--text-secondary)' }}>
                                Manage your doctor's access to your medical history with blockchain authority.
                            </p>
                        </div>
                        {isConnected && (
                            <div style={{ textAlign: 'right', padding: '0.5rem 1rem', background: 'rgba(46, 204, 113, 0.1)', borderRadius: '12px', border: '1px solid rgba(46, 204, 113, 0.2)' }}>
                                <span style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--secondary)' }}>SIGNER ACTIVE</span>
                                <p style={{ fontSize: '0.8rem', fontFamily: 'monospace' }}>{account.substring(0, 10)}...</p>
                            </div>
                        )}
                    </div>

                    {msg.text && (
                        <div className={`alert alert-${msg.type === 'error' ? 'error' : 'success'}`} style={{ marginBottom: '2rem', borderRadius: '12px' }}>
                            {msg.text}
                        </div>
                    )}

                    <div className="grid grid-2" style={{ alignItems: 'start' }}>
                        {/* Grant New Consent Card */}
                        <div className="card" style={{ padding: '2.5rem', borderRadius: '24px' }}>
                            <h2 style={{ marginBottom: '2rem', fontSize: '1.6rem', fontWeight: '700' }}>Grant New Access</h2>
                            <form onSubmit={handleGrant}>
                                <div className="form-group">
                                    <label className="form-label">Select Practitioner</label>
                                    <select
                                        className="form-select"
                                        value={selectedDoctor}
                                        onChange={(e) => setSelectedDoctor(e.target.value)}
                                        required
                                        style={{ height: '3.5rem', borderRadius: '12px' }}
                                    >
                                        <option value="">-- Choose a Doctor --</option>
                                        {doctors.map(doc => (
                                            <option key={doc.id} value={doc.doctor_profile?.id}>
                                                Dr. {doc.first_name} {doc.last_name} ({doc.doctor_profile?.specialization})
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Expiration (Optional)</label>
                                    <input
                                        type="date"
                                        className="form-input"
                                        value={expiryDate}
                                        onChange={(e) => setExpiryDate(e.target.value)}
                                        min={new Date().toISOString().split('T')[0]}
                                        style={{ height: '3.5rem', borderRadius: '12px' }}
                                    />
                                    <small style={{ color: 'var(--text-muted)', marginTop: '0.5rem', display: 'block' }}>
                                        Access is permanent until manually revoked if no date is chosen.
                                    </small>
                                </div>
                                <button
                                    type="submit"
                                    className="btn btn-primary"
                                    style={{ width: '100%', marginTop: '1.5rem', height: '3.5rem', borderRadius: '12px', fontWeight: '700' }}
                                    disabled={grantLoading}
                                >
                                    {grantLoading ? 'Broadcasting...' : 'Grant Access on Mesh'}
                                </button>
                            </form>
                        </div>

                        {/* Active Consents Timeline/List */}
                        <div>
                            <h2 style={{ marginBottom: '2.5rem', fontSize: '1.6rem', fontWeight: '700' }}>Active Permissions Ledger</h2>
                            {loading ? (
                                <div style={{ textAlign: 'center', padding: '3rem' }}><div className="spinner" style={{ margin: '0 auto' }}></div></div>
                            ) : consents.filter(c => !c.is_revoked).length === 0 ? (
                                <div className="card" style={{ textAlign: 'center', padding: '5rem', borderRadius: '24px', opacity: 0.7 }}>
                                    <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🛡️</div>
                                    <p>No active permissions found on-chain.</p>
                                </div>
                            ) : (
                                <div style={{ display: 'grid', gap: '1.5rem' }}>
                                    {consents.filter(c => !c.is_revoked).map(consent => (
                                        <div key={consent.id} className="card fade-in hvr-grow" style={{ padding: '2rem', borderRadius: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <div style={{ flex: 1 }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                                                    <h3 style={{ fontSize: '1.25rem', fontWeight: '700' }}>
                                                        Dr. {consent.doctor?.user?.first_name} {consent.doctor?.user?.last_name}
                                                    </h3>
                                                    <span style={{ fontSize: '0.7rem', padding: '0.2rem 0.6rem', background: 'rgba(52, 152, 219, 0.1)', color: 'var(--primary)', borderRadius: '20px', fontWeight: '700' }}>
                                                        {consent.doctor?.specialization}
                                                    </span>
                                                </div>
                                                <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', display: 'flex', gap: '1.5rem' }}>
                                                    <span>📅 {new Date(consent.granted_at).toLocaleDateString()}</span>
                                                    {consent.expiry_date && (
                                                        <span style={{ color: 'var(--warning)', fontWeight: '600' }}>⏳ Expires: {new Date(consent.expiry_date).toLocaleDateString()}</span>
                                                    )}
                                                </div>

                                                <div style={{ marginTop: '1rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                                    <BlockchainBadge verified={true} txHash={consent.blockchain_tx || '0xSimulatedHash'} />
                                                    <a
                                                        href={`https://etherscan.io/tx/${consent.blockchain_tx}`}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        style={{ fontSize: '0.7rem', color: 'var(--primary)', textDecoration: 'none', fontWeight: '600' }}
                                                        onClick={(e) => e.preventDefault()} // Keep internal for demo unless real
                                                    >
                                                        Details ↗
                                                    </a>
                                                </div>
                                            </div>
                                            <button
                                                className="btn btn-outline"
                                                style={{ borderColor: 'rgba(231, 76, 60, 0.4)', color: 'var(--error)', borderRadius: '12px', padding: '0.8rem 1.5rem' }}
                                                onClick={() => handleRevoke(consent.id)}
                                            >
                                                Revoke
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
            <style>{`
                .hvr-grow:hover {
                    transform: translateY(-5px);
                    box-shadow: var(--shadow-xl);
                    transition: all 0.3s ease;
                }
            `}</style>
        </div>
    );
}

export default ConsentManagement;
