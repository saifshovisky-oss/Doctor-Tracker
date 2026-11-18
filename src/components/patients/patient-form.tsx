'use client';

import { useEffect, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, type Resolver } from 'react-hook-form';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textArea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PhotoField } from '@/components/common/photo-field';
import { Spinner } from '@/components/common/states';
import { DoctorCombobox } from '@/components/doctors/doctor-combobox';
import { ConditionCombobox } from '@/components/patients/condition-combobox';
import { patientSchema } from '@/lib/validators';
import { patientsApi } from '@/lib/api/patients';
import { useCreatePatient, useUpdatePatient } from '@/lib/hooks/use-data';
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

function FieldLabel({ htmlFor, children, optional }: { htmlFor?: string; children: React.ReactNode; optional?: boolean }) {
  return (
    <Label htmlFor={htmlFor} className="text-[12px] font-semibold uppercase tracking-wide text-slate-500">
      {children}
      {optional && <span className="ml-1 normal-case tracking-normal font-normal text-muted-foreground">(optional)</span>}
    </Label>
  );
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
  const queryClient = useQueryClient();
  const pending = create.isPending || update.isPending;
  const [pendingFile, setPendingFile] = useState<File | null>(null);

  const form = useForm<PatientFormValues>({
    resolver: zodResolver(patientSchema) as Resolver<PatientFormValues>,
    defaultValues: patient ? toValues(patient) : { ...defaults, doctorId: defaultDoctorId ?? '' },
  });

  useEffect(() => {
    if (patient) form.reset(toValues(patient));
    else if (defaultDoctorId) form.setValue('doctorId', defaultDoctorId);
  }, [patient, defaultDoctorId, form]);

  const doctorName = patient?.doctorName
    ? `${patient.doctorName}${patient.doctorSpecialization ? ` — ${patient.doctorSpecialization}` : ''}`
    : undefined;

  const onSubmit = form.handleSubmit(async (values) => {
    const payload = {
      ...values,
      email: values.email || undefined,
      phone: values.phone || undefined,
      notes: values.notes || undefined,
    };
    try {
      let createdId: string | undefined;

      if (patient) {
        await update.mutateAsync({ id: patient.id, values: payload });
        createdId = patient.id;
        toast.success('Patient updated successfully');
      } else {
        const created = await create.mutateAsync(payload);
        createdId = created.id;
        toast.success('Patient added successfully');
      }

      form.reset(defaults);
      setPendingFile(null);
      onSuccess?.();

      if (pendingFile && createdId) {
        void patientsApi
          .uploadPhoto(createdId, pendingFile)
          .then(() => {
            void queryClient.invalidateQueries({ queryKey: ['patients'] });
            void queryClient.invalidateQueries({ queryKey: ['patient', createdId] });
            void queryClient.invalidateQueries({ queryKey: ['dashboard'] });
            toast.success('Profile photo added');
          })
          .catch((error) => toast.error(`Photo upload failed: ${errorMessage(error)}`));
      }
    } catch (error) {
      toast.error(errorMessage(error));
    }
  });

  return (
    <form onSubmit={onSubmit} className="space-y-6" noValidate>
      <section className="space-y-4">
        <div className="flex items-center gap-3">
          <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-teal-700">Photo</span>
          <span className="h-px flex-1 bg-border" />
          <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">Profile picture</span>
        </div>
        <PhotoField
          kind="patients"
          id={patient?.id}
          name={form.watch('name') || patient?.name || 'New patient'}
          hasPhoto={patient?.hasPhoto}
          version={patient?.updatedAt}
          pendingFile={pendingFile}
          onPendingFileChange={setPendingFile}
        />
      </section>

      <section className="space-y-4">
        <div className="flex items-center gap-3">
          <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-teal-700">01</span>
          <span className="h-px flex-1 bg-border" />
          <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">Identity</span>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <FieldLabel htmlFor="patient-name">Full name</FieldLabel>
            <Input id="patient-name" placeholder="Jane Doe" aria-invalid={!!form.formState.errors.name} {...form.register('name')} />
            {form.formState.errors.name && <p role="alert" className="text-xs text-rose-600">{form.formState.errors.name.message}</p>}
          </div>
          <div className="space-y-2">
            <FieldLabel htmlFor="patient-condition">Condition</FieldLabel>
            <ConditionCombobox
              value={form.watch('condition')}
              onChange={(value) => form.setValue('condition', value, { shouldValidate: true })}
              invalid={!!form.formState.errors.condition}
            />
            {form.formState.errors.condition && <p role="alert" className="text-xs text-rose-600">{form.formState.errors.condition.message}</p>}
          </div>
        </div>
        <div className="space-y-2">
          <FieldLabel htmlFor="patient-doctor">Assigned doctor</FieldLabel>
          <DoctorCombobox
            value={form.watch('doctorId')}
            onChange={(value) => form.setValue('doctorId', value, { shouldValidate: true })}
            invalid={!!form.formState.errors.doctorId}
          />
          {form.formState.errors.doctorId && <p role="alert" className="text-xs text-rose-600">{form.formState.errors.doctorId.message}</p>}
          {doctorName && <p className="text-xs text-muted-foreground">Currently assigned to {doctorName}</p>}
        </div>
      </section>

      <section className="space-y-4">
        <div className="flex items-center gap-3">
          <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-teal-700">02</span>
          <span className="h-px flex-1 bg-border" />
          <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">Clinical & contact</span>
        </div>
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="space-y-2">
            <FieldLabel htmlFor="patient-age" optional>Age</FieldLabel>
            <Input id="patient-age" type="number" min={0} max={120} placeholder="42" aria-invalid={!!form.formState.errors.age} {...form.register('age')} />
            {form.formState.errors.age && <p role="alert" className="text-xs text-rose-600">{form.formState.errors.age.message}</p>}
          </div>
          <div className="space-y-2">
            <FieldLabel optional>Gender</FieldLabel>
            <Select
              value={form.watch('gender') || undefined}
              onValueChange={(value) => form.setValue('gender', value as 'male' | 'female' | 'other')}
            >
              <SelectTrigger aria-label="Gender"><SelectValue placeholder="Select" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="male">Male</SelectItem>
                <SelectItem value="female">Female</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <FieldLabel htmlFor="patient-phone" optional>Phone</FieldLabel>
            <Input id="patient-phone" placeholder="555-1234" {...form.register('phone')} />
          </div>
        </div>
        <div className="space-y-2">
          <FieldLabel htmlFor="patient-email" optional>Email address</FieldLabel>
          <Input id="patient-email" type="email" placeholder="jane@example.com" aria-invalid={!!form.formState.errors.email} {...form.register('email')} />
          {form.formState.errors.email && <p role="alert" className="text-xs text-rose-600">{form.formState.errors.email.message}</p>}
        </div>
        <div className="space-y-2">
          <FieldLabel htmlFor="patient-notes" optional>Notes</FieldLabel>
          <Textarea id="patient-notes" placeholder="Additional context about the patient…" {...form.register('notes')} />
        </div>
      </section>

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
