'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { MoreHorizontal, Pencil, Plus, Stethoscope, Trash2, UserPlus, Users } from 'lucide-react';
import { toast } from 'sonner';
import { PageHeader } from '@/components/common/page-header';
import { DataTable, type Column } from '@/components/common/data-table';
import { Pagination } from '@/components/common/pagination';
import { SearchInput } from '@/components/common/search-input';
import { DateRangeFilter, FilterDropdown } from '@/components/common/filters';
import { ConfirmDialog } from '@/components/common/confirm-dialog';
import { EmptyState } from '@/components/common/states';
import { EntityAvatar } from '@/components/common/entity-avatar';
import { DoctorForm } from '@/components/doctors/doctor-form';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useDebounce } from '@/lib/hooks/use-debounce';
import { useListParams } from '@/lib/hooks/use-list-params';
import { useDeleteDoctor, useDoctors, useSpecializations } from '@/lib/hooks/use-data';
import { avatarColor, errorMessage, formatDate } from '@/lib/utils';
import type { Doctor } from '@/lib/types';

export default function DoctorsPage() {
  const { params, setParams } = useListParams();
  const [search, setSearch] = useState(params.search ?? '');
  const debouncedSearch = useDebounce(search, 350);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Doctor | undefined>();

  const queryParams = { ...params, search: debouncedSearch || undefined };
  const doctors = useDoctors(queryParams);
  const specializations = useSpecializations();
  const remove = useDeleteDoctor();

  // Keep the URL (and therefore shareable state) in sync with the debounced search.
  useEffect(() => {
    if (debouncedSearch !== (params.search ?? '')) {
      setParams({ search: debouncedSearch || undefined });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch]);

  const openCreate = () => {
    setEditing(undefined);
    setFormOpen(true);
  };

  const openEdit = (doctor: Doctor) => {
    setEditing(doctor);
    setFormOpen(true);
  };

  const handleDelete = async (doctor: Doctor) => {
    try {
      await remove.mutateAsync(doctor.id);
      toast.success(`Dr. ${doctor.name} was deleted`);
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

  const columns: Column<Doctor>[] = [
    {
      key: 'name',
      header: 'Doctor',
      sortKey: 'name',
      cell: (doctor) => (
        <div className="flex items-center gap-3">
          <EntityAvatar kind="doctors" id={doctor.id} name={doctor.name} hasPhoto={doctor.hasPhoto} version={doctor.updatedAt} />
          <div className="min-w-0">
            <Link href={`/doctors/${doctor.id}`} className="block truncate text-sm font-medium text-foreground hover:text-teal-700 hover:underline">
              {doctor.name}
            </Link>
            <span className="text-xs text-muted-foreground">{doctor.email}</span>
          </div>
        </div>
      ),
    },
    {
      key: 'specialization',
      header: 'Specialization',
      sortKey: 'specialization',
      cell: (doctor) => (
        <div className="flex flex-wrap gap-1">
          {(doctor.specializations?.length ? doctor.specializations : [doctor.specialization])
            .filter(Boolean)
            .map((item) => (
              <Badge key={item} variant="teal">{item}</Badge>
            ))}
        </div>
      ),
    },
    { key: 'hospital', header: 'Hospital', sortKey: 'hospital', cell: (doctor) => <span className="text-sm text-slate-600">{doctor.hospital}</span> },
    { key: 'phone', header: 'Phone', cell: (doctor) => <span className="text-sm text-slate-600">{doctor.phone || '—'}</span> },
    {
      key: 'patients',
      header: 'Patients',
      sortKey: 'patientCount',
      cell: (doctor) => (
        <span className="inline-flex items-center gap-1 text-sm text-slate-600">
          <Users className="h-3.5 w-3.5 text-muted-foreground" /> {doctor.patientCount}
        </span>
      ),
    },
    {
      key: 'createdAt',
      header: 'Created',
      sortKey: 'createdAt',
      cell: (doctor) => <span className="whitespace-nowrap text-xs text-muted-foreground">{formatDate(doctor.createdAt)}</span>,
    },
    {
      key: 'actions',
      header: <span className="sr-only">Actions</span>,
      headClassName: 'w-12',
      cell: (doctor) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" aria-label={`Actions for ${doctor.name}`}>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem asChild>
              <Link href={`/doctors/${doctor.id}`}><Stethoscope className="h-4 w-4" /> View details</Link>
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={() => openEdit(doctor)}><Pencil className="h-4 w-4" /> Edit</DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href={`/patients?doctorId=${doctor.id}&add=true`}><UserPlus className="h-4 w-4" /> Add patient</Link>
            </DropdownMenuItem>
            <ConfirmDialog
              trigger={
                <div role="menuitem" tabIndex={0} className="relative flex cursor-pointer select-none items-center gap-2 rounded-sm px-2 py-1.5 text-sm text-rose-600 outline-none transition-colors focus:bg-rose-50">
                  <Trash2 className="h-4 w-4" /> Delete
                </div>
              }
              title="Delete doctor?"
              description={doctor.patientCount > 0 ? (
                <>This doctor still has <strong>{doctor.patientCount} associated patient{doctor.patientCount === 1 ? '' : 's'}</strong>. Reassign or remove them before deleting.</>
              ) : (
                <>Are you sure you want to delete <strong>{doctor.name}</strong>? This action cannot be undone.</>
              )}
              confirmLabel={doctor.patientCount > 0 ? 'Got it' : 'Delete doctor'}
              destructive={doctor.patientCount === 0}
              onConfirm={() => handleDelete(doctor)}
            />
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Directory"
        title="Doctors"
        description="Manage doctor profiles, specializations and patient assignments."
        actions={<Button onClick={openCreate}><Plus className="h-4 w-4" /> Add doctor</Button>}
      />

      <div className="panel overflow-hidden">
        <div className="flex flex-col gap-1 border-b border-border px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-sm font-semibold text-slate-900">Doctor directory</h2>
            <p className="mt-0.5 text-[11px] text-muted-foreground">
              {doctors.data ? `${doctors.data.totalItems} record${doctors.data.totalItems === 1 ? '' : 's'} found` : 'Loading records…'}
            </p>
          </div>
          <span className="hidden items-center gap-1.5 text-[11px] text-muted-foreground sm:flex">
            <span className="h-1.5 w-1.5 rounded-full bg-teal-600" /> Synced with Atlas
          </span>
        </div>
        <div className="flex flex-col gap-3 border-b border-border bg-slate-50/60 p-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-col gap-3 sm:flex-row">
            <SearchInput value={search} onChange={setSearch} placeholder="Search doctors…" debounced />
            <FilterDropdown
              label="Filter by specialization"
              value={params.specialization}
              onChange={(value) => setParams({ specialization: value })}
              options={(specializations.data ?? []).map((s) => ({ value: s, label: s }))}
              placeholder="All specializations"
            />
          </div>
          <DateRangeFilter
            startDate={params.startDate}
            endDate={params.endDate}
            onChange={(values) => setParams(values)}
          />
        </div>

        <DataTable
          columns={columns}
          data={doctors.data?.data ?? []}
          rowKey={(row) => row.id}
          isLoading={doctors.isPending}
          error={doctors.error}
          onRetry={() => void doctors.refetch()}
          sortBy={params.sortBy}
          sortOrder={params.sortOrder}
          onSort={handleSort}
          errorMessage={errorMessage(doctors.error)}
          emptyTitle={debouncedSearch || params.specialization ? 'No doctors match your filters' : 'No doctors yet'}
          emptyDescription={debouncedSearch || params.specialization ? 'Try a different search term or clear the filters.' : 'Add your first doctor to start building your clinic directory.'}
          emptyAction={<Button onClick={openCreate}><Plus className="h-4 w-4" /> Add doctor</Button>}
        />

        {doctors.data && doctors.data.totalItems > 0 && (
          <Pagination
            currentPage={doctors.data.currentPage}
            totalPages={doctors.data.totalPages}
            totalItems={doctors.data.totalItems}
            limit={doctors.data.limit}
            onPageChange={(page) => setParams({ page })}
          />
        )}
      </div>

      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editing ? 'Edit doctor' : 'Add a new doctor'}</DialogTitle>
            <DialogDescription>
              {editing ? 'Update the details of this doctor profile.' : 'Fill in the details to add a doctor to your clinic.'}
            </DialogDescription>
          </DialogHeader>
          <DoctorForm doctor={editing} onSuccess={() => setFormOpen(false)} onCancel={() => setFormOpen(false)} />
        </DialogContent>
      </Dialog>
    </div>
  );
}
