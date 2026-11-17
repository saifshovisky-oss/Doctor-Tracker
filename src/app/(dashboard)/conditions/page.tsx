'use client';

import { useState } from 'react';
import { FlaskConical, Pencil, Plus, Trash2, Users } from 'lucide-react';
import { toast } from 'sonner';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { PageHeader } from '@/components/common/page-header';
import { DataTable, type Column } from '@/components/common/data-table';
import { Pagination } from '@/components/common/pagination';
import { SearchInput } from '@/components/common/search-input';
import { ConfirmDialog } from '@/components/common/confirm-dialog';
import { Spinner } from '@/components/common/states';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useDebounce } from '@/lib/hooks/use-debounce';
import { useListParams } from '@/lib/hooks/use-list-params';
import {
  useConditionsCatalog,
  useCreateCondition,
  useDeleteCondition,
  useUpdateCondition,
} from '@/lib/hooks/use-data';
import { conditionSchema } from '@/lib/validators';
import { conditionTone, errorMessage, formatDate } from '@/lib/utils';
import type { Condition, ConditionFormValues } from '@/lib/types';

function ConditionForm({
  condition,
  onSuccess,
  onCancel,
}: {
  condition?: Condition;
  onSuccess: () => void;
  onCancel: () => void;
}) {
  const create = useCreateCondition();
  const update = useUpdateCondition();
  const pending = create.isPending || update.isPending;

  const form = useForm<ConditionFormValues>({
    resolver: zodResolver(conditionSchema),
    defaultValues: { name: condition?.name ?? '' },
  });

  const onSubmit = form.handleSubmit(async (values) => {
    try {
      if (condition) {
        await update.mutateAsync({ id: condition.id, values });
        toast.success('Condition updated');
      } else {
        await create.mutateAsync(values);
        toast.success('Condition added');
      }
      onSuccess();
    } catch (error) {
      toast.error(errorMessage(error));
    }
  });

  return (
    <form onSubmit={onSubmit} className="space-y-5" noValidate>
      <div className="space-y-2">
        <Label htmlFor="condition-name" className="text-[12px] font-semibold uppercase tracking-wide text-slate-500">
          Condition name
        </Label>
        <Input
          id="condition-name"
          placeholder="e.g. Hypertension"
          aria-invalid={!!form.formState.errors.name}
          autoFocus
          {...form.register('name')}
        />
        {form.formState.errors.name && (
          <p role="alert" className="text-xs text-rose-600">
            {form.formState.errors.name.message}
          </p>
        )}
        <p className="text-[11px] text-muted-foreground">
          Renaming an existing condition updates all patient records that use it.
        </p>
      </div>
      <div className="flex justify-end gap-2 border-t border-border pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
        <Button type="submit" disabled={pending}>
          {pending && <Spinner />}
          {condition ? 'Save changes' : 'Add condition'}
        </Button>
      </div>
    </form>
  );
}

