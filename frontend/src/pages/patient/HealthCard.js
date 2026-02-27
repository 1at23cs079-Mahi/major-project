import React from 'react';
import { useNavigate } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';
import { useAuth } from '../../context/AuthContext';
import { useWeb3 } from '../../context/Web3Context';

function HealthCard() {
    const navigate = useNavigate();
    const { user } = useAuth();
    const { account, isConnected } = useWeb3();

    const patientData = JSON.stringify({
        id: user?.id,
        name: `${user?.profile?.first_name} ${user?.profile?.last_name}`,
        bloodGroup: user?.profile?.blood_group,
        address: account || 'Wallet Not Connected'
    });

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

                <div className="fade-in" style={{ display: 'flex', justifyContent: 'center' }}>
                    <div className="card" style={{
                        width: '100%',
                        maxWidth: '450px',
                        padding: '0',
                        overflow: 'hidden',
                        borderRadius: '24px',
                        boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
                        background: '#fff'
                    }}>
                        {/* Header */}
                        <div style={{
                            background: 'linear-gradient(135deg, var(--primary), var(--secondary))',
                            padding: '2rem',
                            color: '#fff',
                            textAlign: 'center'
                        }}>
                            <h2 style={{ fontSize: '1.5rem', fontWeight: '800', marginBottom: '0.5rem' }}>Digital Health Card</h2>
                            <p style={{ opacity: 0.8, fontSize: '0.9rem' }}>Blockchain Verified Identity</p>
                        </div>

                        {/* Body */}
                        <div style={{ padding: '2.5rem', textAlign: 'center' }}>
                            <div style={{
                                display: 'inline-block',
                                padding: '1.5rem',
                                background: '#f8f9fa',
                                borderRadius: '20px',
                                border: '2px solid #edf2f7',
                                marginBottom: '2rem'
                            }}>
                                <QRCodeSVG
                                    value={patientData}
                                    size={200}
                                    level="H"
                                    includeMargin={true}
                                />
                            </div>

                            <div style={{ textAlign: 'left', marginBottom: '2rem' }}>
                                <div style={{ marginBottom: '1rem' }}>
                                    <label style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Patient Name</label>
                                    <p style={{ fontSize: '1.1rem', fontWeight: '600' }}>{user?.profile?.first_name} {user?.profile?.last_name}</p>
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                                    <div>
                                        <label style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Blood Group</label>
                                        <p style={{ fontSize: '1.1rem', fontWeight: '600' }}>{user?.profile?.blood_group || 'Not Set'}</p>
                                    </div>
                                    <div>
                                        <label style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Patient ID</label>
                                        <p style={{ fontSize: '1.1rem', fontWeight: '600' }}>#{user?.id?.toString().padStart(5, '0')}</p>
                                    </div>
                                </div>
                                <div style={{ marginTop: '1rem' }}>
                                    <label style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Blockchain Wallet</label>
                                    <p style={{ fontSize: '0.85rem', fontWeight: '600', color: 'var(--primary)', overflowWrap: 'break-word' }}>
                                        {account || 'No Wallet Connected'}
                                    </p>
                                </div>
                            </div>

                            <button
                                onClick={() => window.print()}
                                className="btn btn-primary"
                                style={{ width: '100%', height: '3.5rem', borderRadius: '12px' }}
                            >
                                🖨️ Print Health Card
                            </button>
                        </div>

                        {/* Footer */}
                        <div style={{
                            background: '#f8f9fa',
                            padding: '1rem',
                            textAlign: 'center',
                            fontSize: '0.8rem',
                            color: 'var(--text-muted)',
                            borderTop: '1px solid #edf2f7'
                        }}>
                            Scan to verify patient identity on the network
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default HealthCard;
