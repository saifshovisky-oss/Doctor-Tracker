import type { LucideIcon } from 'lucide-react';
import { Card } from '@/components/ui/card';

export function StatCard({
  title,
  value,
  icon: Icon,
  hint,
  trend,
}: {
  title: string;
  value: number | string;
  icon: LucideIcon;
  hint?: string;
  trend?: string;
}) {
  return (
    <Card className="p-5">
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{title}</p>
          <p className="text-2xl font-semibold tracking-tight text-foreground">{value}</p>
        </div>
        <div className="flex h-9 w-9 items-center justify-center rounded-md border border-border bg-slate-50">
          <Icon className="h-4 w-4 text-teal-700" />
        </div>
      </div>
      {hint && (
        <p className="mt-3 text-xs text-muted-foreground">
          {trend && <span className="mr-1 font-medium text-teal-700">{trend}</span>}
          {hint}
        </p>
      )}
    </Card>
  );
}
