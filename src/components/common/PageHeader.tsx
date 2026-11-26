import React from 'react';
import type { ReactNode } from 'react';

interface PageHeaderProps {
  eyebrow: string;
  title: string;
  detail: string;
  action?: ReactNode;
}

export const PageHeader: React.FC<PageHeaderProps> = ({ eyebrow, title, detail, action }) => {
  return (
    <div className="mb-7 flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
      <div>
        <p className="text-[11px] font-bold uppercase tracking-[.18em] text-[var(--emerald-primary)]">{eyebrow}</p>
        <h2 className="font-display mt-2 text-3xl font-extrabold tracking-[-.045em] text-[var(--text-main)] sm:text-[36px]">
          {title}
        </h2>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--text-muted)]">{detail}</p>
      </div>
      {action}
    </div>
  );
};
