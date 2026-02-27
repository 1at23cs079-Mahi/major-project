/**
 * API Service Layer for Healthcare Platform
 * Connects Next.js frontend to NestJS backend
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';

class ApiError extends Error {
  constructor(message, status, data) {
    super(message);
    this.status = status;
    this.data = data;
    this.name = 'ApiError';
  }
}

// Token management
const getAccessToken = () => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('accessToken');
};

const getRefreshToken = () => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('refreshToken');
};

const setTokens = (accessToken, refreshToken) => {
  if (typeof window === 'undefined') return;
  localStorage.setItem('accessToken', accessToken);
  localStorage.setItem('refreshToken', refreshToken);
};

const clearTokens = () => {
  if (typeof window === 'undefined') return;
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
  localStorage.removeItem('user');
};

const getStoredUser = () => {
  if (typeof window === 'undefined') return null;
  const user = localStorage.getItem('user');
  return user ? JSON.parse(user) : null;
};

const setStoredUser = (user) => {
  if (typeof window === 'undefined') return;
  localStorage.setItem('user', JSON.stringify(user));
};

// Base fetch with auth and refresh token logic
async function fetchWithAuth(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  const accessToken = getAccessToken();

  const headers = {
    'Content-Type': 'application/json',
    ...(accessToken && { Authorization: `Bearer ${accessToken}` }),
    ...options.headers,
  };

  const config = {
    ...options,
    headers,
  };

  let response = await fetch(url, config);

  // If unauthorized, try to refresh token
  if (response.status === 401 && getRefreshToken()) {
    const refreshed = await refreshAccessToken();
    if (refreshed) {
      // Retry with new token
      headers.Authorization = `Bearer ${getAccessToken()}`;
      response = await fetch(url, { ...config, headers });
    } else {
      // Refresh failed, redirect to login
      clearTokens();
      if (typeof window !== 'undefined') {
        window.location.href = '/auth/login';
      }
      throw new ApiError('Session expired', 401, null);
    }
  }

  const data = await response.json();

  if (!response.ok) {
    throw new ApiError(
      data.message || 'Request failed',
      response.status,
      data
    );
  }

  return data;
}

async function refreshAccessToken() {
  const refreshToken = getRefreshToken();
  if (!refreshToken) return false;

  try {
    const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
    });

    if (!response.ok) return false;

    const data = await response.json();
    if (data.success && data.data.tokens) {
      setTokens(data.data.tokens.accessToken, data.data.tokens.refreshToken);
      return true;
    }
    return false;
  } catch {
    return false;
  }
}

// =============================================================================
// AUTH API
// =============================================================================
export const authApi = {
  async login(email, password) {
    const response = await fetchWithAuth('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    
    if (response.success && response.data) {
      const { tokens, user } = response.data;
      setTokens(tokens.accessToken, tokens.refreshToken);
      setStoredUser(user);
    }
    
    return response;
  },

  async register(userData) {
    const response = await fetchWithAuth('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
    
    if (response.success && response.data) {
      const { tokens, user } = response.data;
      setTokens(tokens.accessToken, tokens.refreshToken);
      setStoredUser(user);
    }
    
    return response;
  },

  async logout() {
    try {
      await fetchWithAuth('/auth/logout', { method: 'POST' });
    } finally {
      clearTokens();
    }
  },

  async getProfile() {
    return fetchWithAuth('/auth/profile');
  },

  async changePassword(currentPassword, newPassword) {
    return fetchWithAuth('/auth/change-password', {
      method: 'POST',
      body: JSON.stringify({ currentPassword, newPassword }),
    });
  },

  getStoredUser,
  clearTokens,
  isAuthenticated: () => !!getAccessToken(),
};

// =============================================================================
// PATIENT API
// =============================================================================
export const patientApi = {
  async getAll(params = {}) {
    const query = new URLSearchParams(params).toString();
    return fetchWithAuth(`/patients?${query}`);
  },

  async getById(id) {
    return fetchWithAuth(`/patients/${id}`);
  },

  async getMe() {
    return fetchWithAuth('/patients/me');
  },

  async update(id, data) {
    return fetchWithAuth(`/patients/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  async getMedicalHistory(id) {
    return fetchWithAuth(`/patients/${id}/medical-history`);
  },

  async getAppointments(id) {
    return fetchWithAuth(`/patients/${id}/appointments`);
  },

  async getPrescriptions(id) {
    return fetchWithAuth(`/patients/${id}/prescriptions`);
  },

  async addMedicalRecord(id, data) {
    return fetchWithAuth(`/patients/${id}/medical-records`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
};

// =============================================================================
// APPOINTMENT API
// =============================================================================
export const appointmentApi = {
  async getAll(params = {}) {
    const query = new URLSearchParams(params).toString();
    return fetchWithAuth(`/appointments?${query}`);
  },

  async getById(id) {
    return fetchWithAuth(`/appointments/${id}`);
  },

  async create(data) {
    return fetchWithAuth('/appointments', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async update(id, data) {
    return fetchWithAuth(`/appointments/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  async cancel(id, reason) {
    return fetchWithAuth(`/appointments/${id}/cancel`, {
      method: 'PATCH',
      body: JSON.stringify({ reason }),
    });
  },

  async confirm(id) {
    return fetchWithAuth(`/appointments/${id}/confirm`, {
      method: 'PATCH',
    });
  },

  async complete(id, notes) {
    return fetchWithAuth(`/appointments/${id}/complete`, {
      method: 'PATCH',
      body: JSON.stringify({ notes }),
    });
  },

  async getDoctorAvailability(doctorId, date) {
    const params = date ? `?date=${date}` : '';
    return fetchWithAuth(`/appointments/availability/${doctorId}${params}`);
  },
};

// =============================================================================
// PRESCRIPTION API
// =============================================================================
export const prescriptionApi = {
  async getAll(params = {}) {
    const query = new URLSearchParams(params).toString();
    return fetchWithAuth(`/prescriptions?${query}`);
  },

  async getById(id) {
    return fetchWithAuth(`/prescriptions/${id}`);
  },

  async create(data) {
    return fetchWithAuth('/prescriptions', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async update(id, data) {
    return fetchWithAuth(`/prescriptions/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  async fill(id, pharmacyId) {
    return fetchWithAuth(`/prescriptions/${id}/fill`, {
      method: 'PATCH',
      body: JSON.stringify({ pharmacyId }),
    });
  },

  async cancel(id) {
    return fetchWithAuth(`/prescriptions/${id}/cancel`, {
      method: 'PATCH',
    });
  },

  async refillItem(prescriptionId, itemId) {
    return fetchWithAuth(`/prescriptions/${prescriptionId}/items/${itemId}/refill`, {
      method: 'PATCH',
    });
  },
};

// =============================================================================
// AUDIT API
// =============================================================================
export const auditApi = {
  async getAll(params = {}) {
    const query = new URLSearchParams(params).toString();
    return fetchWithAuth(`/audit?${query}`);
  },

  async getByUser(userId, params = {}) {
    const query = new URLSearchParams(params).toString();
    return fetchWithAuth(`/audit/user/${userId}?${query}`);
  },

  async getByEntity(entityType, entityId) {
    return fetchWithAuth(`/audit/entity/${entityType}/${entityId}`);
  },
};

// =============================================================================
// HEALTH API
// =============================================================================
export const healthApi = {
  async check() {
    const response = await fetch(`${API_BASE_URL}/health`);
    return response.json();
  },

  async detailed() {
    return fetchWithAuth('/health/detailed');
  },
};

// =============================================================================
// BLOCKCHAIN API
// =============================================================================
export const blockchainApi = {
  async getStats() {
    const response = await fetch(`${API_BASE_URL}/blockchain/stats`);
    if (!response.ok) throw new ApiError('Failed to fetch chain stats', response.status);
    return response.json();
  },

  async verify(hash) {
    const response = await fetch(`${API_BASE_URL}/blockchain/verify/${hash}`);
    if (!response.ok) throw new ApiError('Verification failed', response.status);
    return response.json();
  },

  async getIntegrity() {
    const response = await fetch(`${API_BASE_URL}/blockchain/integrity`);
    if (!response.ok) throw new ApiError('Integrity check failed', response.status);
    return response.json();
  },

  async getBlock(hash) {
    const response = await fetch(`${API_BASE_URL}/blockchain/block/${hash}`);
    if (!response.ok) throw new ApiError('Block not found', response.status);
    return response.json();
  },

  async getTransactions(params = {}) {
    const query = new URLSearchParams(params).toString();
    return fetchWithAuth(`/blockchain/transactions?${query}`);
  },

  async getMyTransactions(params = {}) {
    const query = new URLSearchParams(params).toString();
    return fetchWithAuth(`/blockchain/my-transactions?${query}`);
  },

  async getRecordHistory(recordId) {
    return fetchWithAuth(`/blockchain/record/${recordId}`);
  },

  async anchorRecord(data) {
    return fetchWithAuth('/blockchain/anchor', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
};

// Default export
const api = {
  auth: authApi,
  patient: patientApi,
  appointment: appointmentApi,
  prescription: prescriptionApi,
  audit: auditApi,
  health: healthApi,
  blockchain: blockchainApi,
};

export default api;
