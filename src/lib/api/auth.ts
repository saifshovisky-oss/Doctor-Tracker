import { api } from './client';
import type { AuthUser } from '@/lib/types';

export interface LoginResponse {
  user: AuthUser;
  expiresIn: string;
}

export const authApi = {
  me: () => api.get<{ user: AuthUser }>('/auth/me').then((res) => res.user),
  login: (email: string, password: string) =>
    api.post<LoginResponse>('/auth/login', { email, password }),
  logout: () => api.post<{ signedOut: boolean }>('/auth/logout'),
};
