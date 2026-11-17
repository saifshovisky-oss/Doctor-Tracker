'use client';

import { useEffect } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/common/states';
import { doctorSchema } from '@/lib/validators';
import { useCreateDoctor, useUpdateDoctor } from '@/lib/hooks/use-data';
import { errorMessage } from '@/lib/utils';
import type { Doctor, DoctorFormValues } from '@/lib/types';

const defaults: DoctorFormValues = { name: '', specialization: '', hospital: '', phone: '', email: '' };

function Field({ label, id, error, ...props }: React.InputHTMLAttributes<HTMLInputElement> & { label: string; error?: string }) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id} className="text-[12px] font-semibold uppercase tracking-wide text-slate-500">{label}</Label>
      <Input id={id} aria-invalid={!!error} {...props} />
      {error && <p role="alert" className="text-xs text-rose-600">{error}</p>}
    </div>
  );
}

export function DoctorForm({ doctor, onSuccess, onCancel }: { doctor?: Doctor; onSuccess?: () => void; onCancel?: () => void }) {
  const create = useCreateDoctor();
  const update = useUpdateDoctor();
  const pending = create.isPending || update.isPending;

  const form = useForm<DoctorFormValues>({
    resolver: zodResolver(doctorSchema),
    defaultValues: doctor
      ? { name: doctor.name, specialization: doctor.specialization, hospital: doctor.hospital, phone: doctor.phone, email: doctor.email }
      : defaults,
  });

  useEffect(() => {
    if (doctor) {
      form.reset({
        name: doctor.name,
        specialization: doctor.specialization,
        hospital: doctor.hospital,
        phone: doctor.phone,
        email: doctor.email,
      });
    }
  }, [doctor, form]);

  const onSubmit = form.handleSubmit(async (values) => {
    try {
      if (doctor) {
        await update.mutateAsync({ id: doctor.id, values });
        toast.success('Doctor updated successfully');
      } else {
        await create.mutateAsync(values);
        toast.success('Doctor added successfully');
      }
      form.reset(defaults);
      onSuccess?.();
    } catch (error) {
      toast.error(errorMessage(error));
    }
  });

  const errors = form.formState.errors;

  return (
    <form onSubmit={onSubmit} className="space-y-6" noValidate>
      <section className="space-y-4">
        <div className="flex items-center gap-3">
          <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-teal-700">01</span>
          <span className="h-px flex-1 bg-border" />
          <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">Identity</span>
        </div>
        <Field label="Full name" id="doctor-name" placeholder="Dr. Jane Smith" error={errors.name?.message} {...form.register('name')} />
      </section>

      <section className="space-y-4">
        <div className="flex items-center gap-3">
          <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-teal-700">02</span>
          <span className="h-px flex-1 bg-border" />
          <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">Practice</span>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Specialization" id="doctor-specialization" placeholder="Cardiology" error={errors.specialization?.message} {...form.register('specialization')} />
          <Field label="Hospital" id="doctor-hospital" placeholder="Central Hospital" error={errors.hospital?.message} {...form.register('hospital')} />
        </div>
      </section>

      <section className="space-y-4">
        <div className="flex items-center gap-3">
          <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-teal-700">03</span>
          <span className="h-px flex-1 bg-border" />
          <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">Contact</span>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Email address" id="doctor-email" type="email" placeholder="jane@hospital.com" error={errors.email?.message} {...form.register('email')} />
          <Field label="Phone" id="doctor-phone" placeholder="+1 555 123 4567" error={errors.phone?.message} {...form.register('phone')} />
        </div>
      </section>

      <div className="flex justify-end gap-2 border-t border-border pt-4">
        {onCancel && <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>}
        <Button type="submit" disabled={pending}>
          {pending && <Spinner />}
          {doctor ? 'Save changes' : 'Add doctor'}
        </Button>
      </div>
    </form>
  );
}
