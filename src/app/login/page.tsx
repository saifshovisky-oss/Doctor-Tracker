'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Activity, Eye, EyeOff, LockKeyhole, Mail, ShieldCheck } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/common/states';
import { useAuth } from '@/components/providers/auth-provider';
import { ApiClientError } from '@/lib/api/client';
import { loginSchema, type LoginFormValues } from '@/lib/validators';

export default function LoginPage() {
  const router = useRouter();
  const { login, status } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [serverError, setServerError] = useState('');

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  useEffect(() => {
    if (status === 'authenticated') router.replace('/dashboard');
  }, [status, router]);

  const onSubmit = form.handleSubmit(async (values) => {
    setServerError('');
    try {
      await login(values.email, values.password);
      toast.success('Welcome back');
      router.replace('/dashboard');
    } catch (error) {
      const message = error instanceof ApiClientError ? error.message : 'Unable to sign in. Please try again.';
      setServerError(message);
    }
  });

  const isSubmitting = form.formState.isSubmitting;

  return (
    <div className="grid min-h-screen lg:grid-cols-[1.05fr_1fr]">
      <div className="relative hidden flex-col justify-between overflow-hidden bg-slate-900 p-12 text-white lg:flex">
        <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)', backgroundSize: '24px 24px' }} />
        <div className="relative flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-md bg-teal-600">
            <Activity className="h-5 w-5" />
          </div>
          <div>
            <p className="text-sm font-semibold">Doctor Tracker</p>
            <p className="text-[11px] text-slate-400">Healthcare administration</p>
          </div>
        </div>

        <div className="relative max-w-md space-y-6">
          <div className="inline-flex items-center gap-2 rounded-full border border-teal-500/30 bg-teal-500/10 px-3 py-1 text-xs font-medium text-teal-300">
            <ShieldCheck className="h-3.5 w-3.5" /> Secure admin workspace
          </div>
          <h2 className="text-3xl font-semibold leading-tight tracking-tight">
            Clinic operations, clearly organized.
          </h2>
          <p className="text-sm leading-relaxed text-slate-400">
            A single, reliable place to manage your doctors, patient records and daily activity — built for teams that value clarity over clutter.
          </p>
          <div className="grid grid-cols-3 gap-6 border-t border-white/10 pt-6">
            <div>
              <p className="text-xl font-semibold">Doctors</p>
              <p className="mt-1 text-xs text-slate-400">Profiles & patients</p>
            </div>
            <div>
              <p className="text-xl font-semibold">Patients</p>
              <p className="mt-1 text-xs text-slate-400">Records & conditions</p>
            </div>
            <div>
              <p className="text-xl font-semibold">Insights</p>
              <p className="mt-1 text-xs text-slate-400">Real-time analytics</p>
            </div>
          </div>
        </div>

        <p className="relative text-xs text-slate-500">© {new Date().getFullYear()} Doctor Tracker. All rights reserved.</p>
      </div>

      <div className="flex items-center justify-center bg-white px-6 py-12 sm:px-12">
        <div className="w-full max-w-sm space-y-8">
          <div className="lg:hidden flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-md bg-teal-700 text-white">
              <Activity className="h-5 w-5" />
            </div>
            <p className="text-sm font-semibold">Doctor Tracker</p>
          </div>

          <div className="space-y-2">
            <h1 className="text-2xl font-semibold tracking-tight text-foreground">Sign in to your account</h1>
            <p className="text-sm text-muted-foreground">Enter your administrator credentials to continue.</p>
          </div>

          <form onSubmit={onSubmit} className="space-y-5" noValidate>
            <div className="space-y-2">
              <Label htmlFor="email">Email address</Label>
              <div className="relative">
                <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  autoComplete="email"
                  placeholder="admin@example.com"
                  aria-invalid={!!form.formState.errors.email}
                  className="pl-9"
                  {...form.register('email')}
                />
              </div>
              {form.formState.errors.email && (
                <p role="alert" className="text-xs text-rose-600">{form.formState.errors.email.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <LockKeyhole className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  placeholder="••••••••"
                  aria-invalid={!!form.formState.errors.password}
                  className="pl-9 pr-10"
                  {...form.register('password')}
                />
                <button
                  type="button"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {form.formState.errors.password && (
                <p role="alert" className="text-xs text-rose-600">{form.formState.errors.password.message}</p>
              )}
            </div>

            {serverError && (
              <div role="alert" className="rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
                {serverError}
              </div>
            )}

            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting && <Spinner />}
              {isSubmitting ? 'Signing in…' : 'Sign in'}
            </Button>
          </form>

          <p className="border-t border-border pt-6 text-center text-xs text-muted-foreground">
            Access is restricted to authorized administrators.
          </p>
        </div>
      </div>
    </div>
  );
}
