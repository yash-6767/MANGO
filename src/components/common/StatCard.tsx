import React from 'react';
import type { LucideIcon } from 'lucide-react';

interface StatCardProps {
  icon: LucideIcon;
  label: string;
  value: string;
  detail: string;
}

export const StatCard: React.FC<StatCardProps> = ({ icon: Icon, label, value, detail }) => {
  return (
    <div className="rounded-2xl border border-[var(--border-color)] bg-[var(--bg-card)] p-4 shadow-sm hover:border-[var(--sage)] transition-colors">
      <div className="flex items-center justify-between">
        <span className="rounded-xl p-2.5 bg-[var(--sage-soft)] text-[var(--emerald-primary)]">
          <Icon className="h-[18px] w-[18px]" />
        </span>
        <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)]">{label}</span>
      </div>
      <p className="font-display mt-4 text-2xl font-extrabold tracking-tight text-[var(--text-main)]">{value}</p>
      <p className="mt-1 text-xs text-[var(--text-muted)]">{detail}</p>
    </div>
  );
};
