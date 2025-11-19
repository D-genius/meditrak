import api from './api';
import { Patient, Visit, DashboardStats} from '../types';

export const patientService = {
  // Patient CRUD
  getPatients: async (): Promise<Patient[]> => {
    const response = await api.get('/patients');
    return response.data;
  },

  getPatient: async (id: string): Promise<Patient> => {
    const response = await api.get(`/patients/${id}`);
    return response.data;
  },

  createPatient: async (patient: Omit<Patient, 'id' | 'created_at' | 'updated_at'>): Promise<Patient> => {
    const response = await api.post('/patients', patient);
    return response.data;
  },

  updatePatient: async (id: string, patient: Partial<Patient>): Promise<Patient> => {
    const response = await api.put(`/patients/${id}`, patient);
    return response.data;
  },

  deletePatient: async (id: string): Promise<void> => {
    await api.delete(`/patients/${id}`);
  },

  // Visit CRUD
  getPatientVisits: async (patientId: string): Promise<Visit[]> => {
    const response = await api.get(`/patients/${patientId}/visits`);
    return response.data;
  },

  createVisit: async (visit: Omit<Visit, 'id' | 'created_at' | 'updated_at'>): Promise<Visit> => {
    const response = await api.post('/visits', visit);
    return response.data;
  },

  updateVisit: async (id: string, visit: Partial<Visit>): Promise<Visit> => {
    const response = await api.put(`/visits/${id}`, visit);
    return response.data;
  },

  deleteVisit: async (id: string): Promise<void> => {
    await api.delete(`/visits/${id}`);
  },

  searchPatients: async (query: string): Promise<Patient[]> => {
    const response = await api.get(`/patients/search?q=${query}`);
    return response.data;
  },

  getVisits: async (filters?: { startDate?: string; endDate?: string }): Promise<Visit[]> => {
    const response = await api.get('/visits', { params: filters });
    return response.data;
  },

  // Dashboard stats
  getDashboardStats: async (): Promise<DashboardStats> => {
    const response = await api.get('/dashboard/stats');
    return response.data;
  },
};