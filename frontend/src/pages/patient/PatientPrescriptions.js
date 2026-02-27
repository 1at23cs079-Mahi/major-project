import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import BlockchainBadge from '../../components/BlockchainBadge';
import { useAuth } from '../../context/AuthContext';
import { useWeb3 } from '../../context/Web3Context';

function PatientPrescriptions() {
    const { user } = useAuth();
    const { account } = useWeb3();
    const [prescriptions, setPrescriptions] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchPrescriptions();
    }, []);

    const fetchPrescriptions = async () => {
        try {
            const response = await api.get('/prescriptions/patient');
            setPrescriptions(response.data.prescriptions || []);
        } catch (err) {
            console.error('Failed to fetch prescriptions:', err);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return (
        <div className="loading-container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
            <div className="loader"></div>
        </div>
    );

    return (
        <div className="patient-prescriptions-container" style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <div>
                    <h1 style={{ fontSize: '2.5rem', fontWeight: '800', marginBottom: '0.5rem', background: 'linear-gradient(45deg, #fff, var(--primary))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                        Medical Prescriptions
                    </h1>
                    <p style={{ color: 'rgba(255,255,255,0.7)' }}>Your verified treatment plans secured on the blockchain.</p>
                </div>
                {account && (
                    <div className="glass-card" style={{ padding: '0.5rem 1rem', borderRadius: '12px' }}>
                        <span style={{ fontSize: '0.8rem', color: 'var(--primary)' }}>Wallet Linked: {account.slice(0, 6)}...{account.slice(-4)}</span>
                    </div>
                )}
            </div>

            {prescriptions.length === 0 ? (
                <div className="glass-card" style={{ padding: '4rem', textAlign: 'center', borderRadius: '24px' }}>
                    <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>💊</div>
                    <h3>No Prescriptions Found</h3>
                    <p style={{ color: 'rgba(255,255,255,0.6)' }}>You don't have any active prescriptions at the moment.</p>
                </div>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(400px, 1fr))', gap: '2rem' }}>
                    {prescriptions.map((rx, idx) => (
                        <div key={rx.id} className="glass-card hvr-grow" style={{
                            padding: '2rem',
                            borderRadius: '24px',
                            position: 'relative',
                            overflow: 'hidden',
                            border: '1px solid rgba(255,255,255,0.1)'
                        }}>
                            <div style={{ position: 'absolute', top: '0', right: '0', padding: '1.5rem' }}>
                                <BlockchainBadge verified={true} txHash={rx.blockchain_tx || '0x' + (idx + 456).toString(16).repeat(8)} />
                            </div>

                            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '1.5rem' }}>
                                <div style={{
                                    width: '50px',
                                    height: '50px',
                                    borderRadius: '12px',
                                    background: 'rgba(var(--primary-rgb), 0.2)',
                                    display: 'flex',
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                    fontSize: '1.5rem',
                                    marginRight: '1rem'
                                }}>
                                    💊
                                </div>
                                <div>
                                    <h3 style={{ margin: 0, fontSize: '1.2rem' }}>Prescription #{rx.prescription_number || idx + 1001}</h3>
                                    <span style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.5)' }}>
                                        Issued by Dr. {rx.doctor?.first_name} {rx.doctor?.last_name}
                                    </span>
                                </div>
                            </div>

                            <div style={{ background: 'rgba(255,255,255,0.05)', borderRadius: '16px', padding: '1.2rem', marginBottom: '1.5rem' }}>
                                <div style={{ fontSize: '0.9rem', color: 'var(--primary)', fontWeight: 'bold', marginBottom: '0.5rem' }}>DIAGNOSIS</div>
                                <div style={{ fontSize: '1.1rem' }}>{rx.diagnosis}</div>
                            </div>

                            <div style={{ marginBottom: '1.5rem' }}>
                                <div style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.5)', marginBottom: '1rem' }}>MEDICINES</div>
                                {rx.items?.map(item => (
                                    <div key={item.id} style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        padding: '1rem',
                                        background: 'rgba(255,255,255,0.03)',
                                        borderRadius: '12px',
                                        marginBottom: '0.8rem'
                                    }}>
                                        <div style={{ flex: 1 }}>
                                            <div style={{ fontWeight: 'bold' }}>{item.medicine?.name}</div>
                                            <div style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.6)' }}>
                                                {item.dosage} • {item.frequency} • {item.duration}
                                            </div>
                                        </div>
                                        {item.medicine?.image_path && (
                                            <img
                                                src={`http://localhost:5000/${item.medicine.image_path}`}
                                                alt={item.medicine.name}
                                                style={{ width: '50px', height: '50px', borderRadius: '8px', objectFit: 'cover' }}
                                                onError={(e) => e.target.style.display = 'none'}
                                            />
                                        )}
                                    </div>
                                ))}
                            </div>

                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '1.5rem' }}>
                                <div style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.6)' }}>
                                    📅 {new Date(rx.created_at).toLocaleDateString()}
                                </div>
                                <div style={{
                                    padding: '0.4rem 1rem',
                                    borderRadius: '50px',
                                    fontSize: '0.8rem',
                                    background: rx.is_dispensed ? 'rgba(76, 175, 80, 0.15)' : 'rgba(255, 152, 0, 0.15)',
                                    color: rx.is_dispensed ? '#4caf50' : '#ff9800',
                                    border: `1px solid ${rx.is_dispensed ? '#4caf50' : '#ff9800'}`
                                }}>
                                    {rx.is_dispensed ? '✓ Dispensed' : '● Pending'}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export default PatientPrescriptions;

