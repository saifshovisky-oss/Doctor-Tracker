'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useQueryClient } from '@tanstack/react-query';
import {
  Activity,
  ArrowUpRight,
  CalendarRange,
  ClipboardList,
  RefreshCw,
  Stethoscope,
} from 'lucide-react';
import { PageHeader } from '@/components/common/page-header';
import { StatCard } from '@/components/common/stat-card';
import { ChartCard } from '@/components/dashboard/chart-card';
import { EmptyState, ErrorState, LoadingSkeleton, Spinner } from '@/components/common/states';
import { EntityAvatar } from '@/components/common/entity-avatar';
import { DoctorsIcon, InsightsIcon, PatientsIcon } from '@/components/brand/dt-icons';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/components/providers/auth-provider';
import {
  useConditions,
  useDashboardStats,
  useDashboardTrends,
  usePatientsPerDoctor,
  useRecentPatients,
  useSpecializationDistribution,
} from '@/lib/hooks/use-data';
import { avatarColor, conditionTone, errorMessage, formatDate } from '@/lib/utils';
import { doctorsApi } from '@/lib/api/doctors';
import { useQuery } from '@tanstack/react-query';

function SectionHeading({ children, meta }: { children: React.ReactNode; meta?: string }) {
  return (
    <div className="flex items-center gap-4">
      <h2 className="eyebrow whitespace-nowrap text-slate-500">{children}</h2>
      <span className="h-px flex-1 bg-border" />
      {meta && <span className="hidden text-[11px] text-muted-foreground sm:block">{meta}</span>}
    </div>
  );
}