export default function ConditionsPage() {
  const { params, setParams } = useListParams();
  const [search, setSearch] = useState(params.search ?? '');
  const debouncedSearch = useDebounce(search, 350);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Condition | undefined>();

  const queryParams = { ...params, search: debouncedSearch || undefined };
  const catalog = useConditionsCatalog(queryParams);
  const remove = useDeleteCondition();

  const openCreate = () => {
    setEditing(undefined);
    setFormOpen(true);
  };

  const openEdit = (condition: Condition) => {
    setEditing(condition);
    setFormOpen(true);
  };

  const handleDelete = async (condition: Condition) => {
    try {
      await remove.mutateAsync(condition.id);
      toast.success(`"${condition.name}" deleted`);
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

  const columns: Column<Condition>[] = [
    {
      key: 'name',
      header: 'Condition',
      sortKey: 'name',
      cell: (c) => (
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-border bg-slate-50">
            <FlaskConical className="h-4 w-4 text-slate-400" strokeWidth={1.8} />
          </div>
          <Badge variant={conditionTone(c.name)} className="text-[13px] font-medium">
            {c.name}
          </Badge>
        </div>
      ),
    },
    {
      key: 'patientCount',
      header: 'Patients',
      sortKey: 'patientCount',
      cell: (c) => (
        <span className="inline-flex items-center gap-1.5 text-sm text-slate-600">
          <Users className="h-3.5 w-3.5 text-muted-foreground" />
          {c.patientCount}
        </span>
      ),
    },
    {
      key: 'createdAt',
      header: 'Added',
      sortKey: 'createdAt',
      cell: (c) => (
        <span className="whitespace-nowrap text-xs text-muted-foreground">{formatDate(c.createdAt)}</span>
      ),
    },
    {
      key: 'actions',
      header: <span className="sr-only">Actions</span>,
      headClassName: 'w-20',
      cell: (c) => (
        <div className="flex items-center justify-end gap-1">
          <Button
            variant="ghost"
            size="icon"
            aria-label={`Edit ${c.name}`}
            title="Edit condition"
            onClick={() => openEdit(c)}
          >
            <Pencil className="h-4 w-4 text-slate-500" />
          </Button>
          <ConfirmDialog
            trigger={
              <Button variant="ghost" size="icon" aria-label={`Delete ${c.name}`} title="Delete condition">
                <Trash2 className="h-4 w-4 text-rose-500" />
              </Button>
            }
            title="Delete condition?"
            description={
              c.patientCount > 0 ? (
                <>
                  <strong>{c.name}</strong> is currently used by{' '}
                  <strong>
                    {c.patientCount} patient{c.patientCount === 1 ? '' : 's'}
                  </strong>
                  . Reassign or update those patients before deleting this condition.
                </>
              ) : (
                <>
                  Remove <strong>{c.name}</strong> from the catalog? This cannot be undone.
                </>
              )
            }
            confirmLabel={c.patientCount > 0 ? 'Got it' : 'Delete'}
            destructive={c.patientCount === 0}
            onConfirm={() => handleDelete(c)}
          />
        </div>
      ),
    },
  ];

  const total = catalog.data?.totalItems ?? 0;

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Catalog"
        title="Conditions"
        description="Manage the medical conditions used across patient records. Renaming a condition updates all patients that use it."
        actions={<Button onClick={openCreate}><Plus className="h-4 w-4" /> Add condition</Button>}
      />

      <div className="panel overflow-hidden">
        <div className="flex flex-col gap-1 border-b border-border px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-sm font-semibold text-slate-900">Conditions catalog</h2>
            <p className="mt-0.5 text-[11px] text-muted-foreground">
              {catalog.data
                ? `${total} condition${total === 1 ? '' : 's'} in the catalog`
                : 'Loading…'}
            </p>
          </div>
          <span className="hidden items-center gap-1.5 text-[11px] text-muted-foreground sm:flex">
            <span className="h-1.5 w-1.5 rounded-full bg-teal-600" /> Live patient counts
          </span>
        </div>

        <div className="border-b border-border bg-slate-50/60 p-4">
          <SearchInput
            value={search}
            onChange={setSearch}
            placeholder="Search conditions…"
            debounced
          />
        </div>

        <DataTable
          columns={columns}
          data={catalog.data?.data ?? []}
          rowKey={(row) => row.id}
          isLoading={catalog.isPending}
          error={catalog.error}
          onRetry={() => void catalog.refetch()}
          sortBy={params.sortBy}
          sortOrder={params.sortOrder}
          onSort={handleSort}
          errorMessage={errorMessage(catalog.error)}
          emptyTitle={debouncedSearch ? 'No conditions match your search' : 'No conditions yet'}
          emptyDescription={
            debouncedSearch
              ? 'Try a different search term.'
              : 'Add a condition to build the catalog. It will then appear as a suggestion in the patient form.'
          }
          emptyAction={
            !debouncedSearch ? (
              <Button onClick={openCreate}>
                <Plus className="h-4 w-4" /> Add condition
              </Button>
            ) : undefined
          }
        />

        {catalog.data && total > 0 && (
          <Pagination
            currentPage={catalog.data.currentPage}
            totalPages={catalog.data.totalPages}
            totalItems={total}
            limit={catalog.data.limit}
            onPageChange={(page) => setParams({ page })}
          />
        )}
      </div>

      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>{editing ? 'Edit condition' : 'Add a condition'}</DialogTitle>
            <DialogDescription>
              {editing
                ? 'Update the name. All patient records with this condition will be renamed automatically.'
                : 'Add a new condition to the catalog. It will appear as a suggestion in the patient form.'}
            </DialogDescription>
          </DialogHeader>
          <ConditionForm
            condition={editing}
            onSuccess={() => setFormOpen(false)}
            onCancel={() => setFormOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
