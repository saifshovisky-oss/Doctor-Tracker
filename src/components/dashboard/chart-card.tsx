'use client';

import dynamic from 'next/dynamic';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
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
  return (
    <Card className="min-w-0">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="pb-5">
        {kind === 'trend' && <PatientTrendChart data={data as TrendPoint[]} />}
        {kind === 'doctors' && <PatientsPerDoctorChart data={data as DoctorCount[]} />}
        {kind === 'pie' && <DistributionPieChart data={data as NamedCount[]} label={title} />}
      </CardContent>
    </Card>
  );
}
