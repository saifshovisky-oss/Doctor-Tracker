'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LogOut } from 'lucide-react';
import { navItems, product } from './nav-items';
import { cn, initials, avatarColor } from '@/lib/utils';
import { useAuth } from '@/components/providers/auth-provider';

export function SidebarContent({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const Icon = product.icon;

  return (
    <div className="flex h-full flex-col">
      <div className="flex h-16 items-center gap-2.5 border-b border-border px-5">
        <div className="flex h-8 w-8 items-center justify-center rounded-md bg-teal-700 text-white">
          <Icon className="h-4.5 w-4.5" />
        </div>
        <div>
          <p className="text-sm font-semibold leading-tight text-foreground">{product.name}</p>
          <p className="text-[11px] leading-tight text-muted-foreground">{product.tagline}</p>
        </div>
      </div>

      <nav aria-label="Main navigation" className="flex-1 space-y-1 px-3 py-5">
        <p className="mb-2 px-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Workspace</p>
        {navItems.map((item) => {
          const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              aria-current={active ? 'page' : undefined}
              className={cn(
                'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
                active
                  ? 'bg-teal-50 text-teal-800'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-foreground',
              )}
            >
              <item.icon className={cn('h-4 w-4', active ? 'text-teal-700' : 'text-muted-foreground')} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-border p-3">
        <div className="mb-1 flex items-center gap-2.5 rounded-md px-2 py-2">
          <div className={cn('flex h-8 w-8 items-center justify-center rounded-full text-xs font-semibold', avatarColor(user?.name ?? 'admin'))}>
            {initials(user?.name ?? 'Admin')}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-xs font-semibold text-foreground">{user?.name ?? 'Administrator'}</p>
            <p className="truncate text-[11px] text-muted-foreground">{user?.email}</p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => void logout()}
          className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-50 hover:text-foreground"
        >
          <LogOut className="h-4 w-4 text-muted-foreground" />
          Log out
        </button>
      </div>
    </div>
  );
}
