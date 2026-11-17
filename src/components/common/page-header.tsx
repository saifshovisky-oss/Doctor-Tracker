import type { ReactNode } from 'react';

interface PageHeaderProps {
  title: string;
  description?: string;
  breadcrumb?: string[];
  actions?: ReactNode;
}

export function PageHeader({ title, description, breadcrumb = ['Dashboard'], actions }: PageHeaderProps) {
  return (
    <div className="flex flex-col gap-4 border-b border-border pb-5 md:flex-row md:items-end md:justify-between">
      <div className="space-y-1.5">
        <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs text-muted-foreground">
          {breadcrumb.map((crumb, index) => (
            <span key={crumb} className="flex items-center gap-1.5">
              {index > 0 && <span aria-hidden>/</span>}
              <span className={index === breadcrumb.length - 1 ? 'font-medium text-foreground' : undefined}>{crumb}</span>
            </span>
          ))}
        </nav>
        <h1 className="text-xl font-semibold tracking-tight text-foreground md:text-2xl">{title}</h1>
        {description && <p className="text-sm text-muted-foreground">{description}</p>}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </div>
  );
}
