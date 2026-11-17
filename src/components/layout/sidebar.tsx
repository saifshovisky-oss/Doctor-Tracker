'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LogOut } from 'lucide-react';
import { navItems, product } from './nav-items';
import { cn, initials, avatarColor } from '@/lib/utils';
import { useAuth } from '@/components/providers/auth-provider';
import { DtLogo, DtLogoWhite } from '@/components/brand/dt-logo';

export function SidebarContent({
  onNavigate,
  collapsed = false,
}: {
  onNavigate?: () => void;
  collapsed?: boolean;
}) {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  return (
    <div className="flex h-full flex-col">
      <div
        className={cn(
          'flex h-16 items-center border-b border-border',
          collapsed ? 'justify-center px-3' : 'px-5',
        )}
      >
        {collapsed ? (
          /* Collapsed: the same DT mark, scaled down */
          <DtLogo className="h-7 w-auto shrink-0" aria-label="Doctor Tracker" />
        ) : (
          <div className="flex min-w-0 items-center gap-2.5">
            <DtLogo className="h-9 w-auto shrink-0" aria-label="Doctor Tracker" />
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold tracking-tight text-slate-900">Doctor Tracker</p>
              <p className="truncate text-[11px] text-muted-foreground">Healthcare administration</p>
            </div>
          </div>
        )}
      </div>

      <nav aria-label="Main navigation" className={cn('flex-1 space-y-1 py-5', collapsed ? 'px-2' : 'px-3')}>
        {!collapsed && (
          <p className="mb-2 px-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            Workspace
          </p>
        )}
        {navItems.map((item) => {
          const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
          return (
            <div key={item.href} className="relative">
              {active && <span className="absolute -left-2 top-1/2 h-5 w-0.5 -translate-y-1/2 rounded-full bg-teal-600" />}
              <Link
                href={item.href}
                onClick={onNavigate}
                aria-current={active ? 'page' : undefined}
                aria-label={collapsed ? item.label : undefined}
                title={collapsed ? item.label : undefined}
                className={cn(
                  'flex items-center rounded-md py-2.5 text-[13px] font-medium transition-all duration-150',
                  collapsed ? 'justify-center px-0' : 'gap-3 px-3',
                  active
                    ? 'bg-teal-50 text-teal-900'
                    : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900',
                )}
              >
                <item.icon className={cn('h-[18px] w-[18px] shrink-0', active ? 'text-teal-700' : 'text-slate-400')} strokeWidth={1.8} />
                {!collapsed && item.label}
              </Link>
            </div>
          );
        })}
      </nav>

      <div className={cn('border-t border-border', collapsed ? 'p-2' : 'p-3')}>
        <div
          className={cn(
            'mb-1 flex items-center rounded-md py-2',
            collapsed ? 'justify-center px-0' : 'gap-2.5 px-2',
          )}
          title={collapsed ? (user?.name ?? 'Administrator') : undefined}
        >
          <div
            className={cn(
              'flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-semibold',
              avatarColor(user?.name ?? 'admin'),
            )}
          >
            {initials(user?.name ?? 'Admin')}
          </div>
          {!collapsed && (
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-semibold text-foreground">{user?.name ?? 'Administrator'}</p>
              <p className="truncate text-[11px] text-muted-foreground">{user?.email}</p>
            </div>
          )}
        </div>
        <button
          type="button"
          onClick={() => void logout()}
          aria-label={collapsed ? 'Log out' : undefined}
          title={collapsed ? 'Log out' : undefined}
          className={cn(
            'flex w-full items-center rounded-md py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-50 hover:text-foreground',
            collapsed ? 'justify-center px-0' : 'gap-3 px-3',
          )}
        >
          <LogOut className="h-4 w-4 shrink-0 text-muted-foreground" />
          {!collapsed && 'Log out'}
        </button>
      </div>
    </div>
  );
}
