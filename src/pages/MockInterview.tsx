import React, { useState } from 'react';
import { Gauge, MessageSquareText, Target, Clock3, Lightbulb, ArrowRight, Play, Sparkles } from 'lucide-react';
import { PageHeader } from '../components/common/PageHeader';
import { StatCard } from '../components/common/StatCard';
import type { CompanyName } from '../types/user';
import { allCompanies } from '../data/mangosData';

interface MockInterviewProps {
  notify: (message: string) => void;
}

export const MockInterview: React.FC<MockInterviewProps> = ({ notify }) => {
  const [started, setStarted] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [answer, setAnswer] = useState('');
  const [company, setCompany] = useState<CompanyName>('Meta');
  const [role, setRole] = useState('Software Engineering');

  if (submitted) {
    return (
      <div className="mx-auto max-w-3xl">
        <PageHeader
          eyebrow="Interview report"
          title="Strong first round."
          detail="Here’s a directional review to help you focus your next practice session."
          action={
            <button
              onClick={() => {
                setSubmitted(false);
                setStarted(false);
                setAnswer('');
              }}
              className="rounded-xl border border-[var(--border-color)] bg-[var(--bg-card)] px-4 py-2.5 text-sm font-bold text-[var(--text-main)]"
            >
              Try another
            </button>
          }
        />
        <div className="grid gap-4 sm:grid-cols-3">
          <StatCard icon={Gauge} label="Overall score" value="78 / 100" detail="Above your last attempt" />
          <StatCard icon={MessageSquareText} label="Communication" value="82" detail="Clear and structured" />
          <StatCard icon={Target} label="Next focus" value="Edge cases" detail="Add more specificity" />
        </div>
        <section className="mt-5 rounded-2xl border border-[var(--border-color)] bg-[var(--bg-card)] p-6 shadow-sm">
          <h3 className="font-display text-lg font-extrabold text-[var(--text-main)]">Coach feedback</h3>
          <div className="mt-5 space-y-3">
            {[
              'You started by clarifying the goal, which created a strong frame.',
              'Your trade-off discussion was clear and connected to the user experience.',
              'Next time, name two edge cases before committing to the implementation.',
            ].map((item, index) => (
              <div
                key={item}
                className="flex gap-3 rounded-xl border border-[var(--border-color)] bg-[var(--bg-secondary)] p-4 text-sm leading-6 text-[var(--text-main)]"
              >
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[var(--sage-soft)] text-xs font-bold text-[var(--emerald-primary)]">
                  0{index + 1}
                </span>
                {item}
              </div>
            ))}
          </div>
        </section>
      </div>
    );
  }

  if (started) {
    return (
      <div className="mx-auto max-w-3xl">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[.18em] text-[var(--emerald-primary)]">
              Live mock · {company}
            </p>
            <h2 className="font-display mt-2 text-2xl font-extrabold text-[var(--text-main)]">Product thinking round</h2>
          </div>
          <span className="flex items-center gap-2 text-xs font-bold text-[var(--text-muted)]">
            <Clock3 className="h-4 w-4" /> 18:42
          </span>
        </div>
        <div className="h-1.5 rounded-full bg-[var(--bg-secondary)] border border-[var(--border-color)]">
          <div className="h-full w-[45%] rounded-full bg-[var(--emerald-primary)]" />
        </div>
        <section className="mt-7 rounded-2xl border border-[var(--border-color)] bg-[var(--bg-card)] p-6 sm:p-8 shadow-sm">
          <p className="text-[10px] font-bold uppercase tracking-[.18em] text-[var(--sage-dark)]">
            Question 1 of 3 · {role}
          </p>
          <h3 className="font-display mt-5 text-2xl font-extrabold leading-tight text-[var(--text-main)]">
            How would you improve a social feed for college students?
          </h3>
          <p className="mt-4 text-sm leading-6 text-[var(--text-muted)]">
            Take 1–2 minutes to structure your answer. Focus on user problem, constraints, metrics, and tradeoffs.
          </p>
          <textarea
            value={answer}
            onChange={(event) => setAnswer(event.target.value)}
            placeholder="Write your answer or use this space as your thinking pad..."
            className="mt-7 min-h-44 w-full resize-none rounded-xl border border-[var(--border-color)] bg-[var(--bg-secondary)] p-4 text-sm leading-6 text-[var(--text-main)] outline-none placeholder:text-[var(--text-muted)] focus:border-[var(--emerald-primary)] focus:bg-[var(--bg-card)]"
          />
          <div className="mt-5 flex flex-wrap justify-between gap-3">
            <button
              onClick={() => notify('Hint: start with the target user and a measurable outcome')}
              className="rounded-xl border border-[var(--border-color)] bg-[var(--bg-card)] px-4 py-2.5 text-xs font-bold text-[var(--text-main)]"
            >
              <Lightbulb className="mr-1 inline h-3.5 w-3.5 text-[var(--emerald-primary)]" /> Get a hint
            </button>
            <button
              onClick={() => setSubmitted(true)}
              disabled={!answer.trim()}
              className="rounded-xl bg-[var(--emerald-primary)] px-5 py-2.5 text-sm font-bold text-white shadow-sm hover:bg-[var(--emerald-deep)] disabled:cursor-not-allowed disabled:opacity-40"
            >
              Submit answer <ArrowRight className="ml-1 inline h-4 w-4" />
            </button>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl">
      <PageHeader
        eyebrow="AI mock interview"
        title="Practice the real conversation."
        detail="Choose your target, then work through one question at a time with feedback and a final report."
      />
      <section className="rounded-2xl border border-[var(--border-color)] bg-[var(--bg-card)] p-6 sm:p-8 shadow-sm">
        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <span className="mb-2 block text-xs font-bold text-[var(--sage-dark)]">Company</span>
            <select
              value={company}
              onChange={(event) => setCompany(event.target.value as CompanyName)}
              className="field"
            >
              {allCompanies.map((item: CompanyName) => (
                <option key={item}>{item}</option>
              ))}
            </select>
          </div>

          <div>
            <span className="mb-2 block text-xs font-bold text-[var(--sage-dark)]">Role</span>
            <select value={role} onChange={(event) => setRole(event.target.value)} className="field">
              <option>Software Engineering</option>
              <option>AI / ML Engineering</option>
              <option>Research Engineering</option>
              <option>Backend Development</option>
            </select>
          </div>

          <div>
            <span className="mb-2 block text-xs font-bold text-[var(--sage-dark)]">Interview type</span>
            <select className="field">
              <option>Product thinking</option>
              <option>Coding</option>
              <option>System design</option>
              <option>Behavioral</option>
            </select>
          </div>

          <div>
            <span className="mb-2 block text-xs font-bold text-[var(--sage-dark)]">Difficulty</span>
            <select className="field">
              <option>Medium</option>
              <option>Easy</option>
              <option>Hard</option>
            </select>
          </div>
        </div>

        <div className="mt-7 rounded-xl border border-[var(--border-color)] bg-[var(--bg-secondary)] p-4">
          <div className="flex gap-3">
            <span className="rounded-lg bg-[var(--sage-soft)] p-2 text-[var(--emerald-primary)]">
              <Sparkles className="h-4 w-4" />
            </span>
            <div>
              <p className="text-sm font-bold text-[var(--text-main)]">How this works</p>
              <p className="mt-1 text-xs leading-5 text-[var(--text-muted)]">
                You’ll answer three questions. MANGOS will give directional feedback on structure, clarity, and technical depth. Treat it as practice, not a prediction.
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={() => setStarted(true)}
          className="mt-7 rounded-xl bg-[var(--emerald-primary)] px-5 py-3 text-sm font-bold text-white shadow-sm hover:bg-[var(--emerald-deep)] flex items-center gap-2"
        >
          Start interview <Play className="h-4 w-4 fill-current" />
        </button>
      </section>
    </div>
  );
};
