'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowUpRight, CalendarRange, HeartPulse, Stethoscope, UserPlus, Users } from 'lucide-react';
import { toast } from 'sonner';
import { PageHeader } from '@/components/common/page-header';
import { StatCard } from '@/components/common/stat-card';
import { ChartCard } from '@/components/dashboard/chart-card';
import { EmptyState, ErrorState, LoadingSkeleton, Spinner } from '@/components/common/states';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  useConditions,
  useDashboardStats,
  useDashboardTrends,
  usePatientsPerDoctor,
  useRecentPatients,
  useSpecializationDistribution,
} from '@/lib/hooks/use-data';
import { avatarColor, conditionTone, errorMessage, formatDate, initials } from '@/lib/utils';
import { doctorsApi } from '@/lib/api/doctors';
import { useQuery } from '@tanstack/react-query';

export default function DashboardPage() {
  const [months, setMonths] = useState(6);
  const stats = useDashboardStats();
  const trends = useDashboardTrends({ months });
  const perDoctor = usePatientsPerDoctor();
  const conditions = useConditions();
  const specializations = useSpecializationDistribution();
  const recent = useRecentPatients();

  const topDoctors = useQuery({
    queryKey: ['dashboard', 'top-doctors'],
    queryFn: () => doctorsApi.list({ page: 1, limit: 5, sortBy: 'patientCount', sortOrder: 'desc' }),
  });

  const anyError = stats.error || trends.error || perDoctor.error || conditions.error || specializations.error;
  const message = [stats, trends, perDoctor, conditions, specializations].find((q) => q.error)?.error;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Dashboard"
        description="An overview of your clinic's doctors, patients and activity."
        actions={
          <div className="flex items-center gap-2">
            <CalendarRange className="h-4 w-4 text-muted-foreground" />
            <Select value={String(months)} onValueChange={(v) => setMonths(Number(v))}>
              <SelectTrigger className="w-40" aria-label="Date range">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="3">Last 3 months</SelectItem>
                <SelectItem value="6">Last 6 months</SelectItem>
                <SelectItem value="12">Last 12 months</SelectItem>
              </SelectContent>
            </Select>
          </div>
        }
      />

      {message && <ErrorState message={errorMessage(message)} onRetry={() => { stats.refetch(); trends.refetch(); perDoctor.refetch(); conditions.refetch(); specializations.refetch(); }} />}
      {anyError && !message && <ErrorState message="Some metrics could not be loaded." />}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.isPending ? (
          Array.from({ length: 4 }).map((_, i) => <LoadingSkeleton key={i} rows={2} columns={1} />)
        ) : (
          <>
            <StatCard title="Total doctors" value={stats.data?.totalDoctors ?? 0} icon={Stethoscope} hint="Registered in your clinic" />
            <StatCard title="Total patients" value={stats.data?.totalPatients ?? 0} icon={Users} hint="Across all doctors" />
            <StatCard title="New doctors this month" value={stats.data?.newDoctorsThisMonth ?? 0} icon={UserPlus} hint="Added since the 1st" trend="+" />
            <StatCard title="New patients this month" value={stats.data?.newPatientsThisMonth ?? 0} icon={HeartPulse} hint="Registered since the 1st" trend="+" />
          </>
        )}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <ChartCard title="Patient registrations" description={`Monthly registrations over the last ${months} months`} kind="trend" data={trends.data ?? []} />
        <ChartCard title="Patients per doctor" description="Doctors with the most assigned patients" kind="doctors" data={perDoctor.data ?? []} />
        <ChartCard title="Condition distribution" description="Patients grouped by condition" kind="pie" data={conditions.data ?? []} />
        <ChartCard title="Specialization distribution" description="Doctors grouped by specialization" kind="pie" data={specializations.data ?? []} />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Recent patients</CardTitle>
            <Link href="/patients" className="flex items-center gap-1 text-xs font-medium text-teal-700 hover:underline">
              View all <ArrowUpRight className="h-3 w-3" />
            </Link>
          </CardHeader>
          <CardContent>
            {recent.isPending ? (
              <LoadingSkeleton rows={4} columns={3} />
            ) : recent.data?.length ? (
              <ul className="divide-y divide-border">
                {recent.data.map((patient) => (
                  <li key={patient.id} className="flex items-center gap-3 py-2.5">
                    <Avatar>
                      <AvatarFallback className={avatarColor(patient.name)}>{initials(patient.name)}</AvatarFallback>
                    </Avatar>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">{patient.name}</p>
                      <p className="truncate text-xs text-muted-foreground">{patient.doctorName ?? 'Unassigned'}</p>
                    </div>
                    <Badge variant={conditionTone(patient.condition)}>{patient.condition}</Badge>
                  </li>
                ))}
              </ul>
            ) : (
              <EmptyState title="No recent activity" description="Patient registrations will show up here." />
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Top doctors</CardTitle>
            <Link href="/doctors" className="flex items-center gap-1 text-xs font-medium text-teal-700 hover:underline">
              View all <ArrowUpRight className="h-3 w-3" />
            </Link>
          </CardHeader>
          <CardContent>
            {topDoctors.isPending ? (
              <LoadingSkeleton rows={4} columns={3} />
            ) : topDoctors.data?.data.length ? (
              <ul className="divide-y divide-border">
                {topDoctors.data.data.map((doctor) => (
                  <li key={doctor.id} className="flex items-center gap-3 py-2.5">
                    <Avatar>
                      <AvatarFallback className={avatarColor(doctor.name)}>{initials(doctor.name)}</AvatarFallback>
                    </Avatar>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">{doctor.name}</p>
                      <p className="truncate text-xs text-muted-foreground">{doctor.hospital}</p>
                    </div>
                    <Badge variant={conditionTone(doctor.specialization)}>{doctor.patientCount} patients</Badge>
                  </li>
                ))}
              </ul>
            ) : (
              <EmptyState title="No doctors yet" description="Add a doctor to get started." />
            )}
          </CardContent>
        </Card>
      </div>
      {trends.isFetching && <div className="flex justify-center"><Spinner className="text-teal-700" /></div>}
      <p className="text-xs text-muted-foreground">Last updated {formatDate(new Date(), true)} UTC</p>
    </div>
  );
}
