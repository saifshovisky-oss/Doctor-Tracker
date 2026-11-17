'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LogOut } from 'lucide-react';
import { navItems, product } from './nav-items';
import { cn, initials, avatarColor } from '@/lib/utils';
import { useAuth } from '@/components/providers/auth-provider';

export function SidebarContent({
  onNavigate,
  collapsed = false,
}: {
  onNavigate?: () => void;
  collapsed?: boolean;
}) {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const Icon = product.icon;

  return (
    <div className="flex h-full flex-col">
      <div
        className={cn(
          'flex h-16 items-center border-b border-border',
          collapsed ? 'justify-center px-3' : 'gap-2.5 px-5',
        )}
      >
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-teal-700 text-white">
          <Icon className="h-4.5 w-4.5" />
        </div>
        {!collapsed && (
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold leading-tight text-foreground">{product.name}</p>
            <p className="truncate text-[11px] leading-tight text-muted-foreground">{product.tagline}</p>
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
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              aria-current={active ? 'page' : undefined}
              aria-label={collapsed ? item.label : undefined}
              title={collapsed ? item.label : undefined}
              className={cn(
                'flex items-center rounded-md py-2 text-sm font-medium transition-colors',
                collapsed ? 'justify-center px-0' : 'gap-3 px-3',
                active
                  ? 'bg-teal-50 text-teal-800'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-foreground',
              )}
            >
              <item.icon className={cn('h-4 w-4 shrink-0', active ? 'text-teal-700' : 'text-muted-foreground')} />
              {!collapsed && item.label}
            </Link>
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
