import axios from 'axios';

const api = axios.create({
    baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor to add token
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor for error handling
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            // Token expired or invalid
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

// Auth API
export const authAPI = {
    registerPatient: (data) => api.post('/auth/register/patient', data),
    registerDoctor: (data) => api.post('/auth/register/doctor', data),
    registerPharmacy: (data) => api.post('/auth/register/pharmacy', data),
    registerLab: (data) => api.post('/auth/register/lab', data),
    login: (email, password) => api.post('/auth/login', { email, password }),
    logout: () => api.post('/auth/logout'),
    requestPasswordReset: (email) => api.post('/auth/password-reset/request', { email }),
    resetPassword: (token, newPassword) => api.post('/auth/password-reset/confirm', { token, newPassword }),
};

// Patient API
export const patientAPI = {
    getProfile: () => api.get('/patient/profile'),
    updateProfile: (data) => api.put('/patient/profile', data),
    getFamilyMembers: () => api.get('/patient/family-members'),
    addFamilyMember: (data) => api.post('/patient/family-members', data),
    getAppointments: () => api.get('/appointments'),
    bookAppointment: (data) => api.post('/appointments/book', data),
    rescheduleAppointment: (id, data) => api.put(`/appointments/${id}/reschedule`, data),
    cancelAppointment: (id) => api.delete(`/appointments/${id}/cancel`),
    getPatientPrescriptions: () => api.get('/prescriptions/patient'),
    getPrescriptionById: (id) => api.get(`/prescriptions/${id}`),
    getHealthCard: () => api.get('/patient/health-card'),
    triggerSOS: (data) => api.post('/patient/emergency/sos', data),

    // Family APIs
    addFamilyMemberToList: (data) => api.post('/family', data),
    updateFamilyMemberInList: (id, data) => api.put(`/family/${id}`, data),
    deleteFamilyMemberFromList: (id) => api.delete(`/family/${id}`),
    getFamilyList: () => api.get('/family'),

    // Insurance APIs
    getInsurance: () => api.get('/insurance'),
    addInsurance: (data) => api.post('/insurance', data),
    updateInsurance: (id, data) => api.put(`/insurance/${id}`, data),
    deactivateInsurance: (id) => api.delete(`/insurance/${id}`),

    // Lab APIs
    uploadReport: (data) => api.post('/medical-records/upload', data),
};

// Medicine API
export const medicineAPI = {
    getAll: (params) => api.get('/medicines', { params }),
    getById: (id) => api.get(`/medicines/${id}`),
    uploadImage: (id, formData) => api.post(`/medicines/${id}/image`, formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    }),
};

// Doctor API
export const doctorAPI = {
    getProfile: () => api.get('/doctor/profile'),
    updateProfile: (data) => api.put('/doctor/profile', data),
    getAppointments: () => api.get('/doctor/appointments/calendar'),
    getQueue: () => api.get('/doctor/appointments/queue'),
    acceptAppointment: (id) => api.put(`/appointments/${id}/accept`),
    rejectAppointment: (id) => api.put(`/appointments/${id}/reject`),
    getPatientRecords: (patientId) => api.get(`/medical-records/doctor/${patientId}`),
    getPatientHistory: (patientId) => api.get(`/doctor/patients/${patientId}/history`),
    createPrescription: (data) => api.post('/doctor/prescriptions', data),
    getMessage: () => api.get('/doctor/messages'),
    sendMessage: (data) => api.post('/doctor/messages', data),
};

// Admin API
export const adminAPI = {
    getDashboard: () => api.get('/admin/dashboard'),
    getUsers: () => api.get('/admin/users'),
    approveDoctor: (id) => api.put(`/admin/doctors/${id}/approve`),
    approvePharmacy: (id) => api.put(`/admin/pharmacies/${id}/approve`),
    getMedicines: () => api.get('/admin/medicines'),
    addMedicine: (data) => api.post('/admin/medicines', data),
    updateMedicine: (id, data) => api.put(`/admin/medicines/${id}`, data),
    deleteMedicine: (id) => api.delete(`/admin/medicines/${id}`),
    getAuditLogs: () => api.get('/admin/audit-logs'),
};

// Pharmacy API
export const pharmacyAPI = {
    verifyPrescription: (data) => api.post('/prescriptions/verify', data),
    markDispensed: (id) => api.put(`/prescriptions/${id}/dispense`),
};

// Consent API
export const consentAPI = {
    grant: (data) => api.post('/consent/grant', data),
    revoke: (id) => api.put(`/consent/${id}/revoke`),
    getPatientConsents: () => api.get('/consent/patient'),
    checkConsent: (patientId, type) => api.get(`/consent/check?patient_id=${patientId}&consent_type=${type || 'view_records'}`),
};

// Blockchain API
export const blockchainAPI = {
    anchorRecord: (data) => api.post('/blockchain/anchor', data),
    verifyRecord: (txHash, recordHash) => api.get(`/blockchain/verify?transactionHash=${txHash}&recordHash=${recordHash}`),
    grantConsent: (data) => api.post('/blockchain/consent/grant', data),
    checkConsent: (patientAddress, providerAddress) => api.get(`/blockchain/consent/check?patientAddress=${patientAddress}&providerAddress=${providerAddress}`),
    getStatus: () => api.get('/blockchain/status'),
};

// Patient Access API (for doctors/labs to lookup patients)
export const patientAccessAPI = {
    initializePatientId: () => api.post('/patient-access/initialize-id'),
    doctorLookup: (uniquePatientId) => api.get(`/patient-access/doctor/lookup?uniquePatientId=${uniquePatientId}`),
    labLookup: (uniquePatientId) => api.get(`/patient-access/lab/lookup?uniquePatientId=${uniquePatientId}`),
    requestConsent: (data) => api.post('/patient-access/request-consent', data),
    scanQR: (qrData) => api.post('/patient-access/scan-qr', { qrData }),
};

// Dashboard API (dynamic data for all roles)
export const dashboardAPI = {
    getPatientDashboard: () => api.get('/dashboard/patient'),
    getDoctorDashboard: () => api.get('/dashboard/doctor'),
    getPharmacyDashboard: () => api.get('/dashboard/pharmacy'),
    getLabDashboard: () => api.get('/dashboard/lab'),
    getAdminDashboard: () => api.get('/dashboard/admin'),
};

export default api;
