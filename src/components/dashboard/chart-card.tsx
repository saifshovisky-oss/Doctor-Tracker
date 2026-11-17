'use client';

import dynamic from 'next/dynamic';
import { Skeleton } from '@/components/ui/skeleton';
import type { DoctorCount, NamedCount, TrendPoint } from '@/lib/types';

const PatientTrendChart = dynamic(() => import('./charts').then((m) => m.PatientTrendChart), {
  ssr: false,
  loading: () => <Skeleton className="h-[260px] w-full" />,
});
const PatientsPerDoctorChart = dynamic(() => import('./charts').then((m) => m.PatientsPerDoctorChart), {
  ssr: false,
  loading: () => <Skeleton className="h-[260px] w-full" />,
});
const DistributionPieChart = dynamic(() => import('./charts').then((m) => m.DistributionPieChart), {
  ssr: false,
  loading: () => <Skeleton className="h-[220px] w-full" />,
});

export function ChartCard({
  title,
  description,
  kind,
  data,
}: {
  title: string;
  description: string;
  kind: 'trend' | 'doctors' | 'pie';
  data: TrendPoint[] | DoctorCount[] | NamedCount[];
}) {
  const total =
    kind === 'trend'
      ? (data as TrendPoint[]).reduce((sum, point) => sum + point.count, 0)
      : kind === 'pie'
        ? (data as NamedCount[]).reduce((sum, item) => sum + item.value, 0)
        : undefined;

  return (
    <div className="panel flex h-full flex-col overflow-hidden">
      <div className="flex items-start justify-between gap-4 border-b border-border px-5 py-4">
        <div className="min-w-0">
          <h3 className="text-sm font-semibold tracking-tight text-slate-900">{title}</h3>
          <p className="mt-1 text-[11px] leading-relaxed text-muted-foreground">{description}</p>
        </div>
        {total !== undefined && (
          <div className="shrink-0 rounded-md border border-slate-200 bg-slate-50 px-2.5 py-1 text-right">
            <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">Total</p>
            <p className="text-sm font-semibold tabular-nums text-slate-800">{total}</p>
          </div>
        )}
      </div>
      <div className="flex-1 px-4 py-5 sm:px-5">
        {kind === 'trend' && <PatientTrendChart data={data as TrendPoint[]} />}
        {kind === 'doctors' && <PatientsPerDoctorChart data={data as DoctorCount[]} />}
        {kind === 'pie' && <DistributionPieChart data={data as NamedCount[]} label={title} />}
      </div>
    </div>
  );
}
