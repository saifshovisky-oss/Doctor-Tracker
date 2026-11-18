'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { toast } from 'sonner';
import {
  ArrowLeft,
  Building2,
  CalendarDays,
  HeartPulse,
  Mail,
  Pencil,
  Phone,
  Plus,
  Stethoscope,
  Trash2,
  UserPlus,
  UsersRound,
} from 'lucide-react';
import { PageHeader } from '@/components/common/page-header';
import { DataTable, type Column } from '@/components/common/data-table';
import { EmptyState, ErrorState, LoadingSkeleton } from '@/components/common/states';
import { PatientForm } from '@/components/patients/patient-form';
import { DoctorForm } from '@/components/doctors/doctor-form';
import { StatCard } from '@/components/common/stat-card';
import { ConfirmDialog } from '@/components/common/confirm-dialog';
import { EntityAvatar } from '@/components/common/entity-avatar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useDeletePatient, useDoctor, usePatients } from '@/lib/hooks/use-data';
import { avatarColor, conditionTone, errorMessage, formatDate } from '@/lib/utils';
import type { Patient } from '@/lib/types';

export default function DoctorDetailsPage() {
  const params = useParams<{ id: string }>();
  const id = params.id;
  const doctor = useDoctor(id);
  const patients = usePatients({ page: 1, limit: 50, doctorId: id, sortBy: 'createdAt', sortOrder: 'desc' });
  const removePatient = useDeletePatient();
  const [addOpen, setAddOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);

  if (doctor.isPending) return <LoadingSkeleton rows={8} columns={4} />;
  if (doctor.isError) return <ErrorState message={errorMessage(doctor.error)} />;
  if (!doctor.data) return <EmptyState title="Doctor not found" />;

  const record = doctor.data;
  const specs = record.specializations?.length ? record.specializations : [record.specialization].filter(Boolean);

  const columns: Column<Patient>[] = [
    {
      key: 'name',
      header: 'Patient',
      cell: (patient) => (
        <div className="flex items-center gap-3">
          <EntityAvatar
            kind="patients"
            id={patient.id}
            name={patient.name}
            hasPhoto={patient.hasPhoto}
            version={patient.updatedAt}
            className="h-8 w-8"
            fallbackClassName={`text-[10px] rounded-full`}
          />
          <div className="min-w-0">
            <Link
              href={`/patients/${patient.id}`}
              className="block truncate text-[13px] font-semibold text-slate-800 hover:text-teal-700 hover:underline"
            >
              {patient.name}
            </Link>
            <p className="truncate text-[11px] text-muted-foreground">{patient.email ?? patient.phone ?? 'No contact details'}</p>
          </div>
        </div>
      ),
    },
    { key: 'age', header: 'Age', cell: (patient) => <span className="text-[13px] text-slate-600">{patient.age ?? '—'}</span> },
    { key: 'condition', header: 'Condition', cell: (patient) => <Badge variant={conditionTone(patient.condition)}>{patient.condition}</Badge> },
    {
      key: 'createdAt',
      header: 'Registered',
      cell: (patient) => <span className="whitespace-nowrap text-[11px] text-muted-foreground">{formatDate(patient.createdAt)}</span>,
    },
    {
      key: 'actions',
      header: <span className="sr-only">Actions</span>,
      headClassName: 'w-12',
      cell: (patient) => (
        <ConfirmDialog
          trigger={
            <Button variant="ghost" size="icon" aria-label={`Delete ${patient.name}`} title="Delete patient">
              <Trash2 className="h-4 w-4 text-rose-600" />
            </Button>
          }
          title="Delete patient?"
          description={<>Remove <strong>{patient.name}</strong> from this doctor's list? This action cannot be undone.</>}
          confirmLabel="Delete patient"
          destructive
          onConfirm={async () => {
            await removePatient.mutateAsync(patient.id);
            toast.success(`${patient.name} was deleted`);
            void patients.refetch();
            void doctor.refetch();
          }}
        />
      ),
    },
  ];

  return (
    <div className="space-y-7">
      <Link href="/doctors" className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground transition-colors hover:text-teal-700">
        <ArrowLeft className="h-4 w-4" /> Back to doctors
      </Link>

      <PageHeader
        eyebrow="Doctor profile"
        title={record.name}
        description={`${specs.join(', ')} · ${record.hospital}`}
        breadcrumb={['Dashboard', 'Doctors', record.name]}
        actions={
          <>
            <Button variant="outline" onClick={() => setEditOpen(true)}>
              <Pencil className="h-4 w-4" /> Edit profile
            </Button>
            <Button onClick={() => setAddOpen(true)}>
              <UserPlus className="h-4 w-4" /> Add patient
            </Button>
          </>
        }
      />

      {/* Profile hero — identity and contact information live together at the top. */}
      <section className="relative overflow-hidden rounded-lg border border-border/80 bg-white shadow-panel">
        <div className="absolute inset-y-0 left-0 w-1 bg-teal-600" aria-hidden />
        <div className="grid gap-6 p-6 pl-7 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] lg:p-7 lg:pl-8">
          <div className="flex items-start gap-5">
            <EntityAvatar
              kind="doctors"
              id={record.id}
              name={record.name}
              hasPhoto={record.hasPhoto}
              version={record.updatedAt}
              className="h-[76px] w-[76px] rounded-md border border-slate-200"
              fallbackClassName={`rounded-md text-2xl font-semibold ${avatarColor(record.name)}`}
            />
            <div className="min-w-0 space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-xl font-semibold tracking-tight text-slate-900">{record.name}</h2>
                {specs.map((item) => <Badge key={item} variant="teal">{item}</Badge>)}
              </div>
              <p className="flex items-center gap-1.5 text-[13px] text-slate-600">
                <Building2 className="h-4 w-4 text-slate-400" strokeWidth={1.8} />
                {record.hospital}
              </p>
              <p className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                <CalendarDays className="h-3.5 w-3.5 text-slate-400" strokeWidth={1.8} />
                Joined {formatDate(record.createdAt)}
              </p>
            </div>
          </div>

          <div className="grid gap-x-6 gap-y-4 border-t border-border pt-5 lg:grid-cols-2 lg:border-l lg:border-t-0 lg:pl-6 lg:pt-0">
            <div className="min-w-0">
              <p className="eyebrow">Email</p>
              <a href={`mailto:${record.email}`} className="mt-1.5 flex items-start gap-2 text-[13px] text-slate-700 hover:text-teal-700">
                <Mail className="mt-0.5 h-4 w-4 shrink-0 text-teal-700" strokeWidth={1.8} />
                <span className="break-all">{record.email}</span>
              </a>
            </div>
            <div className="min-w-0">
              <p className="eyebrow">Phone</p>
              <p className="mt-1.5 flex items-center gap-2 text-[13px] text-slate-700">
                <Phone className="h-4 w-4 shrink-0 text-sky-700" strokeWidth={1.8} />
                {record.phone || '—'}
              </p>
            </div>
            <div className="min-w-0">
              <p className="eyebrow">Specialization</p>
              <p className="mt-1.5 flex items-center gap-2 text-[13px] text-slate-700">
                <Stethoscope className="h-4 w-4 shrink-0 text-indigo-700" strokeWidth={1.8} />
                {specs.join(', ')}
              </p>
            </div>
            <div className="min-w-0">
              <p className="eyebrow">Hospital</p>
              <p className="mt-1.5 flex items-start gap-2 text-[13px] text-slate-700">
                <HeartPulse className="mt-0.5 h-4 w-4 shrink-0 text-rose-700" strokeWidth={1.8} />
                <span>{record.hospital}</span>
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard title="Total patients" value={patients.data?.totalItems ?? record.patientCount} icon={UsersRound} hint="Currently assigned" feature />
        <StatCard title="Specializations" value={specs.length} icon={Stethoscope} hint={specs.join(', ')} accent="sky" />
        <StatCard title="Hospital" value={record.hospital} icon={Building2} hint="Primary practice" accent="indigo" />
        <StatCard title="Joined" value={formatDate(record.createdAt)} icon={CalendarDays} hint="Profile created" accent="amber" />
      </section>

      <section className="panel overflow-hidden">
        <div className="flex items-center justify-between gap-3 border-b border-border px-5 py-4">
          <div>
            <h3 className="text-sm font-semibold text-slate-900">Associated patients</h3>
            <p className="mt-0.5 text-[11px] text-muted-foreground">Everyone currently assigned to this doctor.</p>
          </div>
          <Button size="sm" onClick={() => setAddOpen(true)}>
            <Plus className="h-4 w-4" /> Add patient
          </Button>
        </div>
        <DataTable
          columns={columns}
          data={patients.data?.data ?? []}
          rowKey={(row) => row.id}
          isLoading={patients.isPending}
          error={patients.error}
          onRetry={() => void patients.refetch()}
          errorMessage={errorMessage(patients.error)}
          emptyTitle="No patients assigned yet"
          emptyDescription="Add a patient directly under this doctor to get started."
          emptyAction={<Button size="sm" onClick={() => setAddOpen(true)}><Plus className="h-4 w-4" /> Add patient</Button>}
        />
      </section>

      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Add patient under {record.name}</DialogTitle>
            <DialogDescription>The new patient will be assigned to this doctor.</DialogDescription>
          </DialogHeader>
          <PatientForm defaultDoctorId={id} onSuccess={() => { setAddOpen(false); void patients.refetch(); void doctor.refetch(); }} onCancel={() => setAddOpen(false)} />
        </DialogContent>
      </Dialog>

      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit doctor</DialogTitle>
            <DialogDescription>Update this doctor's profile details.</DialogDescription>
          </DialogHeader>
          <DoctorForm doctor={record} onSuccess={() => setEditOpen(false)} onCancel={() => setEditOpen(false)} />
        </DialogContent>
      </Dialog>
    </div>
  );
}
