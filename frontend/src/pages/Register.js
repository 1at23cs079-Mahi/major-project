import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useWeb3 } from '../context/Web3Context';

function Register() {
    const [role, setRole] = useState('patient');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    // Patient fields
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [phone, setPhone] = useState('');
    const [dateOfBirth, setDateOfBirth] = useState('');
    const [gender, setGender] = useState('');
    const [bloodGroup, setBloodGroup] = useState('');
    const [address, setAddress] = useState('');

    // Doctor/Pharmacy/Lab fields
    const [name, setName] = useState('');
    const [licenseNumber, setLicenseNumber] = useState('');
    const [specialization, setSpecialization] = useState('');
    const [qualification, setQualification] = useState('');

    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);
    const [walletError, setWalletError] = useState('');
    const [connectingWallet, setConnectingWallet] = useState(false);

    const { register } = useAuth();
    const { account, connectWallet, disconnectWallet, isConnected, error: web3Error } = useWeb3();
    const navigate = useNavigate();

    // Handle wallet connection
    const handleConnectWallet = async () => {
        setWalletError('');
        setConnectingWallet(true);
        
        // Check if MetaMask is installed
        if (!window.ethereum) {
            setWalletError('MetaMask not detected. Please install MetaMask browser extension.');
            setConnectingWallet(false);
            return;
        }

        try {
            await connectWallet();
            setSuccess('Wallet connected successfully!');
            setTimeout(() => setSuccess(''), 3000);
        } catch (err) {
            setWalletError(err.message || 'Failed to connect wallet');
        } finally {
            setConnectingWallet(false);
        }
    };

    // Handle wallet disconnection
    const handleDisconnectWallet = () => {
        disconnectWallet();
        setWalletError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        if (password !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        if (password.length < 8) {
            setError('Password must be at least 8 characters');
            return;
        }

        // Strong password regex
        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/;
        if (!passwordRegex.test(password)) {
            setError('Password must contain uppercase, lowercase, number, and special character');
            return;
        }

        setLoading(true);

        let data = {
            email,
            password,
            wallet_address: account
        };

        switch (role) {
            case 'patient':
                data = { ...data, firstName, lastName, phone, dateOfBirth, gender, bloodGroup, address };
                break;
            case 'doctor':
                data = { ...data, firstName, lastName, licenseNumber, specialization, qualification, phone };
                break;
            case 'pharmacy':
            case 'lab':
                data = { ...data, name, licenseNumber, phone, address };
                break;
            default:
                break;
        }

        const result = await register(role, data);
        
        console.log('Registration result:', result);

        if (result.success) {
            if (role === 'patient') {
                setSuccess('Account created successfully! Redirecting...');
                setTimeout(() => navigate('/patient/dashboard'), 2000);
            } else {
                setSuccess('Registration submitted successfully! Your account is pending admin approval.');
                setTimeout(() => navigate('/login'), 3000);
            }
        } else {
            if (result.errors && result.errors.length > 0) {
                // Display first validation error
                setError(result.errors[0].msg || result.errors[0].message);
            } else {
                setError(result.message || 'Registration failed. Please try again.');
            }
        }
        setLoading(false);
    };

    return (
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem', background: 'var(--bg-primary)' }}>
            <div className="card fade-in" style={{ maxWidth: '800px', width: '100%', padding: '2.5rem' }}>
                <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
                    <h1 className="navbar-brand" style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>🏥 Healthcare System</h1>
                    <h2 style={{ marginTop: '0.5rem', color: 'var(--text-primary)', fontWeight: '700' }}>Create Your Account</h2>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem' }}>Access premium healthcare services</p>
                </div>

                {error && <div className="alert alert-error" style={{ marginBottom: '1.5rem' }}>{error}</div>}
                {success && <div className="alert alert-success" style={{ marginBottom: '1.5rem' }}>{success}</div>}

                <form onSubmit={handleSubmit}>
                    {/* Role Selection */}
                    <div className="form-group" style={{ marginBottom: '2rem' }}>
                        <label className="form-label" style={{ fontWeight: '600' }}>I am registering as a:</label>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '1rem', marginTop: '0.5rem' }}>
                            {['patient', 'doctor', 'pharmacy', 'lab'].map((r) => (
                                <div
                                    key={r}
                                    onClick={() => setRole(r)}
                                    style={{
                                        padding: '0.75rem',
                                        textAlign: 'center',
                                        borderRadius: 'var(--radius-md)',
                                        border: `2px solid ${role === r ? 'var(--primary)' : 'var(--glass-border)'}`,
                                        background: role === r ? 'rgba(52, 152, 219, 0.1)' : 'transparent',
                                        cursor: 'pointer',
                                        transition: 'all 0.2s ease',
                                        textTransform: 'capitalize',
                                        fontWeight: role === r ? '600' : '400',
                                        color: role === r ? 'var(--primary)' : 'var(--text-secondary)'
                                    }}
                                >
                                    {r}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Web3 Wallet Connection */}
                    <div className="card" style={{
                        background: isConnected ? 'rgba(46, 204, 113, 0.05)' : 'rgba(52, 152, 219, 0.05)',
                        border: `1px solid ${isConnected ? 'var(--success)' : 'var(--primary)'}`,
                        padding: '1.5rem',
                        marginBottom: '2rem',
                        borderRadius: 'var(--radius-md)'
                    }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                            <div style={{ flex: 1, minWidth: '200px' }}>
                                <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    ⛓️ Blockchain Identity
                                    <span style={{ 
                                        fontSize: '0.75rem', 
                                        background: 'rgba(52, 152, 219, 0.15)',
                                        padding: '0.2rem 0.5rem',
                                        borderRadius: '4px',
                                        fontWeight: '500',
                                        color: 'var(--primary)'
                                    }}>
                                        Optional
                                    </span>
                                </h3>
                                <p style={{ margin: '0.5rem 0 0 0', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                                    {isConnected 
                                        ? '✅ Your wallet is connected and will be linked to your account'
                                        : 'Connect your Web3 wallet (MetaMask) for decentralized health records'}
                                </p>
                                {!window.ethereum && !isConnected && (
                                    <p style={{ margin: '0.5rem 0 0 0', fontSize: '0.8rem', color: 'var(--warning)' }}>
                                        ⚠️ MetaMask not detected. <a href="https://metamask.io/download/" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--primary)', textDecoration: 'underline' }}>Install MetaMask</a>
                                    </p>
                                )}
                                {walletError && (
                                    <p style={{ margin: '0.5rem 0 0 0', fontSize: '0.8rem', color: 'var(--error)' }}>
                                        ❌ {walletError}
                                    </p>
                                )}
                            </div>
                            <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                                {isConnected ? (
                                    <>
                                        <div style={{
                                            padding: '0.5rem 1rem',
                                            background: 'var(--success)',
                                            color: '#fff',
                                            borderRadius: '20px',
                                            fontSize: '0.85rem',
                                            fontWeight: '600',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '0.5rem'
                                        }}>
                                            <span style={{ fontSize: '1rem' }}>✅</span>
                                            {account.substring(0, 6)}...{account.substring(account.length - 4)}
                                        </div>
                                        <button
                                            type="button"
                                            onClick={handleDisconnectWallet}
                                            className="btn btn-error"
                                            style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}
                                        >
                                            Disconnect
                                        </button>
                                    </>
                                ) : (
                                    <button
                                        type="button"
                                        onClick={handleConnectWallet}
                                        className="btn btn-primary"
                                        disabled={connectingWallet}
                                        style={{ padding: '0.6rem 1.5rem', fontSize: '0.9rem', fontWeight: '600' }}
                                    >
                                        {connectingWallet ? '🔄 Connecting...' : '🦊 Connect MetaMask'}
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Blockchain Benefits Info */}
                    {!isConnected && (
                        <div style={{
                            background: 'rgba(241, 196, 15, 0.05)',
                            border: '1px solid rgba(241, 196, 15, 0.3)',
                            borderRadius: 'var(--radius-md)',
                            padding: '1rem 1.25rem',
                            marginBottom: '2rem'
                        }}>
                            <p style={{ margin: '0 0 0.5rem 0', fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-primary)' }}>
                                💡 Why connect your wallet?
                            </p>
                            <ul style={{ margin: 0, paddingLeft: '1.5rem', fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: '1.6' }}>
                                <li>🔒 <strong>Secure & Private:</strong> Your medical records are anchored on blockchain</li>
                                <li>🎯 <strong>Full Control:</strong> You own and control access to your health data</li>
                                <li>✅ <strong>Verifiable:</strong> Tamper-proof verification of prescriptions and records</li>
                                <li>🌍 <strong>Portable:</strong> Access your health records anywhere, anytime</li>
                            </ul>
                        </div>
                    )}

                    <div className="grid-2 grid">
                        <div className="form-group">
                            <label className="form-label">Email Address</label>
                            <input
                                type="email"
                                className="form-input"
                                placeholder="name@example.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Phone Number</label>
                            <input
                                type="tel"
                                className="form-input"
                                placeholder="+1 234 567 8900"
                                value={phone}
                                onChange={(e) => setPhone(e.target.value)}
                                required={role !== 'patient'}
                            />
                        </div>
                    </div>

                    {/* Role-specific fields */}
                    {role === 'patient' && (
                        <>
                            <div className="grid-2 grid">
                                <div className="form-group">
                                    <label className="form-label">First Name</label>
                                    <input
                                        type="text"
                                        className="form-input"
                                        placeholder="John"
                                        value={firstName}
                                        onChange={(e) => setFirstName(e.target.value)}
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Last Name</label>
                                    <input
                                        type="text"
                                        className="form-input"
                                        placeholder="Doe"
                                        value={lastName}
                                        onChange={(e) => setLastName(e.target.value)}
                                        required
                                    />
                                </div>
                            </div>
                            <div className="grid-3 grid">
                                <div className="form-group">
                                    <label className="form-label">Date of Birth</label>
                                    <input
                                        type="date"
                                        className="form-input"
                                        value={dateOfBirth}
                                        onChange={(e) => setDateOfBirth(e.target.value)}
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Gender</label>
                                    <select
                                        className="form-select"
                                        value={gender}
                                        onChange={(e) => setGender(e.target.value)}
                                        required
                                    >
                                        <option value="">Select</option>
                                        <option value="Male">Male</option>
                                        <option value="Female">Female</option>
                                        <option value="Other">Other</option>
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Blood Group</label>
                                    <select
                                        className="form-select"
                                        value={bloodGroup}
                                        onChange={(e) => setBloodGroup(e.target.value)}
                                    >
                                        <option value="">Select</option>
                                        {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(bg => (
                                            <option key={bg} value={bg}>{bg}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                            <div className="form-group">
                                <label className="form-label">Address</label>
                                <textarea
                                    className="form-input"
                                    rows="2"
                                    placeholder="Your residential address"
                                    value={address}
                                    onChange={(e) => setAddress(e.target.value)}
                                ></textarea>
                            </div>
                        </>
                    )}

                    {role === 'doctor' && (
                        <>
                            <div className="grid-2 grid">
                                <div className="form-group">
                                    <label className="form-label">First Name</label>
                                    <input
                                        type="text"
                                        className="form-input"
                                        value={firstName}
                                        onChange={(e) => setFirstName(e.target.value)}
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Last Name</label>
                                    <input
                                        type="text"
                                        className="form-input"
                                        value={lastName}
                                        onChange={(e) => setLastName(e.target.value)}
                                        required
                                    />
                                </div>
                            </div>
                            <div className="grid-2 grid">
                                <div className="form-group">
                                    <label className="form-label">License Number</label>
                                    <input
                                        type="text"
                                        className="form-input"
                                        placeholder="MC12345"
                                        value={licenseNumber}
                                        onChange={(e) => setLicenseNumber(e.target.value)}
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Specialization</label>
                                    <input
                                        type="text"
                                        className="form-input"
                                        placeholder="Cardiology, etc."
                                        value={specialization}
                                        onChange={(e) => setSpecialization(e.target.value)}
                                        required
                                    />
                                </div>
                            </div>
                            <div className="form-group">
                                <label className="form-label">Qualification</label>
                                <input
                                    type="text"
                                    className="form-input"
                                    placeholder="MD, MBBS, etc."
                                    value={qualification}
                                    onChange={(e) => setQualification(e.target.value)}
                                    required
                                />
                            </div>
                        </>
                    )}

                    {(role === 'pharmacy' || role === 'lab') && (
                        <>
                            <div className="form-group">
                                <label className="form-label">{role === 'pharmacy' ? 'Pharmacy' : 'Laboratory'} Name</label>
                                <input
                                    type="text"
                                    className="form-input"
                                    placeholder={role === 'pharmacy' ? 'ABC Pharmacy' : 'XYZ Laboratory'}
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label className="form-label">License Number</label>
                                <input
                                    type="text"
                                    className="form-input"
                                    value={licenseNumber}
                                    onChange={(e) => setLicenseNumber(e.target.value)}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label className="form-label">{role === 'pharmacy' ? 'Pharmacy' : 'Laboratory'} Address</label>
                                <textarea
                                    className="form-input"
                                    rows="2"
                                    placeholder="Full street address"
                                    value={address}
                                    onChange={(e) => setAddress(e.target.value)}
                                    required
                                ></textarea>
                            </div>
                        </>
                    )}

                    {/* Password Fields */}
                    <div className="grid-2 grid">
                        <div className="form-group">
                            <label className="form-label">Password</label>
                            <input
                                type="password"
                                className="form-input"
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Confirm Password</label>
                            <input
                                type="password"
                                className="form-input"
                                placeholder="••••••••"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                required
                            />
                        </div>
                    </div>

                    {role !== 'patient' && (
                        <div className="alert alert-warning" style={{ marginTop: '1.5rem', background: 'rgba(241, 196, 15, 0.1)', color: '#d4ac0d', borderColor: 'rgba(241, 196, 15, 0.2)' }}>
                            <i className="fas fa-info-circle"></i> {role.charAt(0).toUpperCase() + role.slice(1)} accounts require verification and admin approval before activation.
                        </div>
                    )}

                    <button
                        type="submit"
                        className="btn btn-primary"
                        style={{ width: '100%', marginTop: '2rem', height: '3.5rem', fontSize: '1.1rem', fontWeight: '600' }}
                        disabled={loading}
                    >
                        {loading ? <i className="fas fa-spinner fa-spin"></i> : 'Create Account'}
                    </button>
                </form>

                <div style={{ marginTop: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
                    Already have an account?{' '}
                    <Link to="/login" style={{ color: 'var(--primary)', textDecoration: 'none', fontWeight: '700' }}>
                        Sign In
                    </Link>
                </div>

                <div style={{ marginTop: '1.5rem', textAlign: 'center' }}>
                    <Link to="/" style={{ color: 'var(--text-muted)', textDecoration: 'none', fontSize: '0.9rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                        <span>←</span> Back to Homepage
                    </Link>
                </div>
            </div>
        </div>
    );
}

export default Register;
