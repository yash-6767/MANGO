import React, { useState } from 'react';
import { Plus, ArrowRight, MessageSquareText, ShieldCheck } from 'lucide-react';
import { PageHeader } from '../components/common/PageHeader';
import type { Page } from '../components/Sidebar';
import { companiesData } from '../data/mangosData';

interface CompaniesProps {
  navigate: (page: Page) => void;
  notify: (message: string) => void;
}

export const Companies: React.FC<CompaniesProps> = ({ navigate, notify }) => {
  const [selected, setSelected] = useState(companiesData[0]);

  return (
    <div>
      <PageHeader
        eyebrow="Company preparation"
        title="Prepare with context."
        detail="Six focused hubs for the exact companies MANGOS is built around. Explore the signal, then practice the role."
      />
      <div className="grid gap-5 lg:grid-cols-[280px_1fr]">
        <div className="space-y-2">
          {companiesData.map((company) => (
            <button
              key={company.name}
              onClick={() => setSelected(company)}
              className={`flex w-full items-center gap-3 rounded-xl border p-3 text-left transition shadow-sm ${
                selected.name === company.name
                  ? 'border-[var(--emerald-primary)] bg-[var(--sage-soft)] font-bold'
                  : 'border-[var(--border-color)] bg-[var(--bg-card)] hover:border-[var(--sage)]'
              }`}
            >
              <span
                className="flex h-9 w-9 items-center justify-center rounded-lg text-sm font-extrabold"
                style={{ background: company.tint, color: company.accent }}
              >
                {company.mark}
              </span>
              <span>
                <span className="block text-sm font-bold text-[var(--text-main)]">{company.name}</span>
                <span className="block text-[10px] text-[var(--text-muted)]">{company.focus}</span>
              </span>
              <ArrowRight className="ml-auto h-4 w-4 text-[var(--text-muted)]" />
            </button>
          ))}
        </div>

        <section className="rounded-2xl border border-[var(--border-color)] bg-[var(--bg-card)] p-6 sm:p-8 shadow-sm">
          <div className="flex flex-col justify-between gap-5 sm:flex-row">
            <div>
              <div className="flex items-center gap-4">
                <span
                  className="flex h-14 w-14 items-center justify-center rounded-2xl text-xl font-extrabold shadow-sm"
                  style={{ background: selected.tint, color: selected.accent }}
                >
                  {selected.mark}
                </span>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[.18em] text-[var(--emerald-primary)]">{selected.focus}</p>
                  <h2 className="font-display mt-1 text-3xl font-extrabold text-[var(--text-main)]">{selected.name}</h2>
                </div>
              </div>
              <p className="mt-6 max-w-xl text-sm leading-6 text-[var(--text-muted)]">{selected.overview}</p>
            </div>
            <button
              onClick={() => notify(`${selected.name} hub added to your focus`)}
              className="h-fit rounded-xl border border-[var(--border-color)] bg-[var(--bg-card)] px-3 py-2 text-xs font-bold text-[var(--text-main)] hover:border-[var(--emerald-primary)]"
            >
              Add to focus <Plus className="ml-1 inline h-3.5 w-3.5" />
            </button>
          </div>

          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            <div className="rounded-xl border border-[var(--border-color)] bg-[var(--bg-secondary)] p-4">
              <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--sage-dark)]">Interview rounds</p>
              <div className="mt-4 space-y-3">
                {selected.rounds.map((round, index) => (
                  <div key={round} className="flex items-center gap-3 text-sm font-semibold text-[var(--text-main)]">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[var(--bg-card)] border border-[var(--border-color)] text-[10px] text-[var(--sage-dark)]">
                      0{index + 1}
                    </span>
                    {round}
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-xl border border-[var(--border-color)] bg-[var(--bg-secondary)] p-4">
              <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--sage-dark)]">Prepare for this signal</p>
              <div className="mt-4 flex flex-wrap gap-2">
                {selected.topics.map((topic) => (
                  <span
                    key={topic}
                    className="rounded-lg bg-[var(--bg-card)] border border-[var(--border-color)] px-2.5 py-1.5 text-xs font-semibold text-[var(--text-main)]"
                  >
                    {topic}
                  </span>
                ))}
              </div>
              <div className="mt-6 rounded-lg bg-[var(--bg-secondary)] p-3 text-xs leading-5 text-[var(--sage-dark)] border border-[var(--border-color)]">
                <ShieldCheck className="mr-1 inline h-3.5 w-3.5 text-[var(--emerald-primary)]" /> Official and community resources are labeled.
              </div>
            </div>
          </div>

          <div className="mt-7 flex flex-wrap gap-3">
            <button
              onClick={() => navigate('DSA Practice')}
              className="rounded-xl bg-[var(--emerald-primary)] px-4 py-2.5 text-sm font-bold text-white shadow-sm hover:bg-[var(--emerald-deep)]"
            >
              Practice coding <ArrowRight className="ml-1 inline h-4 w-4" />
            </button>
            <button
              onClick={() => navigate('Mock Interview')}
              className="rounded-xl border border-[var(--border-color)] bg-[var(--bg-card)] px-4 py-2.5 text-sm font-bold text-[var(--text-main)] hover:border-[var(--emerald-primary)]"
            >
              Prepare for a round <MessageSquareText className="ml-1 inline h-4 w-4" />
            </button>
          </div>
        </section>
      </div>
    </div>
  );
};
