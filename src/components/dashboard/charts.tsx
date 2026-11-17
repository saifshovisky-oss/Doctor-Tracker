'use client';

import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import type { DoctorCount, NamedCount, TrendPoint } from '@/lib/types';
import { EmptyState } from '@/components/common/states';

const AXIS = { fontSize: 11, fill: '#94a3b8' };
const TOOLTIP_STYLE = {
  borderRadius: 6,
  border: '1px solid #e2e8f0',
  fontSize: 12,
  boxShadow: '0 4px 12px rgb(15 23 42 / 0.08)',
};
const COLORS = ['#0f766e', '#0284c7', '#4f46e5', '#d97706', '#e11d48', '#64748b', '#0891b2', '#7c3aed'];

export function PatientTrendChart({ data }: { data: TrendPoint[] }) {
  if (!data.length) return <EmptyState title="No registration data" description="Patient registrations will appear here once records are added." />;
  return (
    <ResponsiveContainer width="100%" height={260}>
      <AreaChart data={data} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
        <defs>
          <linearGradient id="trendFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#0d9488" stopOpacity={0.18} />
            <stop offset="100%" stopColor="#0d9488" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eef2f6" />
        <XAxis dataKey="label" tick={AXIS} tickLine={false} axisLine={false} />
        <YAxis tick={AXIS} tickLine={false} axisLine={false} allowDecimals={false} />
        <Tooltip contentStyle={TOOLTIP_STYLE} formatter={(value) => [`${value} patients`, 'Registrations']} />
        <Area type="monotone" dataKey="count" stroke="#0f766e" strokeWidth={2} fill="url(#trendFill)" dot={{ r: 3, fill: '#0f766e' }} activeDot={{ r: 5 }} />
      </AreaChart>
    </ResponsiveContainer>
  );
}

export function PatientsPerDoctorChart({ data }: { data: DoctorCount[] }) {
  if (!data.length) return <EmptyState title="No doctor assignments" description="Assign patients to doctors to see this breakdown." />;
  const chartData = data.map((item) => ({ name: item.name.split(' ').slice(-1)[0], full: item.name, value: item.count }));
  return (
    <ResponsiveContainer width="100%" height={260}>
      <BarChart data={chartData} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eef2f6" />
        <XAxis dataKey="name" tick={AXIS} tickLine={false} axisLine={false} />
        <YAxis tick={AXIS} tickLine={false} axisLine={false} allowDecimals={false} />
        <Tooltip contentStyle={TOOLTIP_STYLE} formatter={(value) => [`${value} patients`, 'Patients']} labelFormatter={(_, payload) => String(payload?.[0]?.payload?.full ?? '')} />
        <Bar dataKey="value" fill="#0f766e" radius={[3, 3, 0, 0]} maxBarSize={44} />
      </BarChart>
    </ResponsiveContainer>
  );
}

export function DistributionPieChart({ data, label }: { data: NamedCount[]; label: string }) {
  if (!data.length) return <EmptyState title="No data available" description={`${label} will appear once records are added.`} />;
  return (
    <div className="flex flex-col items-center gap-4 sm:flex-row">
      <ResponsiveContainer width="100%" height={220}>
        <PieChart>
          <Pie data={data} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={52} outerRadius={82} paddingAngle={2} stroke="none">
            {data.map((_, index) => <Cell key={index} fill={COLORS[index % COLORS.length]} />)}
          </Pie>
          <Tooltip contentStyle={TOOLTIP_STYLE} formatter={(value) => [`${value} records`, label]} />
        </PieChart>
      </ResponsiveContainer>
      <ul className="w-full space-y-2 sm:w-32">
        {data.map((item, index) => (
          <li key={item.name} className="flex items-center justify-between gap-2 text-xs">
            <span className="flex min-w-0 items-center gap-2 text-muted-foreground">
              <span className="h-2 w-2 shrink-0 rounded-sm" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
              <span className="truncate">{item.name}</span>
            </span>
            <span className="font-semibold text-foreground">{item.value}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
