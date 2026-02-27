/**
 * React Query hooks for Healthcare API
 */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api, { authApi, patientApi, appointmentApi, prescriptionApi, auditApi } from './api';

// =============================================================================
// AUTH HOOKS
// =============================================================================
export function useProfile() {
  return useQuery({
    queryKey: ['profile'],
    queryFn: () => authApi.getProfile(),
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: false,
  });
}

export function useLogin() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ email, password }) => authApi.login(email, password),
    onSuccess: (data) => {
      queryClient.setQueryData(['profile'], data);
      queryClient.invalidateQueries({ queryKey: ['profile'] });
    },
  });
}

export function useRegister() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (userData) => authApi.register(userData),
    onSuccess: (data) => {
      queryClient.setQueryData(['profile'], data);
      queryClient.invalidateQueries({ queryKey: ['profile'] });
    },
  });
}

export function useLogout() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: () => authApi.logout(),
    onSuccess: () => {
      queryClient.clear();
    },
  });
}

export function useChangePassword() {
  return useMutation({
    mutationFn: ({ currentPassword, newPassword }) => 
      authApi.changePassword(currentPassword, newPassword),
  });
}

// =============================================================================
// PATIENT HOOKS
// =============================================================================
export function usePatients(params = {}) {
  return useQuery({
    queryKey: ['patients', params],
    queryFn: () => patientApi.getAll(params),
    staleTime: 2 * 60 * 1000,
  });
}

export function usePatient(id) {
  return useQuery({
    queryKey: ['patient', id],
    queryFn: () => patientApi.getById(id),
    enabled: !!id,
  });
}

export function useMyPatientProfile() {
  return useQuery({
    queryKey: ['myPatient'],
    queryFn: () => patientApi.getMe(),
    staleTime: 5 * 60 * 1000,
  });
}

export function useUpdatePatient() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }) => patientApi.update(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['patient', id] });
      queryClient.invalidateQueries({ queryKey: ['patients'] });
      queryClient.invalidateQueries({ queryKey: ['myPatient'] });
    },
  });
}

export function usePatientMedicalHistory(id) {
  return useQuery({
    queryKey: ['patient', id, 'medicalHistory'],
    queryFn: () => patientApi.getMedicalHistory(id),
    enabled: !!id,
  });
}

export function usePatientAppointments(id) {
  return useQuery({
    queryKey: ['patient', id, 'appointments'],
    queryFn: () => patientApi.getAppointments(id),
    enabled: !!id,
  });
}

export function usePatientPrescriptions(id) {
  return useQuery({
    queryKey: ['patient', id, 'prescriptions'],
    queryFn: () => patientApi.getPrescriptions(id),
    enabled: !!id,
  });
}

// =============================================================================
// APPOINTMENT HOOKS
// =============================================================================
export function useAppointments(params = {}) {
  return useQuery({
    queryKey: ['appointments', params],
    queryFn: () => appointmentApi.getAll(params),
    staleTime: 60 * 1000,
  });
}

export function useAppointment(id) {
  return useQuery({
    queryKey: ['appointment', id],
    queryFn: () => appointmentApi.getById(id),
    enabled: !!id,
  });
}

export function useCreateAppointment() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data) => appointmentApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
    },
  });
}

export function useUpdateAppointment() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }) => appointmentApi.update(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['appointment', id] });
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
    },
  });
}

export function useCancelAppointment() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, reason }) => appointmentApi.cancel(id, reason),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['appointment', id] });
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
    },
  });
}

export function useConfirmAppointment() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id) => appointmentApi.confirm(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['appointment', id] });
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
    },
  });
}

export function useCompleteAppointment() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, notes }) => appointmentApi.complete(id, notes),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['appointment', id] });
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
    },
  });
}

export function useDoctorAvailability(doctorId, date) {
  return useQuery({
    queryKey: ['doctorAvailability', doctorId, date],
    queryFn: () => appointmentApi.getDoctorAvailability(doctorId, date),
    enabled: !!doctorId,
    staleTime: 5 * 60 * 1000,
  });
}

// =============================================================================
// PRESCRIPTION HOOKS
// =============================================================================
export function usePrescriptions(params = {}) {
  return useQuery({
    queryKey: ['prescriptions', params],
    queryFn: () => prescriptionApi.getAll(params),
    staleTime: 2 * 60 * 1000,
  });
}

export function usePrescription(id) {
  return useQuery({
    queryKey: ['prescription', id],
    queryFn: () => prescriptionApi.getById(id),
    enabled: !!id,
  });
}

export function useCreatePrescription() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data) => prescriptionApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['prescriptions'] });
    },
  });
}

export function useUpdatePrescription() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }) => prescriptionApi.update(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['prescription', id] });
      queryClient.invalidateQueries({ queryKey: ['prescriptions'] });
    },
  });
}

export function useFillPrescription() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, pharmacyId }) => prescriptionApi.fill(id, pharmacyId),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['prescription', id] });
      queryClient.invalidateQueries({ queryKey: ['prescriptions'] });
    },
  });
}

export function useCancelPrescription() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id) => prescriptionApi.cancel(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['prescription', id] });
      queryClient.invalidateQueries({ queryKey: ['prescriptions'] });
    },
  });
}

export function useRefillPrescriptionItem() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ prescriptionId, itemId }) => 
      prescriptionApi.refillItem(prescriptionId, itemId),
    onSuccess: (_, { prescriptionId }) => {
      queryClient.invalidateQueries({ queryKey: ['prescription', prescriptionId] });
      queryClient.invalidateQueries({ queryKey: ['prescriptions'] });
    },
  });
}

// =============================================================================
// AUDIT HOOKS
// =============================================================================
export function useAuditLogs(params = {}) {
  return useQuery({
    queryKey: ['auditLogs', params],
    queryFn: () => auditApi.getAll(params),
    staleTime: 30 * 1000,
  });
}

export function useUserAuditLogs(userId, params = {}) {
  return useQuery({
    queryKey: ['auditLogs', 'user', userId, params],
    queryFn: () => auditApi.getByUser(userId, params),
    enabled: !!userId,
  });
}

export function useEntityAuditLogs(entityType, entityId) {
  return useQuery({
    queryKey: ['auditLogs', 'entity', entityType, entityId],
    queryFn: () => auditApi.getByEntity(entityType, entityId),
    enabled: !!entityType && !!entityId,
  });
}
