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

export function DoctorForm({ doctor, onSuccess, onCancel }: { doctor?: Doctor; onSuccess?: () => void; onCancel?: () => void }) {
  const create = useCreateDoctor();
  const update = useUpdateDoctor();
  const pending = create.isPending || update.isPending;

  const form = useForm<DoctorFormValues>({
    resolver: zodResolver(doctorSchema),
    defaultValues: doctor
      ? {
          name: doctor.name,
          specialization: doctor.specialization,
          hospital: doctor.hospital,
          phone: doctor.phone,
          email: doctor.email,
        }
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

  return (
    <form onSubmit={onSubmit} className="space-y-4" noValidate>
      <div className="space-y-2">
        <Label htmlFor="doctor-name">Full name</Label>
        <Input id="doctor-name" placeholder="Dr. Jane Smith" aria-invalid={!!form.formState.errors.name} {...form.register('name')} />
        {form.formState.errors.name && <p role="alert" className="text-xs text-rose-600">{form.formState.errors.name.message}</p>}
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="doctor-specialization">Specialization</Label>
          <Input id="doctor-specialization" placeholder="Cardiology" aria-invalid={!!form.formState.errors.specialization} {...form.register('specialization')} />
          {form.formState.errors.specialization && <p role="alert" className="text-xs text-rose-600">{form.formState.errors.specialization.message}</p>}
        </div>
        <div className="space-y-2">
          <Label htmlFor="doctor-hospital">Hospital</Label>
          <Input id="doctor-hospital" placeholder="Central Hospital" aria-invalid={!!form.formState.errors.hospital} {...form.register('hospital')} />
          {form.formState.errors.hospital && <p role="alert" className="text-xs text-rose-600">{form.formState.errors.hospital.message}</p>}
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="doctor-email">Email address</Label>
          <Input id="doctor-email" type="email" placeholder="jane@hospital.com" aria-invalid={!!form.formState.errors.email} {...form.register('email')} />
          {form.formState.errors.email && <p role="alert" className="text-xs text-rose-600">{form.formState.errors.email.message}</p>}
        </div>
        <div className="space-y-2">
          <Label htmlFor="doctor-phone">Phone</Label>
          <Input id="doctor-phone" placeholder="+1 555 123 4567" aria-invalid={!!form.formState.errors.phone} {...form.register('phone')} />
          {form.formState.errors.phone && <p role="alert" className="text-xs text-rose-600">{form.formState.errors.phone.message}</p>}
        </div>
      </div>
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
