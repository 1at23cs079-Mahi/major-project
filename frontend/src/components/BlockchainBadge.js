import React from 'react';

const BlockchainBadge = ({ verified, txHash }) => {
    if (!verified) return null;

    return (
        <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.4rem',
            padding: '0.2rem 0.6rem',
            borderRadius: '20px',
            backgroundColor: 'rgba(16, 185, 129, 0.1)',
            border: '1px solid var(--secondary)',
            color: 'var(--secondary)',
            fontSize: '0.75rem',
            fontWeight: '600',
            marginTop: '0.5rem'
        }} title={txHash ? `TX: ${txHash}` : 'Verified on Blockchain'}>
            <span style={{ fontSize: '1rem' }}>🛡️</span>
            Verified on Blockchain
        </div>
    );
};

export default BlockchainBadge;
