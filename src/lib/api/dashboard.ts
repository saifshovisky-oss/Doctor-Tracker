import { api } from './client';
import type { DashboardStats, DoctorCount, NamedCount, Patient, TrendPoint } from '@/lib/types';

export const dashboardApi = {
  stats: () => api.get<DashboardStats>('/dashboard/stats'),
  trends: (params?: { startDate?: string; endDate?: string; months?: number }) =>
    api.get<TrendPoint[]>('/dashboard/patient-trends', params),
  patientsPerDoctor: () => api.get<DoctorCount[]>('/dashboard/patients-per-doctor'),
  conditions: () => api.get<NamedCount[]>('/dashboard/conditions'),
  specializationDistribution: () => api.get<NamedCount[]>('/dashboard/specializations'),
  recentPatients: () => api.get<Patient[]>('/dashboard/recent-patients'),
};
