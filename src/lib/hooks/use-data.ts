'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { dashboardApi } from '@/lib/api/dashboard';
import { conditionsApi } from '@/lib/api/conditions';
import { doctorsApi } from '@/lib/api/doctors';
import { patientsApi } from '@/lib/api/patients';
import type { ConditionFormValues, DoctorFormValues, ListParams, PatientFormValues } from '@/lib/types';

export const queryKeys = {
  doctors: (params?: ListParams) => ['doctors', params] as const,
  doctor: (id: string) => ['doctor', id] as const,
  specializations: ['doctor-specializations'] as const,
  patients: (params?: ListParams) => ['patients', params] as const,
  patient: (id: string) => ['patient', id] as const,
  conditions: ['patient-conditions'] as const,
  conditionsCatalog: (params?: ListParams) => ['conditions', params] as const,
  dashboard: ['dashboard'] as const,
};

function useInvalidate() {
  const client = useQueryClient();
  return () => {
    void client.invalidateQueries({ queryKey: ['doctors'] });
    void client.invalidateQueries({ queryKey: ['patients'] });
    void client.invalidateQueries({ queryKey: ['dashboard'] });
    void client.invalidateQueries({ queryKey: queryKeys.specializations });
    void client.invalidateQueries({ queryKey: queryKeys.conditions });
    void client.invalidateQueries({ queryKey: ['conditions'] });
  };
}

export function useDoctors(params: ListParams) {
  return useQuery({ queryKey: queryKeys.doctors(params), queryFn: () => doctorsApi.list(params) });
}

export function useDoctor(id: string, enabled = true) {
  return useQuery({ queryKey: queryKeys.doctor(id), queryFn: () => doctorsApi.get(id), enabled });
}

export function useSpecializations() {
  return useQuery({ queryKey: queryKeys.specializations, queryFn: doctorsApi.specializations });
}

export function usePatients(params: ListParams) {
  return useQuery({ queryKey: queryKeys.patients(params), queryFn: () => patientsApi.list(params) });
}

export function usePatient(id: string, enabled = true) {
  return useQuery({ queryKey: queryKeys.patient(id), queryFn: () => patientsApi.get(id), enabled });
}

export function useDashboardStats() {
  return useQuery({ queryKey: [...queryKeys.dashboard, 'stats'], queryFn: dashboardApi.stats });
}

export function useDashboardTrends(params?: { startDate?: string; endDate?: string; months?: number }) {
  return useQuery({
    queryKey: [...queryKeys.dashboard, 'trends', params],
    queryFn: () => dashboardApi.trends(params),
  });
}

export function usePatientsPerDoctor() {
  return useQuery({ queryKey: [...queryKeys.dashboard, 'per-doctor'], queryFn: dashboardApi.patientsPerDoctor });
}

export function useConditions() {
  return useQuery({ queryKey: [...queryKeys.dashboard, 'conditions'], queryFn: dashboardApi.conditions });
}

export function usePatientConditions() {
  return useQuery({ queryKey: queryKeys.conditions, queryFn: patientsApi.conditions });
}

export function useSpecializationDistribution() {
  return useQuery({ queryKey: [...queryKeys.dashboard, 'specializations'], queryFn: dashboardApi.specializationDistribution });
}

export function useRecentPatients() {
  return useQuery({ queryKey: [...queryKeys.dashboard, 'recent-patients'], queryFn: dashboardApi.recentPatients });
}

export function useCreateDoctor() {
  const invalidate = useInvalidate();
  return useMutation({
    mutationFn: (values: DoctorFormValues) => doctorsApi.create(values),
    onSuccess: invalidate,
  });
}

export function useUpdateDoctor() {
  const invalidate = useInvalidate();
  return useMutation({
    mutationFn: ({ id, values }: { id: string; values: Partial<DoctorFormValues> }) => doctorsApi.update(id, values),
    onSuccess: invalidate,
  });
}

export function useDeleteDoctor() {
  const invalidate = useInvalidate();
  return useMutation({
    mutationFn: (id: string) => doctorsApi.delete(id),
    onSuccess: invalidate,
  });
}

export function useCreatePatient() {
  const invalidate = useInvalidate();
  return useMutation({
    mutationFn: (values: PatientFormValues) => patientsApi.create(values),
    onSuccess: invalidate,
  });
}

export function useUpdatePatient() {
  const invalidate = useInvalidate();
  return useMutation({
    mutationFn: ({ id, values }: { id: string; values: Partial<PatientFormValues> }) => patientsApi.update(id, values),
    onSuccess: invalidate,
  });
}

export function useDeletePatient() {
  const invalidate = useInvalidate();
  return useMutation({
    mutationFn: (id: string) => patientsApi.delete(id),
    onSuccess: invalidate,
  });
}

/* Conditions catalog */

export function useConditionsCatalog(params: ListParams) {
  return useQuery({ queryKey: queryKeys.conditionsCatalog(params), queryFn: () => conditionsApi.list(params) });
}

export function useCreateCondition() {
  const invalidate = useInvalidate();
  return useMutation({
    mutationFn: (values: ConditionFormValues) => conditionsApi.create(values),
    onSuccess: invalidate,
  });
}

export function useUpdateCondition() {
  const invalidate = useInvalidate();
  return useMutation({
    mutationFn: ({ id, values }: { id: string; values: ConditionFormValues }) => conditionsApi.update(id, values),
    onSuccess: invalidate,
  });
}

export function useDeleteCondition() {
  const invalidate = useInvalidate();
  return useMutation({
    mutationFn: (id: string) => conditionsApi.delete(id),
    onSuccess: invalidate,
  });
}

/* Photos */

/** Invalidate everything that shows an avatar after a photo changes. */
function useInvalidatePhoto(id: string, owner: 'doctors' | 'patients') {
  const client = useQueryClient();
  return () => {
    void client.invalidateQueries({ queryKey: [owner] });
    void client.invalidateQueries({ queryKey: owner === 'doctors' ? queryKeys.doctor(id) : queryKeys.patient(id) });
    void client.invalidateQueries({ queryKey: ['dashboard'] });
  };
}

export function useUploadDoctorPhoto(id: string) {
  const invalidate = useInvalidatePhoto(id, 'doctors');
  return useMutation({ mutationFn: (file: File) => doctorsApi.uploadPhoto(id, file), onSuccess: invalidate });
}

export function useDeleteDoctorPhoto(id: string) {
  const invalidate = useInvalidatePhoto(id, 'doctors');
  return useMutation({ mutationFn: () => doctorsApi.deletePhoto(id), onSuccess: invalidate });
}

export function useUploadPatientPhoto(id: string) {
  const invalidate = useInvalidatePhoto(id, 'patients');
  return useMutation({ mutationFn: (file: File) => patientsApi.uploadPhoto(id, file), onSuccess: invalidate });
}

export function useDeletePatientPhoto(id: string) {
  const invalidate = useInvalidatePhoto(id, 'patients');
  return useMutation({ mutationFn: () => patientsApi.deletePhoto(id), onSuccess: invalidate });
}
