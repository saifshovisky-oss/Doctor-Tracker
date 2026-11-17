'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Building2, Mail, Phone, Plus, Stethoscope, UserPlus } from 'lucide-react';
import { toast } from 'sonner';
import { PageHeader } from '@/components/common/page-header';
import { DataTable, type Column } from '@/components/common/data-table';
import { EmptyState, ErrorState, LoadingSkeleton } from '@/components/common/states';
import { PatientForm } from '@/components/patients/patient-form';
import { DoctorForm } from '@/components/doctors/doctor-form';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { StatCard } from '@/components/common/stat-card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useDoctor, usePatients } from '@/lib/hooks/use-data';
import { avatarColor, conditionTone, errorMessage, formatDate, initials } from '@/lib/utils';
import type { Patient } from '@/lib/types';
import { useParams } from 'next/navigation';

export default function DoctorDetailsPage() {
  const params = useParams<{ id: string }>();
  const id = params.id;
  const doctor = useDoctor(id);
  const patients = usePatients({ page: 1, limit: 50, doctorId: id, sortBy: 'createdAt', sortOrder: 'desc' });
  const [addOpen, setAddOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);

  if (doctor.isPending) return <LoadingSkeleton rows={8} columns={4} />;
  if (doctor.isError) return <ErrorState message={errorMessage(doctor.error)} />;
  if (!doctor.data) return <EmptyState title="Doctor not found" />;

  const columns: Column<Patient>[] = [
    {
      key: 'name',
      header: 'Patient',
      cell: (patient) => (
        <div className="flex items-center gap-3">
          <Avatar>
            <AvatarFallback className={avatarColor(patient.name)}>{initials(patient.name)}</AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <p className="truncate text-sm font-medium">{patient.name}</p>
            <p className="truncate text-xs text-muted-foreground">{patient.email ?? patient.phone ?? 'No contact'}</p>
          </div>
        </div>
      ),
    },
    { key: 'age', header: 'Age', cell: (p) => <span className="text-sm text-slate-600">{p.age ?? '—'}</span> },
    { key: 'condition', header: 'Condition', cell: (p) => <Badge variant={conditionTone(p.condition)}>{p.condition}</Badge> },
    { key: 'createdAt', header: 'Registered', cell: (p) => <span className="text-xs text-muted-foreground">{formatDate(p.createdAt)}</span> },
  ];

  return (
    <div className="space-y-6">
      <Link href="/doctors" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> Back to doctors
      </Link>

      <PageHeader
        title={doctor.data.name}
        description={`${doctor.data.specialization} · ${doctor.data.hospital}`}
        breadcrumb={['Dashboard', 'Doctors', doctor.data.name]}
        actions={
          <>
            <Button variant="outline" onClick={() => setEditOpen(true)}>Edit profile</Button>
            <Button onClick={() => setAddOpen(true)}><UserPlus className="h-4 w-4" /> Add patient</Button>
          </>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard title="Total patients" value={patients.data?.totalItems ?? doctor.data.patientCount} icon={Stethoscope} hint="Assigned to this doctor" />
        <StatCard title="Specialization" value={doctor.data.specialization} icon={Stethoscope} hint="Primary focus" />
        <StatCard title="Hospital" value={doctor.data.hospital} icon={Building2} hint="Primary practice" />
        <StatCard title="Joined" value={formatDate(doctor.data.createdAt)} icon={UserPlus} hint="Profile created" />
      </div>

      <div className="grid gap-4 lg:grid-cols-[320px_1fr]">
        <Card className="h-fit">
          <CardHeader>
            <CardTitle>Contact information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="flex items-center gap-3">
              <Avatar className="h-12 w-12">
                <AvatarFallback className={`text-base ${avatarColor(doctor.data.name)}`}>{initials(doctor.data.name)}</AvatarFallback>
              </Avatar>
              <div>
                <p className="font-semibold">{doctor.data.name}</p>
                <p className="text-xs text-muted-foreground">{doctor.data.specialization}</p>
              </div>
            </div>
            <div className="space-y-3 border-t border-border pt-4 text-sm">
              <div className="flex items-start gap-2.5">
                <Mail className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                <a href={`mailto:${doctor.data.email}`} className="break-all text-slate-600 hover:text-teal-700 hover:underline">{doctor.data.email}</a>
              </div>
              <div className="flex items-center gap-2.5">
                <Phone className="h-4 w-4 shrink-0 text-muted-foreground" />
                <span className="text-slate-600">{doctor.data.phone || '—'}</span>
              </div>
              <div className="flex items-start gap-2.5">
                <Building2 className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                <span className="text-slate-600">{doctor.data.hospital}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Associated patients</CardTitle>
            <Button size="sm" onClick={() => setAddOpen(true)}><Plus className="h-4 w-4" /> Add patient</Button>
          </CardHeader>
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
        </Card>
      </div>

      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Add patient under {doctor.data.name}</DialogTitle>
            <DialogDescription>The new patient will be assigned to this doctor.</DialogDescription>
          </DialogHeader>
          <PatientForm defaultDoctorId={id} onSuccess={() => { setAddOpen(false); void patients.refetch(); doctor.refetch(); }} onCancel={() => setAddOpen(false)} />
        </DialogContent>
      </Dialog>

      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit doctor</DialogTitle>
            <DialogDescription>Update this doctor's profile details.</DialogDescription>
          </DialogHeader>
          <DoctorForm doctor={doctor.data} onSuccess={() => setEditOpen(false)} onCancel={() => setEditOpen(false)} />
        </DialogContent>
      </Dialog>
    </div>
  );
}
