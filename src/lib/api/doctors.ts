import { api } from './client';
import type { Doctor, DoctorFormValues, ListParams, Paginated } from '@/lib/types';

export const doctorsApi = {
  list: (params: ListParams) =>
    api.get<Paginated<Doctor>>('/doctors', { ...params } as Record<string, string | number | undefined>),
  get: (id: string) => api.get<Doctor>(`/doctors/${id}`),
  create: (values: DoctorFormValues) => api.post<Doctor>('/doctors', values),
  update: (id: string, values: Partial<DoctorFormValues>) => api.patch<Doctor>(`/doctors/${id}`, values),
  delete: (id: string) => api.delete<{ id: string }>(`/doctors/${id}`),
  specializations: () => api.get<string[]>('/doctors/specializations'),
};
