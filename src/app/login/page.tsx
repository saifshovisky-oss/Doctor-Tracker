'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Activity, ArrowRight, Eye, EyeOff, LockKeyhole, Mail, ShieldCheck } from 'lucide-react';
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
      setServerError(error instanceof ApiClientError ? error.message : 'Unable to sign in. Please try again.');
    }
  });

  const isSubmitting = form.formState.isSubmitting;

  return (
    <div className="grid min-h-screen lg:grid-cols-[1.05fr_1fr]">
      <div className="relative hidden flex-col justify-between overflow-hidden bg-slate-900 px-12 py-12 text-white lg:flex">
        <div
          className="absolute inset-0 opacity-[0.05]"
          style={{
            backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)',
            backgroundSize: '26px 26px',
          }}
          aria-hidden
        />
        <div className="relative flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-md bg-teal-600">
            <Activity className="h-5 w-5" strokeWidth={2} />
          </div>
          <div>
            <p className="text-sm font-semibold tracking-tight">Doctor Tracker</p>
            <p className="text-[11px] text-slate-400">Healthcare administration</p>
          </div>
        </div>

        <div className="relative max-w-lg space-y-7">
          <div className="inline-flex items-center gap-2 rounded-full border border-teal-500/30 bg-teal-500/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-teal-300">
            <ShieldCheck className="h-3.5 w-3.5" /> Secure admin workspace
          </div>
          <h2 className="text-[38px] font-semibold leading-[1.1] tracking-[-0.03em]">
            Clinic operations,
            <br />
            clearly organized.
          </h2>
          <p className="max-w-md text-sm leading-relaxed text-slate-400">
            A single, reliable place to manage your doctors, patient records and daily activity — built for teams that value clarity over clutter.
          </p>
          <div className="grid max-w-md grid-cols-3 gap-0 border-t border-white/10 pt-6">
            {[
              ['Doctors', 'Profiles & patients'],
              ['Patients', 'Records & conditions'],
              ['Insights', 'Real-time analytics'],
            ].map(([title, subtitle], index) => (
              <div key={title} className={index > 0 ? 'border-l border-white/10 pl-5' : undefined}>
                <p className="text-base font-semibold">{title}</p>
                <p className="mt-1 text-[11px] text-slate-400">{subtitle}</p>
              </div>
            ))}
          </div>
        </div>

        <p className="relative text-[11px] text-slate-500">© {new Date().getFullYear()} Doctor Tracker. All rights reserved.</p>
      </div>

      <div className="flex items-center justify-center bg-white px-6 py-12 sm:px-12">
        <div className="w-full max-w-[380px] space-y-8">
          <div className="flex items-center gap-2.5 lg:hidden">
            <div className="flex h-9 w-9 items-center justify-center rounded-md bg-teal-700 text-white">
              <Activity className="h-5 w-5" />
            </div>
            <p className="text-sm font-semibold">Doctor Tracker</p>
          </div>

          <div className="space-y-2">
            <p className="eyebrow text-teal-700">Secure access</p>
            <h1 className="text-[26px] font-semibold tracking-[-0.02em] text-slate-900">Sign in to your account</h1>
            <p className="text-[13px] leading-relaxed text-muted-foreground">Enter your administrator credentials to continue.</p>
          </div>

          <form onSubmit={onSubmit} className="space-y-5" noValidate>
            <div className="space-y-2">
              <Label htmlFor="email" className="text-[12px] font-semibold uppercase tracking-wide text-slate-500">Email address</Label>
              <div className="relative">
                <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
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
              {form.formState.errors.email && <p role="alert" className="text-xs text-rose-600">{form.formState.errors.email.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-[12px] font-semibold uppercase tracking-wide text-slate-500">Password</Label>
              <div className="relative">
                <LockKeyhole className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
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
                  onClick={() => setShowPassword((value) => !value)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-slate-400 transition-colors hover:text-slate-700"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {form.formState.errors.password && <p role="alert" className="text-xs text-rose-600">{form.formState.errors.password.message}</p>}
            </div>

            {serverError && (
              <div role="alert" className="rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-[13px] text-rose-700">
                {serverError}
              </div>
            )}

            <Button type="submit" className="w-full" size="lg" disabled={isSubmitting}>
              {isSubmitting ? (
                <><Spinner /> Signing in…</>
              ) : (
                <>Sign in <ArrowRight className="h-4 w-4" /></>
              )}
            </Button>
          </form>

          <div className="border-t border-border pt-6">
            <p className="flex items-start gap-2 text-[11px] leading-relaxed text-muted-foreground">
              <ShieldCheck className="mt-0.5 h-3.5 w-3.5 shrink-0 text-teal-700" />
              Access is restricted to authorized administrators. All sessions are encrypted and time-limited.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
