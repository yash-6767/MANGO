import React from 'react';
import {
  Sparkles,
  ArrowRight,
  Flame,
  Code2,
  Clock3,
  BookOpen,
  ChevronDown,
  Check,
  Play,
  Lightbulb,
} from 'lucide-react';
import { StatCard } from '../components/common/StatCard';
import type { Page } from '../components/Sidebar';
import type { WorkspaceState } from '../types/user';

interface DashboardProps {
  state: WorkspaceState;
  navigate: (page: Page) => void;
  notify: (message: string) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ state, navigate, notify }) => {
  const completion = Math.min(100, Math.round((state.completedMilestones.length / 4) * 100));
  const userName = state.profile?.fullName || 'Learner';
  const targetCompany = state.profile?.company || 'Meta';
  const targetRole = state.profile?.targetRole || state.profile?.role || 'Software Engineer';

  return (
    <div>
      {/* Welcome Banner */}
      <div className="mb-8 flex flex-col justify-between gap-5 rounded-3xl border border-[var(--border-color)] bg-gradient-to-br from-[var(--bg-secondary)] via-[var(--bg-primary)] to-[var(--bg-muted)] p-6 shadow-sm sm:p-8 lg:flex-row lg:items-center">
        <div>
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-[var(--sage)]/60 bg-[var(--sage-soft)] px-3 py-1.5 text-[10px] font-bold uppercase tracking-[.15em] text-[var(--emerald-primary)]">
            <Sparkles className="h-3.5 w-3.5" /> Career Roadmap Active
          </div>
          <h2 className="font-display text-3xl font-extrabold tracking-[-.045em] text-[var(--text-main)] sm:text-4xl">
            Good day, {userName}.
          </h2>
          <p className="mt-3 max-w-lg text-sm leading-6 text-[var(--text-muted)]">
            You’re building the right habits. A focused 45 minutes today keeps your path to {targetCompany} moving forward.
          </p>
          <div className="mt-5 flex flex-wrap gap-3">
            <button
              onClick={() => navigate('DSA Practice')}
              className="rounded-xl bg-[var(--emerald-primary)] px-4 py-2.5 text-sm font-bold text-white transition hover:bg-[var(--emerald-deep)] shadow-sm"
            >
              Start today’s session <ArrowRight className="ml-2 inline h-4 w-4" />
            </button>
            <button
              onClick={() => navigate('Learning Resources')}
              className="rounded-xl border border-[var(--border-color)] bg-[var(--bg-card)] px-4 py-2.5 text-sm font-bold text-[var(--text-main)] transition hover:bg-[var(--bg-secondary)] shadow-sm"
            >
              Browse Curated Resources <BookOpen className="ml-2 inline h-4 w-4 text-[var(--emerald-primary)]" />
            </button>
          </div>
        </div>

        <div className="mt-5 flex items-center gap-5 lg:mr-8 lg:mt-0">
          <div
            className="relative flex h-28 w-28 items-center justify-center rounded-full shadow-inner"
            style={{
              background: `conic-gradient(var(--emerald-primary) ${completion * 3.6}deg, var(--border-color) 0deg)`,
            }}
          >
            <div className="flex h-[92px] w-[92px] flex-col items-center justify-center rounded-full bg-[var(--bg-card)] shadow-sm">
              <span className="font-display text-2xl font-extrabold text-[var(--text-main)]">{completion}%</span>
              <span className="text-[10px] text-[var(--text-muted)]">overall</span>
            </div>
          </div>
          <div>
            <p className="text-xs font-semibold text-[var(--text-muted)]">YOUR PREP</p>
            <p className="mt-1 text-lg font-extrabold text-[var(--text-main)]">On track</p>
            <p className="mt-1 text-xs text-[var(--sage-dark)]">Target: {targetRole}</p>
          </div>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard icon={Flame} label="Current streak" value={`${state.streak} days`} detail="Personal best: 18 days" />
        <StatCard icon={Code2} label="Problems solved" value={`${state.solved.length} / 120`} detail="+3 this week" />
        <StatCard icon={Clock3} label="Study time" value="4h 20m" detail="This week · 72% of goal" />
        <StatCard
          icon={BookOpen}
          label="Learning Resources"
          value={`${state.customResources.length}`}
          detail={`${state.resourceBookmarks.length} saved bookmarks`}
        />
      </div>

      {/* Activity & Goals */}
      <div className="mt-7 grid gap-5 xl:grid-cols-[1.35fr_.65fr]">
        <section className="rounded-2xl border border-[var(--border-color)] bg-[var(--bg-card)] p-5 sm:p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-display text-base font-bold text-[var(--text-main)]">Weekly activity</h3>
              <p className="mt-1 text-xs text-[var(--text-muted)]">Your study rhythm over the last 7 days</p>
            </div>
            <span className="flex items-center gap-1 text-xs font-bold text-[var(--emerald-primary)]">
              This week <ChevronDown className="h-3.5 w-3.5" />
            </span>
          </div>
          <div className="mt-7 flex h-40 items-end justify-between gap-2 border-b border-[var(--border-color)] pb-0">
            {[34, 58, 42, 76, 63, 92, 48].map((height, index) => (
              <div key={index} className="flex h-full flex-1 flex-col items-center justify-end gap-2">
                <div
                  className={`w-full max-w-[34px] rounded-t-lg transition hover:opacity-80 ${
                    index === 5 ? 'bg-[var(--emerald-primary)]' : 'bg-[var(--sage-soft)]'
                  }`}
                  style={{ height: `${height}%` }}
                />
                <span className="mb-[-22px] text-[10px] font-bold text-[var(--text-muted)]">
                  {['M', 'T', 'W', 'T', 'F', 'S', 'S'][index]}
                </span>
              </div>
            ))}
          </div>
          <div className="mt-8 flex items-center justify-between text-xs text-[var(--text-muted)]">
            <span>0h</span>
            <span>1h</span>
            <span>2h</span>
            <span>3h</span>
            <span>4h+</span>
          </div>
        </section>

        <section className="rounded-2xl border border-[var(--border-color)] bg-[var(--bg-card)] p-5 sm:p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-display text-base font-bold text-[var(--text-main)]">Today’s goals</h3>
              <p className="mt-1 text-xs text-[var(--text-muted)]">Keep the streak alive</p>
            </div>
            <span className="text-sm font-bold text-[var(--emerald-primary)]">2 / 3</span>
          </div>
          <div className="mt-5 space-y-3">
            {[
              ['Solve 2 array problems', true],
              ['Review system design notes', true],
              ['Read System Design Primer chapter', false],
            ].map(([label, done]) => (
              <button
                key={String(label)}
                onClick={() => notify(done ? 'Goal already complete' : 'Goal marked in your daily focus')}
                className="flex w-full items-center gap-3 rounded-xl border border-[var(--border-color)] bg-[var(--bg-secondary)] p-3 text-left transition hover:border-[var(--sage)]"
              >
                <span
                  className={`flex h-5 w-5 items-center justify-center rounded-full border ${
                    done ? 'border-[var(--emerald-primary)] bg-[var(--emerald-primary)] text-white' : 'border-[var(--sage)] bg-[var(--bg-card)]'
                  }`}
                >
                  {done && <Check className="h-3 w-3" />}
                </span>
                <span className={`text-sm font-semibold ${done ? 'text-[var(--text-muted)] line-through' : 'text-[var(--text-main)]'}`}>
                  {String(label)}
                </span>
              </button>
            ))}
          </div>
          <button onClick={() => navigate('Roadmaps')} className="mt-5 text-xs font-bold text-[var(--emerald-primary)] flex items-center gap-1">
            View my roadmap <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </section>
      </div>

      {/* Suggested next steps */}
      <div className="mt-7 grid gap-5 lg:grid-cols-[1.15fr_.85fr]">
        <section className="rounded-2xl border border-[var(--border-color)] bg-[var(--bg-card)] p-5 sm:p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[.16em] text-[var(--emerald-primary)]">Continue learning</p>
              <h3 className="font-display mt-2 text-xl font-extrabold text-[var(--text-main)]">System design essentials</h3>
            </div>
            <span className="rounded-lg bg-[var(--sage-soft)] px-2.5 py-1.5 text-[10px] font-bold text-[var(--emerald-primary)]">
              IN PROGRESS
            </span>
          </div>
          <p className="mt-3 max-w-lg text-sm leading-6 text-[var(--text-muted)]">
            Design a rate limiter, explore trade-offs, and get comfortable explaining your decisions out loud.
          </p>
          <div className="mt-5 flex items-center gap-4">
            <div className="h-2 flex-1 rounded-full bg-[var(--bg-secondary)] border border-[var(--border-color)]">
              <div className="h-full w-[64%] rounded-full bg-[var(--emerald-primary)]" />
            </div>
            <span className="text-xs font-bold text-[var(--emerald-primary)]">64%</span>
          </div>
          <button
            onClick={() => navigate('DSA Practice')}
            className="mt-6 rounded-xl bg-[var(--emerald-primary)] px-4 py-2.5 text-xs font-bold text-white transition hover:bg-[var(--emerald-deep)] shadow-sm flex items-center gap-1.5"
          >
            Resume lesson <Play className="h-3.5 w-3.5 fill-current" />
          </button>
        </section>

        <section className="rounded-2xl border border-[var(--border-color)] bg-[var(--bg-card)] p-5 sm:p-6 shadow-sm">
          <div className="flex items-center gap-3">
            <span className="rounded-xl bg-[var(--sage-soft)] p-2.5 text-[var(--emerald-primary)]">
              <Lightbulb className="h-5 w-5" />
            </span>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[.16em] text-[var(--emerald-primary)]">Recommended next</p>
              <h3 className="mt-1 text-base font-extrabold text-[var(--text-main)]">Curated Learning Library</h3>
            </div>
          </div>
          <p className="mt-5 text-sm leading-6 text-[var(--text-muted)]">
            Explore verified free learning resources across {state.customResources.length} roadmaps, CS50, freeCodeCamp, NeetCode, and MIT OCW.
          </p>
          <button
            onClick={() => navigate('Learning Resources')}
            className="mt-5 text-xs font-bold text-[var(--emerald-primary)] flex items-center gap-1"
          >
            Explore Library <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </section>
      </div>
    </div>
  );
};
