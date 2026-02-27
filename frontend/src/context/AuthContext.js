import React, { createContext, useState, useContext, useEffect } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Check if user is logged in on mount
        const storedToken = localStorage.getItem('token');
        const storedUser = localStorage.getItem('user');

        if (storedToken && storedUser && storedUser !== 'undefined') {
            try {
                setToken(storedToken);
                setUser(JSON.parse(storedUser));
            } catch (err) {
                console.error("Failed to parse stored user", err);
                localStorage.removeItem('user');
                localStorage.removeItem('token');
            }
        }
        setLoading(false);
    }, []);

    const login = async (email, password) => {
        try {
            const response = await authAPI.login(email, password);
            const { tokens, user: newUser } = response.data.data;
            const newToken = tokens.accessToken;

            setToken(newToken);
            setUser(newUser);
            localStorage.setItem('token', newToken);
            localStorage.setItem('user', JSON.stringify(newUser));

            return { success: true };
        } catch (error) {
            return {
                success: false,
                message: error.response?.data?.message || 'Login failed',
            };
        }
    };

    const logout = () => {
        setToken(null);
        setUser(null);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        authAPI.logout().catch(() => { });
    };

    const register = async (role, data) => {
        try {
            let response;
            switch (role) {
                case 'patient':
                    response = await authAPI.registerPatient(data);
                    break;
                case 'doctor':
                    response = await authAPI.registerDoctor(data);
                    break;
                case 'pharmacy':
                    response = await authAPI.registerPharmacy(data);
                    break;
                case 'lab':
                    response = await authAPI.registerLab(data);
                    break;
                default:
                    throw new Error('Invalid role');
            }

            // Auto-login for patients
            if (role === 'patient' && response.data.data?.tokens) {
                const { tokens, user: newUser } = response.data.data;
                const newToken = tokens.accessToken;
                setToken(newToken);
                setUser(newUser);
                localStorage.setItem('token', newToken);
                localStorage.setItem('user', JSON.stringify(newUser));
            }

            return { success: true, data: response.data };
        } catch (error) {
            console.error('Registration error:', error);
            console.error('Error response:', error.response?.data);
            return {
                success: false,
                message: error.response?.data?.message || 'Registration failed',
                errors: error.response?.data?.errors || null
            };
        }
    };

    const loginWithWallet = async (walletAddress, signature) => {
        try {
            // Check if authAPI has this method, if not we might need to use generic post
            const response = await authAPI.loginWithWallet({ walletAddress, signature });
            const { tokens, user: newUser } = response.data.data; // Assuming same structure
            const newToken = tokens.accessToken;

            setToken(newToken);
            setUser(newUser);
            localStorage.setItem('token', newToken);
            localStorage.setItem('user', JSON.stringify(newUser));

            return { success: true };
        } catch (error) {
            return {
                success: false,
                message: error.response?.data?.message || 'Wallet login failed',
            };
        }
    };

    const value = {
        user,
        token,
        login,
        logout,
        register,
        loginWithWallet,
        isAuthenticated: !!token,
        loading,
    };

    if (loading) {
        return <div className="loading">Loading...</div>;
    }

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

export default AuthContext;
