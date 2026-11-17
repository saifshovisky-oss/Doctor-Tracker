import { describe, expect, it, vi, beforeEach } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';

const loginMock = vi.fn();
const replaceMock = vi.fn();

vi.mock('next/navigation', () => ({
  useRouter: () => ({ replace: replaceMock, push: replaceMock }),
  usePathname: () => '/login',
  useSearchParams: () => new URLSearchParams(),
  useParams: () => ({}),
}));

vi.mock('@/components/providers/auth-provider', () => ({
  useAuth: () => ({ user: null, status: 'unauthenticated', login: loginMock, logout: vi.fn(), refresh: vi.fn() }),
}));

import LoginPage from '@/app/login/page';

describe('Login behavior', () => {
  beforeEach(() => {
    loginMock.mockReset();
    replaceMock.mockReset();
  });

  it('renders the sign-in form', () => {
    render(<LoginPage />);
    expect(screen.getByRole('heading', { name: /sign in to your account/i })).toBeInTheDocument();
    expect(screen.getByLabelText('Email address')).toBeInTheDocument();
    expect(screen.getByLabelText('Password')).toBeInTheDocument();
  });

  it('shows validation errors for empty fields', async () => {
    render(<LoginPage />);
    fireEvent.click(screen.getByRole('button', { name: /sign in/i }));
    await waitFor(() => {
      expect(screen.getByText('Email is required')).toBeInTheDocument();
      expect(screen.getByText('Password is required')).toBeInTheDocument();
    });
    expect(loginMock).not.toHaveBeenCalled();
  });

  it('rejects a malformed email', async () => {
    render(<LoginPage />);
    fireEvent.change(screen.getByLabelText('Email address'), { target: { value: 'bad' } });
    fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'secret' } });
    fireEvent.click(screen.getByRole('button', { name: /sign in/i }));
    await waitFor(() => expect(screen.getByText('Enter a valid email address')).toBeInTheDocument());
    expect(loginMock).not.toHaveBeenCalled();
  });

  it('submits valid credentials and navigates to the dashboard', async () => {
    loginMock.mockResolvedValue(undefined);
    render(<LoginPage />);
    fireEvent.change(screen.getByLabelText('Email address'), { target: { value: 'admin@example.com' } });
    fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'secret123' } });
    fireEvent.click(screen.getByRole('button', { name: /sign in/i }));
    await waitFor(() => expect(loginMock).toHaveBeenCalledWith('admin@example.com', 'secret123'));
    await waitFor(() => expect(replaceMock).toHaveBeenCalledWith('/dashboard'));
  });
});
