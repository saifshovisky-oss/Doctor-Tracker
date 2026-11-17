'use client';

import { useEffect, useState, type ReactNode } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Menu, PanelLeftClose, PanelLeftOpen } from 'lucide-react';
import { Toaster } from 'sonner';
import { SidebarContent } from './sidebar';
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Spinner } from '@/components/common/states';
import { useAuth } from '@/components/providers/auth-provider';
import { navItems } from './nav-items';
import { cn } from '@/lib/utils';

function currentTitle(pathname: string): string {
  return navItems.find((item) => pathname === item.href || pathname.startsWith(`${item.href}/`))?.label ?? 'Dashboard';
}

export function AppShell({ children }: { children: ReactNode }) {
  const { status } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    const stored = window.localStorage.getItem('dt-sidebar-collapsed');
    if (stored === 'true') setCollapsed(true);
  }, []);

  useEffect(() => {
    window.localStorage.setItem('dt-sidebar-collapsed', String(collapsed));
  }, [collapsed]);

  useEffect(() => {
    if (status === 'unauthenticated') router.replace('/login');
  }, [status, router]);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  if (status === 'loading') {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Spinner className="h-6 w-6 text-teal-700" />
      </div>
    );
  }

  if (status === 'unauthenticated') return null;

  return (
    <div className="min-h-screen bg-background">
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-30 hidden border-r border-border bg-white transition-[width] duration-200 lg:block',
          collapsed ? 'w-16' : 'w-60',
        )}
      >
        <SidebarContent collapsed={collapsed} />
      </aside>

      <div className={cn('transition-[padding-left] duration-200', collapsed ? 'lg:pl-16' : 'lg:pl-60')}>
        <header className="sticky top-0 z-20 flex h-[68px] items-center gap-3 border-b border-border bg-white/95 px-4 backdrop-blur-sm sm:px-6">
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild>
              <button
                type="button"
                aria-label="Open navigation menu"
                className="rounded-md p-2 text-muted-foreground hover:bg-slate-100 lg:hidden"
              >
                <Menu className="h-5 w-5" />
              </button>
            </SheetTrigger>
            <SheetContent side="left" className="w-64 p-0">
              <SheetTitle className="sr-only">Navigation</SheetTitle>
              <SidebarContent onNavigate={() => setMobileOpen(false)} />
            </SheetContent>
          </Sheet>

          <button
            type="button"
            onClick={() => setCollapsed((value) => !value)}
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            aria-expanded={!collapsed}
            title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            className="hidden rounded-md p-2 text-muted-foreground transition-colors hover:bg-slate-100 hover:text-foreground lg:inline-flex"
          >
            {collapsed ? <PanelLeftOpen className="h-5 w-5" /> : <PanelLeftClose className="h-5 w-5" />}
          </button>

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-teal-600" aria-hidden />
              <p className="truncate text-sm font-semibold tracking-tight text-slate-900">{currentTitle(pathname)}</p>
            </div>
            <nav aria-label="Breadcrumb" className="mt-0.5 hidden text-[11px] text-muted-foreground sm:block">
              Home <span className="mx-1.5 text-slate-300">/</span> <span className="font-medium text-slate-600">{currentTitle(pathname)}</span>
            </nav>
          </div>

          <div className="hidden items-center gap-2 rounded-md border border-slate-200 bg-slate-50 px-2.5 py-1.5 sm:flex">
            <span className="relative flex h-2 w-2" aria-hidden>
              <span className="absolute inline-flex h-full w-full rounded-full bg-teal-400/60" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-teal-600" />
            </span>
            <span className="text-[11px] font-semibold uppercase tracking-wide text-slate-600">Live data</span>
          </div>
        </header>

        <main className="mx-auto w-full max-w-[1400px] px-4 py-6 sm:px-6 lg:px-8 lg:py-8">{children}</main>
      </div>
      <Toaster position="bottom-right" richColors closeButton />
    </div>
  );
}
