import type { ReactNode } from 'react';

interface PageHeaderProps {
  title: string;
  description?: string;
  breadcrumb?: string[];
  actions?: ReactNode;
  eyebrow?: string;
}

export function PageHeader({ title, description, breadcrumb = ['Dashboard'], actions, eyebrow }: PageHeaderProps) {
  return (
    <div className="flex flex-col gap-5 border-b border-border pb-6 md:flex-row md:items-end md:justify-between">
      <div className="min-w-0 space-y-2">
        <div className="flex flex-wrap items-center gap-2">
          {eyebrow && <span className="eyebrow text-teal-700">{eyebrow}</span>}
          {eyebrow && <span className="h-3 w-px bg-border" />}
          <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
            {breadcrumb.map((crumb, index) => (
              <span key={crumb} className="flex items-center gap-1.5">
                {index > 0 && <span aria-hidden>/</span>}
                <span className={index === breadcrumb.length - 1 ? 'font-medium text-slate-600' : undefined}>{crumb}</span>
              </span>
            ))}
          </nav>
        </div>
        <h1 className="text-[26px] font-semibold leading-tight tracking-[-0.02em] text-slate-900 md:text-[30px]">{title}</h1>
        {description && <p className="max-w-2xl text-[13px] leading-relaxed text-muted-foreground">{description}</p>}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </div>
  );
}
