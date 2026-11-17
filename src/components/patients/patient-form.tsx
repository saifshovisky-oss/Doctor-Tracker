'use client';

import { useEffect } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textArea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Spinner } from '@/components/common/states';
import { patientSchema } from '@/lib/validators';
import { useCreatePatient, useDoctors, useUpdatePatient } from '@/lib/hooks/use-data';
import { errorMessage } from '@/lib/utils';
import type { Patient, PatientFormValues } from '@/lib/types';

const defaults: PatientFormValues = {
  name: '',
  condition: '',
  doctorId: '',
  age: undefined,
  gender: undefined,
  phone: '',
  email: '',
  notes: '',
};

function toValues(patient?: Patient): PatientFormValues {
  if (!patient) return defaults;
  return {
    name: patient.name,
    condition: patient.condition,
    doctorId: patient.doctorId,
    age: patient.age,
    gender: patient.gender,
    phone: patient.phone ?? '',
    email: patient.email ?? '',
    notes: patient.notes ?? '',
  };
}

export function PatientForm({
  patient,
  defaultDoctorId,
  onSuccess,
  onCancel,
}: {
  patient?: Patient;
  defaultDoctorId?: string;
  onSuccess?: () => void;
  onCancel?: () => void;
}) {
  const create = useCreatePatient();
  const update = useUpdatePatient();
  const pending = create.isPending || update.isPending;
  const doctors = useDoctors({ page: 1, limit: 100, sortBy: 'name', sortOrder: 'asc' });

  const form = useForm<PatientFormValues>({
    resolver: zodResolver(patientSchema),
    defaultValues: patient ? toValues(patient) : { ...defaults, doctorId: defaultDoctorId ?? '' },
  });

  useEffect(() => {
    if (patient) form.reset(toValues(patient));
    else if (defaultDoctorId) form.setValue('doctorId', defaultDoctorId);
  }, [patient, defaultDoctorId, form]);

  const onSubmit = form.handleSubmit(async (values) => {
    const payload = {
      ...values,
      email: values.email || undefined,
      phone: values.phone || undefined,
      notes: values.notes || undefined,
    };
    try {
      if (patient) {
        await update.mutateAsync({ id: patient.id, values: payload });
        toast.success('Patient updated successfully');
      } else {
        await create.mutateAsync(payload);
        toast.success('Patient added successfully');
      }
      form.reset(defaults);
      onSuccess?.();
    } catch (error) {
      toast.error(errorMessage(error));
    }
  });

  return (
    <form onSubmit={onSubmit} className="space-y-4" noValidate>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="patient-name">Full name</Label>
          <Input id="patient-name" placeholder="Jane Doe" aria-invalid={!!form.formState.errors.name} {...form.register('name')} />
          {form.formState.errors.name && <p role="alert" className="text-xs text-rose-600">{form.formState.errors.name.message}</p>}
        </div>
        <div className="space-y-2">
          <Label htmlFor="patient-condition">Condition</Label>
          <Input id="patient-condition" placeholder="Hypertension" aria-invalid={!!form.formState.errors.condition} {...form.register('condition')} />
          {form.formState.errors.condition && <p role="alert" className="text-xs text-rose-600">{form.formState.errors.condition.message}</p>}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="patient-doctor">Assigned doctor</Label>
        <Select
          value={form.watch('doctorId') || undefined}
          onValueChange={(value) => form.setValue('doctorId', value, { shouldValidate: true })}
        >
          <SelectTrigger id="patient-doctor" aria-label="Assigned doctor" aria-invalid={!!form.formState.errors.doctorId}>
            <SelectValue placeholder="Select a doctor" />
          </SelectTrigger>
          <SelectContent>
            {(doctors.data?.data ?? []).map((doctor) => (
              <SelectItem key={doctor.id} value={doctor.id}>
                {doctor.name} — {doctor.specialization}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {form.formState.errors.doctorId && <p role="alert" className="text-xs text-rose-600">{form.formState.errors.doctorId.message}</p>}
        {doctors.isError && <p className="text-xs text-rose-600">Could not load doctors. Refresh and try again.</p>}
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="space-y-2">
          <Label htmlFor="patient-age">Age <span className="font-normal text-muted-foreground">(optional)</span></Label>
          <Input id="patient-age" type="number" min={0} max={120} placeholder="42" aria-invalid={!!form.formState.errors.age} {...form.register('age')} />
          {form.formState.errors.age && <p role="alert" className="text-xs text-rose-600">{form.formState.errors.age.message}</p>}
        </div>
        <div className="space-y-2">
          <Label htmlFor="patient-gender">Gender <span className="font-normal text-muted-foreground">(optional)</span></Label>
          <Select
            value={form.watch('gender') || undefined}
            onValueChange={(value) => form.setValue('gender', value as 'male' | 'female' | 'other')}
          >
            <SelectTrigger id="patient-gender" aria-label="Gender"><SelectValue placeholder="Select" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="male">Male</SelectItem>
              <SelectItem value="female">Female</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="patient-phone">Phone <span className="font-normal text-muted-foreground">(optional)</span></Label>
          <Input id="patient-phone" placeholder="555-1234" {...form.register('phone')} />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="patient-email">Email <span className="font-normal text-muted-foreground">(optional)</span></Label>
        <Input id="patient-email" type="email" placeholder="jane@example.com" aria-invalid={!!form.formState.errors.email} {...form.register('email')} />
        {form.formState.errors.email && <p role="alert" className="text-xs text-rose-600">{form.formState.errors.email.message}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="patient-notes">Notes <span className="font-normal text-muted-foreground">(optional)</span></Label>
        <Textarea id="patient-notes" placeholder="Additional context about the patient…" {...form.register('notes')} />
      </div>

      <div className="flex justify-end gap-2 border-t border-border pt-4">
        {onCancel && <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>}
        <Button type="submit" disabled={pending}>
          {pending && <Spinner />}
          {patient ? 'Save changes' : 'Add patient'}
        </Button>
      </div>
    </form>
  );
}
