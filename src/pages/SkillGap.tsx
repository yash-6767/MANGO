import React, { useState } from 'react';
import { Radar, ArrowRight } from 'lucide-react';
import { PageHeader } from '../components/common/PageHeader';
import type { CompanyName } from '../types/user';
import type { Page } from '../components/Sidebar';
import { allCompanies } from '../data/mangosData';

interface SkillGapProps {
  navigate: (page: Page) => void;
}

export const SkillGap: React.FC<SkillGapProps> = ({ navigate }) => {
  const [company, setCompany] = useState<CompanyName>('Meta');
  const [role, setRole] = useState('Software Engineering');
  const [analyzed, setAnalyzed] = useState(true);
  const skills = ['Data structures', 'System design', 'Product thinking', 'Communication', 'Distributed systems'];

  return (
    <div>
      <PageHeader
        eyebrow="Skill gap analyzer"
        title="Know what to work on next."
        detail="Get a focused snapshot of your strengths and the areas that will unlock your target role."
        action={
          <button
            onClick={() => setAnalyzed(true)}
            className="rounded-xl border border-[var(--border-color)] bg-[var(--bg-card)] px-4 py-2.5 text-sm font-bold text-[var(--text-main)] shadow-sm hover:border-[var(--emerald-primary)]"
          >
            Re-run analysis <Radar className="ml-1 inline h-4 w-4 text-[var(--emerald-primary)]" />
          </button>
        }
      />
      <section className="rounded-2xl border border-[var(--border-color)] bg-[var(--bg-card)] p-6 shadow-sm">
        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <span className="mb-2 block text-xs font-bold text-[var(--sage-dark)]">Target company</span>
            <select
              value={company}
              onChange={(event) => {
                setCompany(event.target.value as CompanyName);
                setAnalyzed(false);
              }}
              className="field"
            >
              {allCompanies.map((item: CompanyName) => (
                <option key={item}>{item}</option>
              ))}
            </select>
          </div>

          <div>
            <span className="mb-2 block text-xs font-bold text-[var(--sage-dark)]">Target role</span>
            <select
              value={role}
              onChange={(event) => {
                setRole(event.target.value);
                setAnalyzed(false);
              }}
              className="field"
            >
              <option>Software Engineering</option>
              <option>AI / ML Engineering</option>
              <option>Research Engineering</option>
              <option>Backend Development</option>
            </select>
          </div>
        </div>

        <button
          onClick={() => setAnalyzed(true)}
          className="mt-6 rounded-xl bg-[var(--emerald-primary)] px-4 py-2.5 text-sm font-bold text-white shadow-sm hover:bg-[var(--emerald-deep)] flex items-center gap-2"
        >
          Analyze my gap <ArrowRight className="h-4 w-4" />
        </button>
      </section>

      {analyzed && (
        <div className="mt-5 grid gap-5 lg:grid-cols-[.75fr_1.25fr]">
          <section className="rounded-2xl border border-[var(--border-color)] bg-[var(--bg-card)] p-6 shadow-sm">
            <p className="text-[10px] font-bold uppercase tracking-[.17em] text-[var(--emerald-primary)]">Your readiness</p>
            <div className="mt-5 flex items-center gap-5">
              <div
                className="relative flex h-28 w-28 items-center justify-center rounded-full"
                style={{ background: 'conic-gradient(var(--emerald-primary) 0deg 248deg, var(--border-color) 248deg)' }}
              >
                <div className="flex h-[88px] w-[88px] items-center justify-center rounded-full bg-[var(--bg-card)] shadow-sm">
                  <span className="font-display text-2xl font-extrabold text-[var(--text-main)]">69%</span>
                </div>
              </div>
              <div>
                <p className="text-lg font-extrabold text-[var(--text-main)]">Good foundation</p>
                <p className="mt-1 text-xs leading-5 text-[var(--text-muted)]">
                  You’re building range. Focus on the weak areas for your next jump.
                </p>
              </div>
            </div>
            <div className="mt-7 rounded-xl border border-[var(--border-color)] bg-[var(--bg-secondary)] p-4">
              <p className="text-xs font-bold text-[var(--text-main)]">
                Targeting {role} at {company}
              </p>
              <p className="mt-2 text-xs leading-5 text-[var(--text-muted)]">
                Based on your roadmap progress and saved practice activity.
              </p>
            </div>
          </section>

          <section className="rounded-2xl border border-[var(--border-color)] bg-[var(--bg-card)] p-6 shadow-sm">
            <h3 className="font-display text-lg font-extrabold text-[var(--text-main)]">Your skill map</h3>
            <div className="mt-5 space-y-4">
              {skills.map((skill, index) => (
                <div key={skill}>
                  <div className="mb-2 flex items-center justify-between text-sm">
                    <span className="font-semibold text-[var(--text-main)]">{skill}</span>
                    <span className={`text-xs font-bold ${index > 2 ? 'text-[var(--sage-dark)]' : 'text-[var(--emerald-primary)]'}`}>
                      {[86, 72, 62, 48, 34][index]}%
                    </span>
                  </div>
                  <div className="h-2 rounded-full bg-[var(--bg-secondary)] border border-[var(--border-color)]">
                    <div
                      className={`h-full rounded-full ${index > 2 ? 'bg-[var(--sage)]' : 'bg-[var(--emerald-primary)]'}`}
                      style={{ width: `${[86, 72, 62, 48, 34][index]}%` }}
                    />
                  </div>
                  <p className="mt-1.5 text-[11px] text-[var(--text-muted)]">
                    {index > 2 ? 'Recommended focus' : 'Strength to build on'}
                  </p>
                </div>
              ))}
            </div>
            <button
              onClick={() => navigate('Roadmaps')}
              className="mt-7 rounded-xl border border-[var(--border-color)] bg-[var(--bg-card)] px-4 py-2.5 text-xs font-bold text-[var(--text-main)] hover:border-[var(--emerald-primary)] flex items-center gap-1.5"
            >
              View recommended roadmap <ArrowRight className="h-3.5 w-3.5 text-[var(--emerald-primary)]" />
            </button>
          </section>
        </div>
      )}
    </div>
  );
};
