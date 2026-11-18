'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { MoreHorizontal, Pencil, Plus, Trash2, UserRound } from 'lucide-react';
import { toast } from 'sonner';
import { PageHeader } from '@/components/common/page-header';
import { DataTable, type Column } from '@/components/common/data-table';
import { Pagination } from '@/components/common/pagination';
import { SearchInput } from '@/components/common/search-input';
import { DateRangeFilter, FilterDropdown } from '@/components/common/filters';
import { ConfirmDialog } from '@/components/common/confirm-dialog';
import { EntityAvatar } from '@/components/common/entity-avatar';
import { PatientForm } from '@/components/patients/patient-form';
import { DoctorCombobox } from '@/components/doctors/doctor-combobox';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useDebounce } from '@/lib/hooks/use-debounce';
import { useListParams } from '@/lib/hooks/use-list-params';
import { useConditions, useDeletePatient, usePatients } from '@/lib/hooks/use-data';
import { conditionTone, errorMessage, formatDate } from '@/lib/utils';
import type { Patient } from '@/lib/types';
import { useSearchParams } from 'next/navigation';

export default function PatientsPage() {
  const { params, setParams } = useListParams();
  const urlParams = useSearchParams();
  const [search, setSearch] = useState(params.search ?? '');
  const debouncedSearch = useDebounce(search, 350);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Patient | undefined>();

  const queryParams = { ...params, search: debouncedSearch || undefined };
  const patients = usePatients(queryParams);
  const conditions = useConditions();
  const remove = useDeletePatient();

  useEffect(() => {
    if (debouncedSearch !== (params.search ?? '')) {
      setParams({ search: debouncedSearch || undefined });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch]);

  // Deep link from doctor details: ?doctorId=…&add=true
  useEffect(() => {
    if (urlParams.get('add') === 'true') {
      setFormOpen(true);
      setParams({ add: undefined } as never);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [urlParams]);

  const openCreate = () => {
    setEditing(undefined);
    setFormOpen(true);
  };

  const openEdit = (patient: Patient) => {
    setEditing(patient);
    setFormOpen(true);
  };

  const handleDelete = async (patient: Patient) => {
    try {
      await remove.mutateAsync(patient.id);
      toast.success(`${patient.name} was deleted`);
    } catch (error) {
      toast.error(errorMessage(error));
      throw error;
    }
  };

  const handleSort = (key: string) => {
    setParams({
      sortBy: key,
      sortOrder: params.sortBy === key && params.sortOrder === 'desc' ? 'asc' : 'desc',
    });
  };

  const columns: Column<Patient>[] = [
    {
      key: 'name',
      header: 'Patient',
      sortKey: 'name',
      cell: (patient) => (
        <div className="flex items-center gap-3">
          <EntityAvatar kind="patients" id={patient.id} name={patient.name} hasPhoto={patient.hasPhoto} version={patient.updatedAt} />
          <div className="min-w-0">
            <Link
              href={`/patients/${patient.id}`}
              className="block truncate text-sm font-medium text-foreground hover:text-teal-700 hover:underline"
            >
              {patient.name}
            </Link>
            <p className="truncate text-xs text-muted-foreground">{patient.email ?? patient.phone ?? 'No contact details'}</p>
          </div>
        </div>
      ),
    },
    { key: 'age', header: 'Age', sortKey: 'age', cell: (p) => <span className="text-sm text-slate-600">{p.age ?? '—'}</span> },
    {
      key: 'gender',
      header: 'Gender',
      cell: (p) => <span className="text-sm capitalize text-slate-600">{p.gender ?? '—'}</span>,
    },
    {
      key: 'condition',
      header: 'Condition',
      sortKey: 'condition',
      cell: (p) => <Badge variant={conditionTone(p.condition)}>{p.condition}</Badge>,
    },
    {
      key: 'doctor',
      header: 'Assigned doctor',
      sortKey: 'doctorName',
      cell: (p) => (
        <div className="min-w-0">
          <p className="truncate text-sm text-slate-700">{p.doctorName ?? '—'}</p>
          <p className="truncate text-xs text-muted-foreground">{p.doctorSpecialization}</p>
        </div>
      ),
    },
    {
      key: 'createdAt',
      header: 'Registered',
      sortKey: 'createdAt',
      cell: (p) => <span className="whitespace-nowrap text-xs text-muted-foreground">{formatDate(p.createdAt)}</span>,
    },
    {
      key: 'actions',
      header: <span className="sr-only">Actions</span>,
      headClassName: 'w-12',
      cell: (patient) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" aria-label={`Actions for ${patient.name}`}>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem asChild>
              <Link href={`/patients/${patient.id}`}><UserRound className="h-4 w-4" /> View profile</Link>
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={() => openEdit(patient)}><Pencil className="h-4 w-4" /> Edit</DropdownMenuItem>
            <ConfirmDialog
              trigger={
                <div role="menuitem" tabIndex={0} className="relative flex cursor-pointer select-none items-center gap-2 rounded-sm px-2 py-1.5 text-sm text-rose-600 outline-none transition-colors focus:bg-rose-50">
                  <Trash2 className="h-4 w-4" /> Delete
                </div>
              }
              title="Delete patient?"
              description={<>Are you sure you want to delete <strong>{patient.name}</strong>? This action cannot be undone.</>}
              confirmLabel="Delete patient"
              destructive
              onConfirm={() => handleDelete(patient)}
            />
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Records"
        title="Patients"
        description="Manage patient records, conditions and doctor assignments."
        actions={<Button onClick={openCreate}><Plus className="h-4 w-4" /> Add patient</Button>}
      />

      <div className="panel overflow-hidden">
        <div className="flex flex-col gap-1 border-b border-border px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-sm font-semibold text-slate-900">Patient records</h2>
            <p className="mt-0.5 text-[11px] text-muted-foreground">
              {patients.data ? `${patients.data.totalItems} record${patients.data.totalItems === 1 ? '' : 's'} found` : 'Loading records…'}
            </p>
          </div>
          <span className="hidden items-center gap-1.5 text-[11px] text-muted-foreground sm:flex">
            <span className="h-1.5 w-1.5 rounded-full bg-teal-600" /> Synced with Atlas
          </span>
        </div>
        <div className="flex flex-col gap-3 border-b border-border bg-slate-50/60 p-4 xl:flex-row xl:items-center xl:justify-between">
          <div className="flex flex-col gap-3 sm:flex-row">
            <SearchInput value={search} onChange={setSearch} placeholder="Search patients…" debounced />
            <FilterDropdown
              label="Filter by condition"
              value={params.condition}
              onChange={(value) => setParams({ condition: value })}
              options={(conditions.data ?? []).map((c) => ({ value: c.name, label: `${c.name} (${c.value})` }))}
              placeholder="All conditions"
            />
            <div className="w-full sm:w-56">
              <DoctorCombobox
                id="filter-doctor"
                value={params.doctorId}
                onChange={(value) => setParams({ doctorId: value || undefined })}
                clearable
              />
            </div>
          </div>
          <DateRangeFilter
            startDate={params.startDate}
            endDate={params.endDate}
            onChange={(values) => setParams(values)}
          />
        </div>

        <DataTable
          columns={columns}
          data={patients.data?.data ?? []}
          rowKey={(row) => row.id}
          isLoading={patients.isPending}
          error={patients.error}
          onRetry={() => void patients.refetch()}
          sortBy={params.sortBy}
          sortOrder={params.sortOrder}
          onSort={handleSort}
          errorMessage={errorMessage(patients.error)}
          emptyTitle={debouncedSearch || params.condition || params.doctorId ? 'No patients match your filters' : 'No patients yet'}
          emptyDescription={debouncedSearch || params.condition || params.doctorId ? 'Try a different search term or clear the filters.' : 'Add your first patient to start tracking records.'}
          emptyAction={<Button onClick={openCreate}><Plus className="h-4 w-4" /> Add patient</Button>}
        />

        {patients.data && patients.data.totalItems > 0 && (
          <Pagination
            currentPage={patients.data.currentPage}
            totalPages={patients.data.totalPages}
            totalItems={patients.data.totalItems}
            limit={patients.data.limit}
            onPageChange={(page) => setParams({ page })}
          />
        )}
      </div>

      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editing ? 'Edit patient' : 'Add a new patient'}</DialogTitle>
            <DialogDescription>
              {editing ? 'Update this patient record.' : 'Fill in the details to register a new patient.'}
            </DialogDescription>
          </DialogHeader>
          <PatientForm
            patient={editing}
            defaultDoctorId={params.doctorId}
            onSuccess={() => setFormOpen(false)}
            onCancel={() => setFormOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
