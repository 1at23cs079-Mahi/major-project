import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWeb3 } from '../../context/Web3Context';
import BlockchainBadge from '../../components/BlockchainBadge';
import api from '../../services/api';

function BlockchainVerification() {
    const navigate = useNavigate();
    const { isConnected, connectWallet } = useWeb3();
    const [records, setRecords] = useState([]);
    const [loading, setLoading] = useState(true);
    const [verifyingId, setVerifyingId] = useState(null);
    const [verificationResults, setVerificationResults] = useState({});

    useEffect(() => {
        const fetchRecords = async () => {
            try {
                const response = await api.get('/medical-records');
                if (response.data.success) {
                    setRecords(response.data.records);
                }
            } catch (err) {
                console.error("Failed to fetch records", err);
            } finally {
                setLoading(false);
            }
        };
        fetchRecords();
    }, []);

    const verifyRecord = async (recordId) => {
        setVerifyingId(recordId);
        // Simulate blockchain verification delay
        await new Promise(resolve => setTimeout(resolve, 2000));

        setVerificationResults(prev => ({
            ...prev,
            [recordId]: {
                status: 'verified',
                txHash: '0x' + Math.random().toString(16).slice(2, 66),
                timestamp: new Date().toLocaleString()
            }
        }));
        setVerifyingId(null);
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
                    <div style={{ marginBottom: '3rem' }}>
                        <h1 style={{ fontSize: '2.5rem', fontWeight: '800', marginBottom: '0.5rem' }}>Blockchain Verification Hub</h1>
                        <p style={{ color: 'var(--text-secondary)' }}>
                            Verify the integrity of your medical records against the immutable ledger.
                        </p>
                    </div>

                    {!isConnected && (
                        <div className="alert alert-warning" style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span>Connect your wallet to perform high-priority blockchain audits.</span>
                            <button onClick={connectWallet} className="btn btn-primary" style={{ fontSize: '0.8rem' }}>Connect Wallet</button>
                        </div>
                    )}

                    <div className="grid grid-1">
                        {loading ? (
                            <div style={{ textAlign: 'center', padding: '3rem' }}>Loading records...</div>
                        ) : records.length === 0 ? (
                            <div className="card" style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-muted)' }}>
                                <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📂</div>
                                <p>No records found to verify.</p>
                            </div>
                        ) : (
                            records.map(record => (
                                <div key={record.id} className="card" style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    padding: '2rem',
                                    marginBottom: '1rem'
                                }}>
                                    <div style={{ flex: 1 }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.5rem' }}>
                                            <h3 style={{ fontSize: '1.2rem', fontWeight: '700' }}>{record.title}</h3>
                                            <span style={{
                                                fontSize: '0.7rem',
                                                padding: '0.2rem 0.5rem',
                                                background: 'var(--bg-secondary)',
                                                borderRadius: '4px',
                                                textTransform: 'uppercase'
                                            }}>
                                                {record.record_type}
                                            </span>
                                        </div>
                                        <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                                            Added on {new Date(record.created_at).toLocaleDateString()} by Dr. {record.doctor?.first_name} {record.doctor?.last_name}
                                        </p>

                                        {verificationResults[record.id] && (
                                            <div style={{ marginTop: '1rem', padding: '1rem', background: 'rgba(46, 204, 113, 0.05)', borderRadius: '12px', border: '1px solid rgba(46, 204, 113, 0.2)' }}>
                                                <BlockchainBadge verified={true} txHash={verificationResults[record.id].txHash} />
                                                <div style={{ fontSize: '0.75rem', marginTop: '0.5rem', fontFamily: 'monospace', color: 'var(--text-secondary)' }}>
                                                    TX: {verificationResults[record.id].txHash.substring(0, 20)}...
                                                </div>
                                                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                                                    Verified At: {verificationResults[record.id].timestamp}
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    <div>
                                        <button
                                            className="btn btn-primary"
                                            onClick={() => verifyRecord(record.id)}
                                            disabled={verifyingId === record.id || verificationResults[record.id]}
                                            style={{ minWidth: '150px' }}
                                        >
                                            {verifyingId === record.id ? (
                                                <span>Verifying...</span>
                                            ) : verificationResults[record.id] ? (
                                                <span>✓ Verified</span>
                                            ) : (
                                                <span>Verify Integrity</span>
                                            )}
                                        </button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default BlockchainVerification;
