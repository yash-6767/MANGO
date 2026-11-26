import React, { useState } from 'react';
import { Check, ChevronDown, BookOpen, Code2, BarChart3, BrainCircuit } from 'lucide-react';
import { PageHeader } from '../components/common/PageHeader';
import type { WorkspaceState } from '../types/user';

function LayersIcon(props: { className?: string }) {
  return (
    <span className={props.className}>
      <span className="block h-2 w-5 rounded-sm border border-current" />
      <span className="mt-1 block h-2 w-5 rounded-sm border border-current" />
      <span className="mt-1 block h-2 w-5 rounded-sm border border-current" />
    </span>
  );
}

const milestoneGroups = [
  {
    title: 'Software Engineering',
    icon: Code2,
    color: '#176B50',
    milestones: ['Programming fundamentals', 'Data structures & algorithms', 'System design essentials', 'Behavioral storytelling'],
  },
  {
    title: 'Data Science',
    icon: BarChart3,
    color: '#5F7563',
    milestones: ['Statistics & experimentation', 'SQL and data modeling', 'ML foundations', 'Case study practice'],
  },
  {
    title: 'AI / ML Engineering',
    icon: BrainCircuit,
    color: '#176B50',
    milestones: ['Python & linear algebra', 'Model training loops', 'Evaluation & safety', 'Production inference'],
  },
  {
    title: 'Backend Development',
    icon: LayersIcon,
    color: '#5F7563',
    milestones: ['API design', 'Databases & caching', 'Distributed systems', 'Reliability & observability'],
  },
];

interface RoadmapsProps {
  state: WorkspaceState;
  toggleMilestone: (milestone: string) => void;
}

export const Roadmaps: React.FC<RoadmapsProps> = ({ state, toggleMilestone }) => {
  const [active, setActive] = useState(0);
  const roadmap = milestoneGroups[active];
  const complete = roadmap.milestones.filter((item) => state.completedMilestones.includes(item)).length;

  return (
    <div>
      <PageHeader
        eyebrow="Career roadmaps"
        title="Make progress visible."
        detail="Choose a path, follow the milestones, and build evidence that you’re ready for the next step."
        action={
          <div className="flex items-center gap-2 rounded-xl border border-[var(--border-color)] bg-[var(--bg-card)] px-3 py-2 shadow-sm">
            <span className="h-2 w-2 rounded-full bg-[var(--emerald-primary)]" />
            <span className="text-xs font-bold text-[var(--text-main)]">{state.completedMilestones.length} milestones complete</span>
          </div>
        }
      />
      <div className="grid gap-5 lg:grid-cols-[300px_1fr]">
        <div className="space-y-2">
          {milestoneGroups.map((group, index) => {
            const Icon = group.icon;
            return (
              <button
                key={group.title}
                onClick={() => setActive(index)}
                className={`flex w-full items-center gap-3 rounded-xl border p-4 text-left transition shadow-sm ${
                  active === index
                    ? 'border-[var(--emerald-primary)] bg-[var(--sage-soft)] font-bold'
                    : 'border-[var(--border-color)] bg-[var(--bg-card)] hover:border-[var(--sage)]'
                }`}
              >
                <span className="rounded-xl p-2.5 bg-[var(--bg-secondary)] text-[var(--emerald-primary)]">
                  <Icon className="h-4 w-4" />
                </span>
                <span className="text-sm font-bold text-[var(--text-main)]">{group.title}</span>
              </button>
            );
          })}
        </div>

        <section className="rounded-2xl border border-[var(--border-color)] bg-[var(--bg-card)] p-6 sm:p-8 shadow-sm">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[.18em] text-[var(--emerald-primary)]">Active roadmap</p>
              <h2 className="font-display mt-2 text-2xl font-extrabold text-[var(--text-main)]">{roadmap.title}</h2>
              <p className="mt-2 text-sm text-[var(--text-muted)]">
                Milestone {complete + 1} of {roadmap.milestones.length} · Keep moving at your pace.
              </p>
            </div>
            <div
              className="flex h-16 w-16 items-center justify-center rounded-full border-4 border-[var(--border-color)] text-sm font-extrabold text-[var(--text-main)]"
              style={{ borderTopColor: 'var(--emerald-primary)' }}
            >
              {Math.round((complete / roadmap.milestones.length) * 100)}%
            </div>
          </div>

          <div className="mt-8 space-y-3">
            {roadmap.milestones.map((milestone, index) => {
              const done = state.completedMilestones.includes(milestone);
              return (
                <button
                  key={milestone}
                  onClick={() => toggleMilestone(milestone)}
                  className={`flex w-full items-center gap-4 rounded-xl border p-4 text-left transition ${
                    done
                      ? 'border-[var(--emerald-primary)] bg-[var(--sage-soft)]/50'
                      : 'border-[var(--border-color)] bg-[var(--bg-secondary)] hover:border-[var(--sage)]'
                  }`}
                >
                  <span
                    className={`flex h-8 w-8 items-center justify-center rounded-full border text-xs font-bold ${
                      done
                        ? 'border-[var(--emerald-primary)] bg-[var(--emerald-primary)] text-white'
                        : 'border-[var(--border-color)] bg-[var(--bg-card)] text-[var(--sage-dark)]'
                    }`}
                  >
                    {done ? <Check className="h-4 w-4" /> : `0${index + 1}`}
                  </span>
                  <span className="flex-1">
                    <span className={`block text-sm font-bold ${done ? 'text-[var(--emerald-primary)]' : 'text-[var(--text-main)]'}`}>
                      {milestone}
                    </span>
                    <span className="mt-1 block text-xs text-[var(--text-muted)]">
                      {done ? 'Completed' : index === 0 ? 'Core lessons, practice, and a short check-in' : 'Resources, tasks, and role-specific practice'}
                    </span>
                  </span>
                  <ChevronDown className={`h-4 w-4 text-[var(--text-muted)] transition ${done ? '-rotate-90' : ''}`} />
                </button>
              );
            })}
          </div>

          <div className="mt-7 rounded-xl border border-[var(--border-color)] bg-[var(--bg-secondary)] p-4">
            <p className="flex items-center gap-2 text-xs font-bold text-[var(--emerald-primary)]">
              <BookOpen className="h-4 w-4" /> Suggested resources
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              <span className="rounded-lg bg-[var(--bg-card)] border border-[var(--border-color)] px-3 py-2 text-xs font-semibold text-[var(--text-main)]">
                MANGOS core notes
              </span>
              <span className="rounded-lg bg-[var(--bg-card)] border border-[var(--border-color)] px-3 py-2 text-xs font-semibold text-[var(--text-main)]">
                Curated Learning Library
              </span>
              <span className="rounded-lg bg-[var(--bg-card)] border border-[var(--border-color)] px-3 py-2 text-xs font-semibold text-[var(--text-main)]">
                Peer checklist
              </span>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};
