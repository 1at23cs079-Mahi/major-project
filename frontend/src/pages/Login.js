import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useWeb3 } from '../context/Web3Context';
import { authAPI } from '../services/api';

function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const { login, setToken, setUser } = useAuth(); // Assuming setToken/setUser are exposed or I need to expose them
    // Wait, AuthContext doesn't expose setToken/setUser in the `value` object in step 352.
    // It exposes: user, token, login, logout, register, isAuthenticated, loading.
    // I should add `loginWithWallet` to AuthContext.

    const { connectWallet, account, isConnected, signMessage } = useWeb3();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        const result = await login(email, password);

        if (result.success) {
            // Success result comes from AuthContext which already set the user
            // We navigate to / which will let AppRoutes handle the role-based redirection
            navigate('/');
        } else {
            setError(result.message);
        }
        setLoading(false);
    };

    return (
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem', background: 'var(--bg-primary)' }}>
            <div className="card fade-in" style={{ maxWidth: '500px', width: '100%', padding: '2.5rem' }}>
                <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
                    <h1 className="navbar-brand" style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>🏥 Healthcare System</h1>
                    <h2 style={{ marginTop: '1rem', color: 'var(--text-primary)', fontWeight: '700' }}>Welcome Back</h2>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem' }}>Sign in to access your dashboard</p>
                </div>

                {error && <div className="alert alert-error">{error}</div>}

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label className="form-label">Email Address</label>
                        <input
                            type="email"
                            className="form-input"
                            placeholder="your.email@example.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <label className="form-label">Password</label>
                            <Link to="/forgot-password" style={{ fontSize: '0.85rem', color: 'var(--primary)', textDecoration: 'none' }}>
                                Forgot password?
                            </Link>
                        </div>
                        <input
                            type="password"
                            className="form-input"
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        className="btn btn-primary"
                        style={{ width: '100%', marginTop: '1rem', height: '3.5rem', fontSize: '1.1rem', fontWeight: '600' }}
                        disabled={loading}
                    >
                        {loading ? <i className="fas fa-spinner fa-spin"></i> : 'Sign In'}
                    </button>
                </form>

                <div style={{ margin: '2rem 0', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{ flex: 1, height: '1px', background: 'var(--glass-border)' }}></div>
                    <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>OR</span>
                    <div style={{ flex: 1, height: '1px', background: 'var(--glass-border)' }}></div>
                </div>

                <button
                    className="btn"
                    style={{
                        width: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.75rem',
                        background: '#fff',
                        color: '#444',
                        border: '1px solid #ddd',
                        height: '3rem',
                        fontWeight: '500'
                    }}
                    onClick={() => window.location.href = `${process.env.REACT_APP_API_URL || 'http://localhost:5000/api'}/auth/google`}
                >
                    <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" style={{ width: '18px' }} />
                    Continue with Google
                </button>

                <div style={{ marginTop: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
                    Don't have an account?{' '}
                    <Link to="/register" style={{ color: 'var(--primary)', textDecoration: 'none', fontWeight: '700' }}>
                        Create Account
                    </Link>
                </div>

                <div style={{ marginTop: '1.5rem', textAlign: 'center' }}>
                    <Link to="/" style={{ color: 'var(--text-muted)', textDecoration: 'none', fontSize: '0.9rem' }}>
                        ← Back to Homepage
                    </Link>
                </div>

                {/* Demo Credentials */}
                <div style={{ marginTop: '2.5rem', padding: '1rem', background: 'rgba(52, 152, 219, 0.05)', borderRadius: 'var(--radius-sm)', border: '1px dashed var(--primary)' }}>
                    <h4 style={{ fontSize: '0.9rem', color: 'var(--primary)', marginBottom: '0.5rem', fontWeight: '600' }}>Demo Credentials:</h4>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: '0.25rem 0' }}>
                        <strong>Admin:</strong> admin@healthcare.com / Admin@123
                    </p>
                </div>
            </div>
        </div>
    );
}

export default Login;
