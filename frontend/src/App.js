import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Web3Provider } from './context/Web3Context';
import { ToastProvider } from './context/ToastContext';
import ErrorBoundary from './components/ErrorBoundary';
import ProtectedRoute from './components/ProtectedRoute';
import './index.css';

// Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import PatientDashboard from './pages/patient/PatientDashboard';
import PatientAppointments from './pages/patient/PatientAppointments';
import PatientPrescriptions from './pages/patient/PatientPrescriptions';
import PatientMedicalRecords from './pages/patient/PatientMedicalRecords';
import FamilyManagement from './pages/patient/FamilyManagement';
import HealthCard from './pages/patient/HealthCard';
import Emergency from './pages/patient/Emergency';
import BlockchainVerification from './pages/patient/BlockchainVerification';
import DoctorDashboard from './pages/doctor/DoctorDashboard';
import PharmacyDashboard from './pages/pharmacy/PharmacyDashboard';
import LabDashboard from './pages/lab/LabDashboard';
import AdminDashboard from './pages/admin/AdminDashboard';
import Inventory from './pages/pharmacy/Inventory';
import VerifyPrescription from './pages/pharmacy/VerifyPrescription';
import MedicineUpload from './pages/pharmacy/MedicineUpload';
import ConsentManagement from './pages/patient/ConsentManagement';
import DoctorPatientLookup from './pages/doctor/DoctorPatientLookup';
import DoctorAppointmentCalendar from './pages/doctor/DoctorAppointmentCalendar';
import DoctorCreatePrescription from './pages/doctor/DoctorCreatePrescription';
import AdminUserManagement from './pages/admin/AdminUserManagement';
import AdminApprovals from './pages/admin/AdminApprovals';
import AdminMedicines from './pages/admin/AdminMedicines';
import AdminAuditLogs from './pages/admin/AdminAuditLogs';
import PharmacyVerification from './pages/pharmacy/PharmacyVerification';

function AppRoutes() {
    const { isAuthenticated, user } = useAuth();

    // Redirect to appropriate dashboard based on role
    const getDashboardRoute = () => {
        if (!isAuthenticated) return '/';

        const role = user?.role?.toLowerCase();

        switch (role) {
            case 'patient':
                return '/patient/dashboard';
            case 'doctor':
                return '/doctor/dashboard';
            case 'pharmacy':
                return '/pharmacy/dashboard';
            case 'lab':
                return '/lab/dashboard';
            case 'admin':
                return '/admin/dashboard';
            default:
                return '/';
        }
    };

    return (
        <>
            {/* Skip to main content for accessibility */}
            <a href="#main-content" className="skip-link">
                Skip to main content
            </a>

            <main id="main-content">
                <Routes>
                    {/* Public Routes */}
                    <Route path="/" element={isAuthenticated ? <Navigate to={getDashboardRoute()} /> : <Home />} />
                    <Route path="/login" element={isAuthenticated ? <Navigate to={getDashboardRoute()} /> : <Login />} />
                    <Route path="/register" element={<Register />} />
                    <Route path="/forgot-password" element={<ForgotPassword />} />
                    <Route path="/reset-password/:token" element={<ResetPassword />} />

                    {/* Patient Routes */}
                    <Route
                        path="/patient/dashboard"
                        element={
                            <ProtectedRoute allowedRoles={['Patient']}>
                                <PatientDashboard />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/patient/consent"
                        element={
                            <ProtectedRoute allowedRoles={['Patient']}>
                                <ConsentManagement />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/patient/appointments"
                        element={
                            <ProtectedRoute allowedRoles={['Patient']}>
                                <PatientAppointments />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/patient/prescriptions"
                        element={
                            <ProtectedRoute allowedRoles={['Patient']}>
                                <PatientPrescriptions />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/patient/medical-records"
                        element={
                            <ProtectedRoute allowedRoles={['Patient']}>
                                <PatientMedicalRecords />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/patient/family"
                        element={
                            <ProtectedRoute allowedRoles={['Patient']}>
                                <FamilyManagement />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/patient/health-card"
                        element={
                            <ProtectedRoute allowedRoles={['Patient']}>
                                <HealthCard />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/patient/emergency"
                        element={
                            <ProtectedRoute allowedRoles={['Patient']}>
                                <Emergency />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/patient/verify"
                        element={
                            <ProtectedRoute allowedRoles={['Patient']}>
                                <BlockchainVerification />
                            </ProtectedRoute>
                        }
                    />

                    {/* Doctor Routes */}
                    <Route
                        path="/doctor/dashboard"
                        element={
                            <ProtectedRoute allowedRoles={['Doctor']}>
                                <DoctorDashboard />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/doctor/lookup"
                        element={
                            <ProtectedRoute allowedRoles={['Doctor']}>
                                <DoctorPatientLookup />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/doctor/appointments"
                        element={
                            <ProtectedRoute allowedRoles={['Doctor']}>
                                <DoctorAppointmentCalendar />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/doctor/prescriptions/create"
                        element={
                            <ProtectedRoute allowedRoles={['Doctor']}>
                                <DoctorCreatePrescription />
                            </ProtectedRoute>
                        }
                    />

                    {/* Pharmacy Routes */}
                    <Route
                        path="/pharmacy/dashboard"
                        element={
                            <ProtectedRoute allowedRoles={['Pharmacy']}>
                                <PharmacyDashboard />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/pharmacy/inventory"
                        element={
                            <ProtectedRoute allowedRoles={['Pharmacy']}>
                                <Inventory />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/pharmacy/verify"
                        element={
                            <ProtectedRoute allowedRoles={['Pharmacy']}>
                                <VerifyPrescription />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/pharmacy/upload"
                        element={
                            <ProtectedRoute allowedRoles={['Pharmacy']}>
                                <MedicineUpload />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/pharmacy/verification"
                        element={
                            <ProtectedRoute allowedRoles={['Pharmacy']}>
                                <PharmacyVerification />
                            </ProtectedRoute>
                        }
                    />

                    {/* Lab Routes */}
                    <Route
                        path="/lab/dashboard"
                        element={
                            <ProtectedRoute allowedRoles={['Lab']}>
                                <LabDashboard />
                            </ProtectedRoute>
                        }
                    />

                    {/* Admin Routes */}
                    <Route
                        path="/admin/dashboard"
                        element={
                            <ProtectedRoute allowedRoles={['Admin']}>
                                <AdminDashboard />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/admin/users"
                        element={
                            <ProtectedRoute allowedRoles={['Admin']}>
                                <AdminUserManagement />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/admin/approvals"
                        element={
                            <ProtectedRoute allowedRoles={['Admin']}>
                                <AdminApprovals />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/admin/medicines"
                        element={
                            <ProtectedRoute allowedRoles={['Admin']}>
                                <AdminMedicines />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/admin/audit-logs"
                        element={
                            <ProtectedRoute allowedRoles={['Admin']}>
                                <AdminAuditLogs />
                            </ProtectedRoute>
                        }
                    />

                    {/* 404 */}
                    <Route path="*" element={<Navigate to="/" />} />
                </Routes>
            </main>
        </>
    );
}

function App() {
    return (
        <ErrorBoundary>
            <Router>
                <AuthProvider>
                    <Web3Provider>
                        <ToastProvider>
                            <AppRoutes />
                        </ToastProvider>
                    </Web3Provider>
                </AuthProvider>
            </Router>
        </ErrorBoundary>
    );
}

export default App;
