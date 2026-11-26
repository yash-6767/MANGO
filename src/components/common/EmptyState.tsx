import React from 'react';
import type { LucideIcon } from 'lucide-react';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  detail: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({ icon: Icon, title, detail }) => {
  return (
    <div className="py-16 text-center">
      <span className="inline-flex rounded-2xl bg-[var(--bg-secondary)] p-3 text-[var(--sage-dark)] border border-[var(--border-color)]">
        <Icon className="h-5 w-5" />
      </span>
      <p className="mt-4 text-sm font-bold text-[var(--text-main)]">{title}</p>
      <p className="mt-1 text-xs text-[var(--text-muted)]">{detail}</p>
    </div>
  );
};
