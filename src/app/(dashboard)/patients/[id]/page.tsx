'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import {
  Activity,
  ArrowLeft,
  Building2,
  CalendarDays,
  ClipboardList,
  HeartPulse,
  Mail,
  Pencil,
  Phone,
  Stethoscope,
  Trash2,
  UserRound,
} from 'lucide-react';
import { toast } from 'sonner';
import { PageHeader } from '@/components/common/page-header';
import { EmptyState, ErrorState, LoadingSkeleton } from '@/components/common/states';
import { StatCard } from '@/components/common/stat-card';
import { ConfirmDialog } from '@/components/common/confirm-dialog';
import { PatientForm } from '@/components/patients/patient-form';
import { EntityAvatar } from '@/components/common/entity-avatar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useDeletePatient, useDoctor, usePatient } from '@/lib/hooks/use-data';
import { conditionTone, errorMessage, formatDate } from '@/lib/utils';

export default function PatientProfilePage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const id = params.id;
  const patient = usePatient(id);
  const remove = useDeletePatient();
  const [editOpen, setEditOpen] = useState(false);
  const doctorId = patient.data?.doctorId;
  const doctor = useDoctor(doctorId ?? '', !!doctorId);

  if (patient.isPending) return <LoadingSkeleton rows={8} columns={4} />;
  if (patient.isError) return <ErrorState message={errorMessage(patient.error)} />;
  if (!patient.data) return <EmptyState title="Patient not found" />;

  const record = patient.data;
  const assignedDoctor = doctor.data;

  return (
    <div className="space-y-7">
      <Link
        href="/patients"
        className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground transition-colors hover:text-teal-700"
      >
        <ArrowLeft className="h-4 w-4" /> Back to patients
      </Link>

      <PageHeader
        eyebrow="Patient profile"
        title={record.name}
        description={`${record.condition} · Registered ${formatDate(record.createdAt)}`}
        breadcrumb={['Dashboard', 'Patients', record.name]}
        actions={
          <>
            <Button variant="outline" onClick={() => setEditOpen(true)}>
              <Pencil className="h-4 w-4" /> Edit patient
            </Button>
            <ConfirmDialog
              trigger={
                <Button variant="destructive">
                  <Trash2 className="h-4 w-4" /> Delete patient
                </Button>
              }
              title="Delete patient?"
              description={<>Remove <strong>{record.name}</strong> from your records? This action cannot be undone.</>}
              confirmLabel="Delete patient"
              destructive
              onConfirm={async () => {
                await remove.mutateAsync(record.id);
                toast.success(`${record.name} was deleted`);
                router.push('/patients');
              }}
            />
          </>
        }
      />

      <section className="relative overflow-hidden rounded-lg border border-border/80 bg-white shadow-panel">
        <div className="absolute inset-y-0 left-0 w-1 bg-teal-600" aria-hidden />
        <div className="grid gap-6 p-6 pl-7 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] lg:p-7 lg:pl-8">
          <div className="flex items-start gap-5">
            <EntityAvatar
              kind="patients"
              id={record.id}
              name={record.name}
              hasPhoto={record.hasPhoto}
              version={record.updatedAt}
              className="h-[76px] w-[76px] rounded-md border border-slate-200"
              fallbackClassName="rounded-md text-2xl font-semibold"
            />
            <div className="min-w-0 space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-xl font-semibold tracking-tight text-slate-900">{record.name}</h2>
                <Badge variant={conditionTone(record.condition)}>{record.condition}</Badge>
              </div>
              <p className="flex items-center gap-1.5 text-[13px] text-slate-600">
                <UserRound className="h-4 w-4 text-slate-400" strokeWidth={1.8} />
                {record.age !== undefined ? `${record.age} years` : 'Age not recorded'}
                {record.gender ? ` · ${record.gender}` : ''}
              </p>
              <p className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                <CalendarDays className="h-3.5 w-3.5 text-slate-400" strokeWidth={1.8} />
                Registered {formatDate(record.createdAt, true)}
              </p>
            </div>
          </div>

          <div className="grid gap-x-6 gap-y-4 border-t border-border pt-5 lg:grid-cols-2 lg:border-l lg:border-t-0 lg:pl-6 lg:pt-0">
            <div className="min-w-0">
              <p className="eyebrow">Email</p>
              {record.email ? (
                <a href={`mailto:${record.email}`} className="mt-1.5 flex items-start gap-2 text-[13px] text-slate-700 hover:text-teal-700">
                  <Mail className="mt-0.5 h-4 w-4 shrink-0 text-teal-700" strokeWidth={1.8} />
                  <span className="break-all">{record.email}</span>
                </a>
              ) : (
                <p className="mt-1.5 flex items-center gap-2 text-[13px] text-slate-400">
                  <Mail className="h-4 w-4 shrink-0" strokeWidth={1.8} /> Not provided
                </p>
              )}
            </div>
            <div className="min-w-0">
              <p className="eyebrow">Phone</p>
              <p className="mt-1.5 flex items-center gap-2 text-[13px] text-slate-700">
                <Phone className="h-4 w-4 shrink-0 text-sky-700" strokeWidth={1.8} />
                {record.phone || 'Not provided'}
              </p>
            </div>
            <div className="min-w-0">
              <p className="eyebrow">Condition</p>
              <p className="mt-1.5 flex items-center gap-2 text-[13px] text-slate-700">
                <HeartPulse className="h-4 w-4 shrink-0 text-rose-700" strokeWidth={1.8} />
                {record.condition}
              </p>
            </div>
            <div className="min-w-0">
              <p className="eyebrow">Last updated</p>
              <p className="mt-1.5 flex items-center gap-2 text-[13px] text-slate-700">
                <Activity className="h-4 w-4 shrink-0 text-indigo-700" strokeWidth={1.8} />
                {formatDate(record.updatedAt, true)}
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          feature
          title="Age"
          value={record.age !== undefined ? record.age : '—'}
          icon={UserRound}
          hint="Recorded age in years"
        />
        <StatCard title="Gender" value={record.gender ?? '—'} icon={Activity} hint="Patient profile" accent="sky" />
        <StatCard title="Condition" value={record.condition} icon={ClipboardList} hint="Primary diagnosis" accent="rose" />
        <StatCard title="Registered" value={formatDate(record.createdAt)} icon={CalendarDays} hint="Record created" accent="amber" />
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <div className="panel overflow-hidden">
          <div className="flex items-center justify-between border-b border-border px-5 py-4">
            <div className="flex items-center gap-2">
              <Stethoscope className="h-4 w-4 text-teal-700" strokeWidth={1.8} />
              <h3 className="text-sm font-semibold text-slate-900">Assigned doctor</h3>
            </div>
          </div>
          <div className="p-5">
            {doctor.isPending ? (
              <LoadingSkeleton rows={3} columns={2} />
            ) : assignedDoctor ? (
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <EntityAvatar
                    kind="doctors"
                    id={assignedDoctor.id}
                    name={assignedDoctor.name}
                    hasPhoto={assignedDoctor.hasPhoto}
                    version={assignedDoctor.updatedAt}
                    className="h-11 w-11 rounded-md border border-slate-200"
                    fallbackClassName="rounded-md text-sm font-semibold"
                  />
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-slate-900">{assignedDoctor.name}</p>
                    <p className="truncate text-xs text-muted-foreground">{assignedDoctor.specialization}</p>
                  </div>
                </div>
                <div className="space-y-2 border-t border-border pt-4 text-[13px] text-slate-600">
                  <p className="flex items-start gap-2">
                    <Building2 className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" strokeWidth={1.8} />
                    {assignedDoctor.hospital}
                  </p>
                  <p className="flex items-center gap-2">
                    <Mail className="h-4 w-4 shrink-0 text-slate-400" strokeWidth={1.8} />
                    {assignedDoctor.email}
                  </p>
                  <p className="flex items-center gap-2">
                    <Phone className="h-4 w-4 shrink-0 text-slate-400" strokeWidth={1.8} />
                    {assignedDoctor.phone}
                  </p>
                </div>
                <Button asChild variant="subtle" size="sm">
                  <Link href={`/doctors/${assignedDoctor.id}`}>View doctor profile</Link>
                </Button>
              </div>
            ) : (
              <EmptyState title="Doctor unavailable" description="The assigned doctor could not be loaded." />
            )}
          </div>
        </div>

        <div className="panel overflow-hidden">
          <div className="flex items-center justify-between border-b border-border px-5 py-4">
            <div className="flex items-center gap-2">
              <ClipboardList className="h-4 w-4 text-teal-700" strokeWidth={1.8} />
              <h3 className="text-sm font-semibold text-slate-900">Clinical notes</h3>
            </div>
          </div>
          <div className="p-5">
            {record.notes ? (
              <p className="whitespace-pre-wrap text-[13px] leading-relaxed text-slate-600">{record.notes}</p>
            ) : (
              <EmptyState title="No notes recorded" description="Add notes when editing this patient." />
            )}
          </div>
        </div>
      </section>

      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit patient</DialogTitle>
            <DialogDescription>Update this patient's details.</DialogDescription>
          </DialogHeader>
          <PatientForm patient={record} onSuccess={() => setEditOpen(false)} onCancel={() => setEditOpen(false)} />
        </DialogContent>
      </Dialog>
    </div>
  );
}
