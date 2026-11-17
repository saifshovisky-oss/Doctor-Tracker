'use client';

import type { ReactNode } from 'react';
import { ArrowDown, ArrowUp, ChevronsUpDown } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { EmptyState, ErrorState, LoadingSkeleton } from '@/components/common/states';
import { cn } from '@/lib/utils';

export interface Column<T> {
  key: string;
  header: ReactNode;
  cell: (row: T) => ReactNode;
  sortKey?: string;
  className?: string;
  headClassName?: string;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  rowKey: (row: T) => string;
  isLoading?: boolean;
  isFetching?: boolean;
  error?: unknown;
  onRetry?: () => void;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  onSort?: (key: string) => void;
  emptyTitle?: string;
  emptyDescription?: string;
  emptyAction?: ReactNode;
  errorMessage?: string;
}

export function DataTable<T>({
  columns,
  data,
  rowKey,
  isLoading,
  error,
  onRetry,
  sortBy,
  sortOrder,
  onSort,
  emptyTitle,
  emptyDescription,
  emptyAction,
  errorMessage,
}: DataTableProps<T>) {
  if (isLoading) return <LoadingSkeleton rows={6} columns={columns.length} />;
  if (error) return <ErrorState message={errorMessage ?? 'Unable to load records.'} onRetry={onRetry} />;
  if (!data.length) {
    return <EmptyState title={emptyTitle} description={emptyDescription} action={emptyAction} />;
  }

  return (
    <Table>
      <TableHeader>
        <TableRow className="hover:bg-slate-50/80">
          {columns.map((column) => {
            const sortable = !!column.sortKey && !!onSort;
            const active = sortBy === column.sortKey;
            return (
              <TableHead key={column.key} className={cn(column.headClassName)}>
                {sortable ? (
                  <button
                    type="button"
                    onClick={() => onSort!(column.sortKey!)}
                    aria-label={`Sort by ${column.key}`}
                    className={cn(
                      'inline-flex items-center gap-1 rounded transition-colors hover:text-foreground',
                      active && 'text-foreground',
                    )}
                  >
                    {column.header}
                    {active ? (
                      sortOrder === 'asc' ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />
                    ) : (
                      <ChevronsUpDown className="h-3 w-3 opacity-50" />
                    )}
                  </button>
                ) : (
                  column.header
                )}
              </TableHead>
            );
          })}
        </TableRow>
      </TableHeader>
      <TableBody>
        {data.map((row) => (
          <TableRow key={rowKey(row)}>
            {columns.map((column) => (
              <TableCell key={column.key} className={cn(column.className)}>
                {column.cell(row)}
              </TableCell>
            ))}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
