import Link from 'next/link';
import type { ComponentType } from 'react';
import { cn } from '@/lib/utils';

export function StatCard({
  title,
  value,
  icon: Icon,
  hint,
  trend,
  feature = false,
  accent = 'teal',
  href,
}: {
  title: string;
  value: number | string;
  icon: ComponentType<{ className?: string; strokeWidth?: number }>;
  hint?: string;
  trend?: string;
  feature?: boolean;
  accent?: 'teal' | 'sky' | 'indigo' | 'amber';
  href?: string;
}) {
  const accents = {
    teal: 'bg-teal-50 text-teal-700',
    sky: 'bg-sky-50 text-sky-700',
    indigo: 'bg-indigo-50 text-indigo-700',
    amber: 'bg-amber-50 text-amber-700',
  };

  const hover = 'transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lift focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-600/40';

  const content = feature ? (
    <div className={cn('relative h-full overflow-hidden rounded-lg bg-slate-900 p-5 text-white shadow-panel', hover)}>
      <div className="absolute right-0 top-0 h-24 w-24 rounded-bl-[80px] bg-teal-500/10" aria-hidden />
      <div className="relative flex items-start justify-between gap-4">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400">{title}</p>
          <p className="mt-3 text-[34px] font-semibold leading-none tracking-tight tabular-nums">{value}</p>
        </div>
        <div className="flex h-10 w-10 items-center justify-center rounded-md bg-white/10 text-teal-300">
          <Icon className="h-5 w-5" strokeWidth={1.8} />
        </div>
      </div>
      {hint && <p className="relative mt-4 text-xs text-slate-400">{hint}</p>}
    </div>
  ) : (
    <div className={cn('relative h-full overflow-hidden rounded-lg border border-border/80 bg-card p-5 shadow-panel', hover)}>
      <span className={cn('absolute inset-x-0 top-0 h-0.5', accents[accent])} aria-hidden />
      <div className="flex items-start justify-between gap-3">
        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">{title}</p>
        <div className={cn('flex h-9 w-9 items-center justify-center rounded-md transition-colors', accents[accent])}>
          <Icon className="h-[18px] w-[18px]" strokeWidth={1.8} />
        </div>
      </div>
      <p className="mt-4 text-[28px] font-semibold leading-none tracking-tight tabular-nums text-slate-900">{value}</p>
      {hint && (
        <p className="mt-3 text-[11px] text-muted-foreground">
          {trend && <span className="mr-1.5 font-semibold text-teal-700">{trend}</span>}
          {hint}
        </p>
      )}
    </div>
  );

  if (href) {
    return (
      <Link href={href} aria-label={`${title}: ${value}. View details`} className="block h-full rounded-lg">
        {content}
      </Link>
    );
  }

  return content;
}
