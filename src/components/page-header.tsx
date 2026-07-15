import type { ReactNode } from "react";

interface PageHeaderProps {
  actions?: ReactNode;
  eyebrow: string;
  title: ReactNode;
}

export function PageHeader({ actions, eyebrow, title }: PageHeaderProps) {
  return (
    <header className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
      <div className="min-w-0">
        <p className="text-xs font-medium tracking-widest text-muted-foreground uppercase">
          {eyebrow}
        </p>
        <h1 className="mt-2 text-3xl font-bold leading-tight tracking-tight md:text-4xl">
          {title}
        </h1>
      </div>
      {actions ? (
        <div className="flex w-full flex-wrap items-center gap-2 md:w-auto md:shrink-0 md:justify-end">
          {actions}
        </div>
      ) : null}
    </header>
  );
}
