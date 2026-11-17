import type { SVGProps } from 'react';
import { cn } from '@/lib/utils';

type IconComponent = React.ComponentType<SVGProps<SVGSVGElement>> | React.ComponentType<{ className?: string; strokeWidth?: number }>;

const accentColors = {
  teal: 'text-teal-600',
  sky: 'text-sky-600',
  indigo: 'text-indigo-600',
  amber: 'text-amber-500',
};

const accentBorder = {
  teal: 'bg-teal-600',
  sky: 'bg-sky-600',
  indigo: 'bg-indigo-600',
  amber: 'bg-amber-500',
};

export function StatCard({
  title,
  value,
  icon: Icon,
  hint,
  trend,
  feature = false,
  accent = 'teal',
}: {
  title: string;
  value: number | string;
  icon: IconComponent;
  hint?: string;
  trend?: string;
  feature?: boolean;
  accent?: 'teal' | 'sky' | 'indigo' | 'amber';
}) {
  if (feature) {
    return (
      <div className="relative overflow-hidden rounded-lg bg-slate-900 p-5 text-white shadow-panel">
        <div className="absolute right-0 top-0 h-24 w-24 rounded-bl-[80px] bg-teal-500/10" aria-hidden />
        <div className="relative flex items-start justify-between gap-4">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400">{title}</p>
            <p className="mt-3 text-[34px] font-semibold leading-none tracking-tight tabular-nums">{value}</p>
          </div>
          {/* No background box — just the icon itself, tinted teal */}
          <Icon className="h-10 w-10 shrink-0 text-teal-300 opacity-90" strokeWidth={1.6} />
        </div>
        {hint && <p className="relative mt-4 text-xs text-slate-400">{hint}</p>}
      </div>
    );
  }

  return (
    <div className="group relative overflow-hidden rounded-lg border border-border/80 bg-card p-5 shadow-panel transition-shadow hover:shadow-lift">
      <span className={cn('absolute inset-x-0 top-0 h-0.5', accentBorder[accent])} aria-hidden />
      <div className="flex items-start justify-between gap-3">
        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">{title}</p>
        {/* Icon without any background container — just the coloured SVG */}
        <Icon className={cn('h-8 w-8 shrink-0', accentColors[accent])} strokeWidth={1.6} />
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
}
