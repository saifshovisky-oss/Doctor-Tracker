import { api } from './client';
import type { Condition, ConditionFormValues, ListParams, Paginated } from '@/lib/types';

export const conditionsApi = {
  list: (params: ListParams) =>
    api.get<Paginated<Condition>>('/conditions', { ...params } as Record<string, string | number | undefined>),
  create: (values: ConditionFormValues) => api.post<Condition>('/conditions', values),
  update: (id: string, values: ConditionFormValues) => api.patch<Condition>(`/conditions/${id}`, values),
  delete: (id: string) => api.delete<{ id: string }>(`/conditions/${id}`),
};
