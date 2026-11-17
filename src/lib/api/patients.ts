import { api } from './client';
import type { ListParams, Paginated, Patient, PatientFormValues } from '@/lib/types';

export const patientsApi = {
  list: (params: ListParams) =>
    api.get<Paginated<Patient>>('/patients', { ...params } as Record<string, string | number | undefined>),
  get: (id: string) => api.get<Patient>(`/patients/${id}`),
  create: (values: PatientFormValues) => api.post<Patient>('/patients', values),
  update: (id: string, values: Partial<PatientFormValues>) => api.patch<Patient>(`/patients/${id}`, values),
  delete: (id: string) => api.delete<{ id: string }>(`/patients/${id}`),
  conditions: () => api.get<string[]>('/patients/conditions'),
};
