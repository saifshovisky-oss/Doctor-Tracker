'use client';

import { useEffect, useState, type ReactNode } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Menu } from 'lucide-react';
import { Toaster } from 'sonner';
import { SidebarContent } from './sidebar';
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Spinner } from '@/components/common/states';
import { useAuth } from '@/components/providers/auth-provider';
import { navItems } from './nav-items';

function currentTitle(pathname: string): string {
  return navItems.find((item) => pathname === item.href || pathname.startsWith(`${item.href}/`))?.label ?? 'Dashboard';
}

export function AppShell({ children }: { children: ReactNode }) {
  const { status } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

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
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-60 border-r border-border bg-white lg:block">
        <SidebarContent />
      </aside>

      <div className="lg:pl-60">
        <header className="sticky top-0 z-20 flex h-16 items-center gap-3 border-b border-border bg-white/95 px-4 backdrop-blur sm:px-6">
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

          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-foreground">{currentTitle(pathname)}</p>
            <nav aria-label="Breadcrumb" className="hidden text-xs text-muted-foreground sm:block">
              Home / <span className="text-foreground">{currentTitle(pathname)}</span>
            </nav>
          </div>

          <div className="hidden items-center gap-2 rounded-md border border-border px-2.5 py-1.5 sm:flex">
            <span className="h-2 w-2 rounded-full bg-teal-600" aria-hidden />
            <span className="text-xs font-medium text-slate-600">Admin workspace</span>
          </div>
        </header>

        <main className="mx-auto w-full max-w-[1400px] px-4 py-6 sm:px-6 lg:px-8 lg:py-8">{children}</main>
      </div>
      <Toaster position="bottom-right" richColors closeButton />
    </div>
  );
}
