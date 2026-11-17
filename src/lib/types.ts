export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: 'admin';
}

export interface Doctor {
  id: string;
  name: string;
  specialization: string;
  hospital: string;
  phone: string;
  email: string;
  patientCount: number;
  hasPhoto: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Patient {
  id: string;
  name: string;
  age?: number;
  gender?: 'male' | 'female' | 'other';
  phone?: string;
  email?: string;
  condition: string;
  doctorId: string;
  doctorName?: string;
  doctorSpecialization?: string;
  hasPhoto: boolean;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Paginated<T> {
  data: T[];
  currentPage: number;
  totalPages: number;
  totalItems: number;
  limit: number;
}

export interface DashboardStats {
  totalDoctors: number;
  totalPatients: number;
  newDoctorsThisMonth: number;
  newPatientsThisMonth: number;
}

export interface TrendPoint {
  date: string;
  label: string;
  count: number;
}

export interface NamedCount {
  name: string;
  value: number;
}

export interface DoctorCount {
  doctorId: string;
  name: string;
  specialization: string;
  count: number;
}

export interface DoctorFormValues {
  name: string;
  specialization: string;
  hospital: string;
  phone: string;
  email: string;
}

export interface PatientFormValues {
  name: string;
  age?: number;
  gender?: 'male' | 'female' | 'other';
  phone?: string;
  email?: string;
  condition: string;
  doctorId: string;
  notes?: string;
}

export interface Condition {
  id: string;
  name: string;
  patientCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface ConditionFormValues {
  name: string;
}

export interface PhotoMutationResult {
  id: string;
  hasPhoto: boolean;
  updatedAt: string;
}

export interface ListParams {
  page: number;
  limit: number;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  startDate?: string;
  endDate?: string;
  specialization?: string;
  condition?: string;
  doctorId?: string;
}
