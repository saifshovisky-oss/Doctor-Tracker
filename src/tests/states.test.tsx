import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { EmptyState, ErrorState, LoadingSkeleton } from '@/components/common/states';
import { Pagination } from '@/components/common/pagination';
import { DataTable, type Column } from '@/components/common/data-table';

describe('Reusable UI states', () => {
  it('renders an empty state with a custom action', () => {
    render(<EmptyState title="Nothing here" description="Add a record" action={<button>Add</button>} />);
    expect(screen.getByText('Nothing here')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Add' })).toBeInTheDocument();
  });

  it('renders an error state with retry', () => {
    const retry = vi.fn();
    render(<ErrorState message="Server exploded" onRetry={retry} />);
    expect(screen.getByText('Server exploded')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /try again/i }));
    expect(retry).toHaveBeenCalledOnce();
  });

  it('renders an accessible loading skeleton', () => {
    render(<LoadingSkeleton rows={2} columns={3} />);
    expect(screen.getByLabelText('Loading')).toHaveAttribute('aria-busy', 'true');
  });

  it('disables pagination at the boundaries', () => {
    const change = vi.fn();
    render(<Pagination currentPage={1} totalPages={3} totalItems={25} limit={10} onPageChange={change} />);
    expect(screen.getByRole('button', { name: 'Previous page' })).toBeDisabled();
    fireEvent.click(screen.getByRole('button', { name: 'Next page' }));
    expect(change).toHaveBeenCalledWith(2);
  });

  it('renders table rows and supports sortable headers', () => {
    type Row = { id: string; name: string };
    const columns: Column<Row>[] = [
      { key: 'name', header: 'Name', sortKey: 'name', cell: (r) => r.name },
    ];
    const sort = vi.fn();
    render(
      <DataTable
        columns={columns}
        data={[{ id: '1', name: 'Alice' }, { id: '2', name: 'Bob' }]}
        rowKey={(r) => r.id}
        sortBy="name"
        sortOrder="asc"
        onSort={sort}
      />,
    );
    expect(screen.getByText('Alice')).toBeInTheDocument();
    expect(screen.getByText('Bob')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Sort by name' }));
    expect(sort).toHaveBeenCalledWith('name');
  });
});
