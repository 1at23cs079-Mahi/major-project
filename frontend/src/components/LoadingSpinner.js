import React from 'react';

function LoadingSpinner({ size = 'medium', message = 'Loading...' }) {
    const sizes = {
        small: '20px',
        medium: '40px',
        large: '60px'
    };

    return (
        <div
            style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '2rem',
                gap: '1rem'
            }}
            role="status"
            aria-live="polite"
            aria-busy="true"
        >
            <div
                className="spinner"
                style={{
                    width: sizes[size],
                    height: sizes[size],
                    border: '4px solid var(--glass-border)',
                    borderTopColor: 'var(--primary)',
                    borderRadius: '50%',
                    animation: 'spin 1s linear infinite'
                }}
                aria-hidden="true"
            />
            <span className="sr-only">{message}</span>
            <p style={{ color: 'var(--text-secondary)' }}>{message}</p>
        </div>
    );
}

export default LoadingSpinner;
