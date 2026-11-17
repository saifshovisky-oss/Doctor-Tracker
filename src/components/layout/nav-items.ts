import { Activity, FlaskConical, LayoutDashboard, Stethoscope, Users } from 'lucide-react';

export const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/doctors', label: 'Doctors', icon: Stethoscope },
  { href: '/patients', label: 'Patients', icon: Users },
  { href: '/conditions', label: 'Conditions', icon: FlaskConical },
];

export const product = {
  name: 'Doctor Tracker',
  tagline: 'Healthcare administration',
  icon: Activity,
};
