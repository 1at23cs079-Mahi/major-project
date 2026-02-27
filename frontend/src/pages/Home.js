import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function Home() {
    const { isAuthenticated, user } = useAuth();

    return (
        <div style={{ minHeight: '100vh' }}>
            {/* Navbar */}
            <nav className="navbar">
                <div className="container navbar-content">
                    <h1 className="navbar-brand">🏥 Healthcare System</h1>
                    <div style={{ display: 'flex', gap: '1rem' }}>
                        {isAuthenticated ? (
                            <Link to={`/${user.role.toLowerCase()}/dashboard`} className="btn btn-primary">
                                Dashboard
                            </Link>
                        ) : (
                            <>
                                <Link to="/login" className="btn btn-outline">Login</Link>
                                <Link to="/register" className="btn btn-primary">Register</Link>
                            </>
                        )}
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <div className="container">
                <div className="hero fade-in">
                    <h1 className="hero-title">Your Health, Our Priority</h1>
                    <p className="hero-subtitle">
                        Comprehensive healthcare management platform connecting patients, doctors, pharmacies, and labs
                    </p>
                    <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', marginTop: '2rem' }}>
                        <Link to="/register" className="btn btn-primary" style={{ fontSize: '1.1rem', padding: '1rem 2rem' }}>
                            Get Started
                        </Link>
                        <Link to="/login" className="btn btn-outline" style={{ fontSize: '1.1rem', padding: '1rem 2rem' }}>
                            Sign In
                        </Link>
                    </div>
                </div>

                {/* Features Grid */}
                <div className="grid grid-4" style={{ marginTop: '3rem' }}>
                    <div className="card">
                        <h3 style={{ fontSize: '1.5rem', marginBottom: '1rem', color: 'var(--primary)' }}>👨‍⚕️ For Patients</h3>
                        <p style={{ color: 'var(--text-secondary)' }}>
                            Book appointments, manage prescriptions, view medical history, and access emergency features
                        </p>
                    </div>
                    <div className="card">
                        <h3 style={{ fontSize: '1.5rem', marginBottom: '1rem', color: 'var(--primary)' }}>🩺 For Doctors</h3>
                        <p style={{ color: 'var(--text-secondary)' }}>
                            Manage appointments, create prescriptions, access patient history, and communicate securely
                        </p>
                    </div>
                    <div className="card">
                        <h3 style={{ fontSize: '1.5rem', marginBottom: '1rem', color: 'var(--primary)' }}>💊 For Pharmacies</h3>
                        <p style={{ color: 'var(--text-secondary)' }}>
                            Verify prescriptions, manage inventory, track fulfillment, and upload medicine photos
                        </p>
                    </div>
                    <div className="card">
                        <h3 style={{ fontSize: '1.5rem', marginBottom: '1rem', color: 'var(--primary)' }}>🧪 For Labs</h3>
                        <p style={{ color: 'var(--text-secondary)' }}>
                            Manage test requests, upload reports, and link results to patient records
                        </p>
                    </div>
                </div>

                {/* Key Features */}
                <div style={{ marginTop: '4rem', marginBottom: '4rem' }}>
                    <h2 style={{ textAlign: 'center', fontSize: '2.5rem', marginBottom: '2rem' }}>
                        🌟 Key Features
                    </h2>
                    <div className="grid grid-3">
                        <div className="card">
                            <h4 style={{ color: 'var(--secondary)', marginBottom: '0.5rem' }}>🔒 Secure & Private</h4>
                            <p style={{ color: 'var(--text-secondary)' }}>End-to-end encryption and HIPAA-compliant data handling</p>
                        </div>
                        <div className="card">
                            <h4 style={{ color: 'var(--secondary)', marginBottom: '0.5rem' }}>📱 Emergency Features</h4>
                            <p style={{ color: 'var(--text-secondary)' }}>SOS button, health card QR code, and ambulance request</p>
                        </div>
                        <div className="card">
                            <h4 style={{ color: 'var(--secondary)', marginBottom: '0.5rem' }}>💬 Secure Messaging</h4>
                            <p style={{ color: 'var(--text-secondary)' }}>HIPAA-compliant patient-doctor communication</p>
                        </div>
                        <div className="card">
                            <h4 style={{ color: 'var(--secondary)', marginBottom: '0.5rem' }}>📋 Complete Medical History</h4>
                            <p style={{ color: 'var(--text-secondary)' }}>Lifetime vault for all medical reports and prescriptions</p>
                        </div>
                        <div className="card">
                            <h4 style={{ color: 'var(--secondary)', marginBottom: '0.5rem' }}>💊 Medicine Photos</h4>
                            <p style={{ color: 'var(--text-secondary)' }}>Visual identification with every prescription</p>
                        </div>
                        <div className="card">
                            <h4 style={{ color: 'var(--secondary)', marginBottom: '0.5rem' }}>👨‍👩‍👧‍👦 Family Management</h4>
                            <p style={{ color: 'var(--text-secondary)' }}>Manage health records for entire family</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Home;
