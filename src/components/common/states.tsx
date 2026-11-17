import { AlertCircle, Inbox, Loader2, RefreshCw, SearchX } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

export function EmptyState({
  title = 'No records found',
  description = 'Try adjusting your search or filters, or add a new record.',
  action,
  icon: Icon = Inbox,
}: {
  title?: string;
  description?: string;
  action?: React.ReactNode;
  icon?: React.ComponentType<{ className?: string }>;
}) {
  return (
    <div className="flex flex-col items-center justify-center px-6 py-14 text-center">
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-md border border-slate-200 bg-slate-50">
        <Icon className="h-5 w-5 text-slate-400" />
      </div>
      <p className="text-sm font-semibold text-slate-800">{title}</p>
      <p className="mt-1.5 max-w-sm text-[13px] leading-relaxed text-muted-foreground">{description}</p>
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

export function NoResultsState({ onClear }: { onClear?: () => void }) {
  return (
    <EmptyState
      icon={SearchX}
      title="Nothing matched your search"
      description="Check the spelling or remove a filter to see more results."
      action={onClear ? <Button variant="outline" size="sm" onClick={onClear}>Clear filters</Button> : undefined}
    />
  );
}

export function ErrorState({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div role="alert" className="flex flex-col items-center justify-center px-6 py-14 text-center">
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-md border border-rose-200 bg-rose-50">
        <AlertCircle className="h-5 w-5 text-rose-600" />
      </div>
      <p className="text-sm font-semibold text-slate-800">Could not load data</p>
      <p className="mt-1.5 max-w-md text-[13px] leading-relaxed text-muted-foreground">{message}</p>
      {onRetry && (
        <Button variant="outline" size="sm" className="mt-5" onClick={onRetry}>
          <RefreshCw className="h-3.5 w-3.5" /> Try again
        </Button>
      )}
    </div>
  );
}

export function LoadingSkeleton({ rows = 6, columns = 5, className }: { rows?: number; columns?: number; className?: string }) {
  return (
    <div className={cn('space-y-3 p-5', className)} aria-label="Loading" aria-busy="true">
      <Skeleton className="h-9 w-full max-w-sm" />
      <div className="border-t border-border pt-4">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="flex gap-4 border-b border-border/60 py-3 last:border-0">
            {Array.from({ length: columns }).map((__, j) => (
              <Skeleton key={j} className={cn('h-5', j === 0 ? 'w-1/4' : 'flex-1')} />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

export function Spinner({ className }: { className?: string }) {
  return <Loader2 className={cn('h-4 w-4 animate-spin', className)} />;
}