export default function DashboardPage() {
  const [months, setMonths] = useState(6);
  const queryClient = useQueryClient();
  const { user } = useAuth();
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

  const queries = [stats, trends, perDoctor, conditions, specializations, recent, topDoctors];
  const failed = queries.find((query) => query.error);
  const refreshing = queries.some((query) => query.isFetching);

  const refresh = () => {
    void queryClient.invalidateQueries({ queryKey: ['dashboard'] });
  };

  const nameParts = (user?.name ?? '').trim().split(/\s+/).filter(Boolean);
  const firstName = (nameParts[0] ?? 'there').match(/^(dr|mr|mrs|ms|prof)\.?$/i) && nameParts[1]
    ? nameParts[1]
    : nameParts[0] ?? 'there';

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Practice overview"
        title={`Welcome back, ${firstName}`}
        description="A clear view of your doctors, patient activity and clinic trends — all from live data."
        breadcrumb={[]}
        actions={
          <>
            <div className="flex items-center gap-2">
              <CalendarRange className="h-4 w-4 text-slate-400" />
              <Select value={String(months)} onValueChange={(value) => setMonths(Number(value))}>
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
            <Button variant="outline" size="icon" onClick={refresh} aria-label="Refresh dashboard" title="Refresh dashboard">
              <RefreshCw className={refreshing ? 'h-4 w-4 animate-spin' : 'h-4 w-4'} />
            </Button>
          </>
        }
      />

      {failed && (
        <ErrorState
          message={errorMessage(failed.error)}
          onRetry={() => queries.forEach((query) => void query.refetch())}
        />
      )}

      <section className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {stats.isPending ? (
            Array.from({ length: 4 }).map((_, index) => <LoadingSkeleton key={index} rows={2} columns={1} />)
          ) : (
            <>
              <StatCard
                feature
                title="Total patients"
                value={stats.data?.totalPatients ?? 0}
                icon={PatientsIcon}
                hint="Registered across your clinic"
                href="/patients"
              />
              <StatCard title="Total doctors" value={stats.data?.totalDoctors ?? 0} icon={DoctorsIcon} hint="Active profiles" accent="sky" href="/doctors" />
              <StatCard
                title="New doctors this month"
                value={stats.data?.newDoctorsThisMonth ?? 0}
                icon={InsightsIcon}
                hint="Joined since the 1st"
                trend="+"
                accent="indigo"
                href="/doctors"
              />
              <StatCard
                title="New patients this month"
                value={stats.data?.newPatientsThisMonth ?? 0}
                icon={InsightsIcon}
                hint="Registered since the 1st"
                trend="+"
                accent="amber"
                href="/patients"
              />
            </>
          )}
        </div>
      </section>

      <section className="space-y-5">
        <SectionHeading meta={`Rolling ${months}-month window`}>Analytics</SectionHeading>
        <div className="grid gap-4 xl:grid-cols-3">
          <div className="xl:col-span-2">
            <ChartCard
              title="Patient registrations"
              description={`New patients recorded each month over the last ${months} months`}
              kind="trend"
              data={trends.data ?? []}
            />
          </div>
          <ChartCard
            title="Patients per doctor"
            description="Highest patient loads across your team"
            kind="doctors"
            data={perDoctor.data ?? []}
          />
          <ChartCard title="Condition distribution" description="How patients are grouped by condition" kind="pie" data={conditions.data ?? []} />
          <ChartCard
            title="Specialization distribution"
            description="Composition of your medical team"
            kind="pie"
            data={specializations.data ?? []}
          />
        </div>
      </section>

      <section className="space-y-5">
        <SectionHeading meta="Updated continuously">Activity</SectionHeading>
        <div className="grid gap-4 lg:grid-cols-2">
          <div className="panel overflow-hidden">
            <div className="flex items-center justify-between border-b border-border px-5 py-4">
              <div className="flex items-center gap-2">
                <ClipboardList className="h-4 w-4 text-teal-700" strokeWidth={1.8} />
                <h3 className="text-sm font-semibold text-slate-900">Recent patients</h3>
              </div>
              <Link href="/patients" className="flex items-center gap-1 text-xs font-semibold text-teal-700 hover:underline">
                View all <ArrowUpRight className="h-3 w-3" />
              </Link>
            </div>
            <div className="px-5 py-2">
              {recent.isPending ? (
                <LoadingSkeleton rows={4} columns={3} />
              ) : recent.data?.length ? (
                <ul className="divide-y divide-border/70">
                  {recent.data.map((patient) => (
                    <li key={patient.id} className="flex items-center gap-3 py-3">
                      <EntityAvatar
                        kind="patients"
                        id={patient.id}
                        name={patient.name}
                        hasPhoto={patient.hasPhoto}
                        version={patient.updatedAt}
                        className="h-9 w-9"
                        fallbackClassName={`text-[11px] ${avatarColor(patient.name)}`}
                      />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-[13px] font-semibold text-slate-800">{patient.name}</p>
                        <p className="truncate text-[11px] text-muted-foreground">Assigned to {patient.doctorName ?? 'Unassigned'}</p>
                      </div>
                      <Badge variant={conditionTone(patient.condition)}>{patient.condition}</Badge>
                    </li>
                  ))}
                </ul>
              ) : (
                <EmptyState title="No registrations yet" description="New patient registrations will appear here." />
              )}
            </div>
          </div>

          <div className="panel overflow-hidden">
            <div className="flex items-center justify-between border-b border-border px-5 py-4">
              <div className="flex items-center gap-2">
                <Activity className="h-4 w-4 text-teal-700" strokeWidth={1.8} />
                <h3 className="text-sm font-semibold text-slate-900">Top doctors</h3>
              </div>
              <Link href="/doctors" className="flex items-center gap-1 text-xs font-semibold text-teal-700 hover:underline">
                View all <ArrowUpRight className="h-3 w-3" />
              </Link>
            </div>
            <div className="px-5 py-2">
              {topDoctors.isPending ? (
                <LoadingSkeleton rows={4} columns={3} />
              ) : topDoctors.data?.data.length ? (
                <ul className="divide-y divide-border/70">
                  {topDoctors.data.data.map((doctor) => {
                    const max = Math.max(...topDoctors.data!.data.map((item) => item.patientCount), 1);
                    return (
                      <li key={doctor.id} className="flex items-center gap-3 py-3">
                        <EntityAvatar
                          kind="doctors"
                          id={doctor.id}
                          name={doctor.name}
                          hasPhoto={doctor.hasPhoto}
                          version={doctor.updatedAt}
                          className="h-9 w-9"
                          fallbackClassName={`text-[11px] ${avatarColor(doctor.name)}`}
                        />
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-[13px] font-semibold text-slate-800">{doctor.name}</p>
                          <div className="mt-1.5 h-1 w-full max-w-[160px] overflow-hidden rounded-full bg-slate-100">
                            <div className="h-full rounded-full bg-teal-600" style={{ width: `${(doctor.patientCount / max) * 100}%` }} />
                          </div>
                        </div>
                        <span className="text-xs font-semibold tabular-nums text-slate-600">{doctor.patientCount} patients</span>
                      </li>
                    );
                  })}
                </ul>
              ) : (
                <EmptyState title="No doctors yet" description="Add a doctor to start building your team." />
              )}
            </div>
          </div>
        </div>
      </section>

      <div className="flex items-center justify-between border-t border-border pt-4 text-[11px] text-muted-foreground">
        <span>Last updated {formatDate(new Date(), true)} UTC</span>
        {refreshing && <Spinner className="h-3.5 w-3.5 text-teal-700" />}
      </div>
    </div>
  );
}
