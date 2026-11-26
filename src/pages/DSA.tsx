import React, { useState } from 'react';
import {
  Code2,
  Bookmark,
  Gauge,
  Zap,
  Search,
  Check,
  Clock3,
  Lightbulb,
  ArrowRight,
  ShieldCheck,
  X,
} from 'lucide-react';
import { PageHeader } from '../components/common/PageHeader';
import { StatCard } from '../components/common/StatCard';
import { EmptyState } from '../components/common/EmptyState';
import { Modal } from '../components/common/Modal';
import type { Question, QuestionStatus, WorkspaceState } from '../types/user';
import { allCompanies, questionsData } from '../data/mangosData';

interface DSAPageProps {
  state: WorkspaceState;
  toggleBookmark: (id: number) => void;
  updateQuestion: (id: number, status: QuestionStatus) => void;
  notify: (message: string) => void;
}

export const DSA: React.FC<DSAPageProps> = ({
  state,
  toggleBookmark,
  updateQuestion,
  notify,
}) => {
  const [search, setSearch] = useState('');
  const [topic, setTopic] = useState('All topics');
  const [difficulty, setDifficulty] = useState('All difficulty');
  const [company, setCompany] = useState('All companies');
  const [selected, setSelected] = useState<Question | null>(null);

  const topics: string[] = ['All topics', ...Array.from(new Set(questionsData.map((question) => question.topic)))];
  const filtered = questionsData.filter(
    (question: Question) =>
      question.title.toLowerCase().includes(search.toLowerCase()) &&
      (topic === 'All topics' || question.topic === topic) &&
      (difficulty === 'All difficulty' || question.difficulty === difficulty) &&
      (company === 'All companies' || question.company === company)
  );

  return (
    <div>
      <PageHeader
        eyebrow="Practice hub"
        title="Build the muscle."
        detail="A focused set of problems, tagged for the companies and roles you’re preparing for."
        action={
          <button
            onClick={() => notify('Daily practice plan refreshed')}
            className="rounded-xl bg-[var(--emerald-primary)] px-4 py-2.5 text-sm font-bold text-white shadow-sm hover:bg-[var(--emerald-deep)]"
          >
            Daily challenge <Zap className="ml-1 inline h-4 w-4" />
          </button>
        }
      />
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard icon={Code2} label="Solved" value={`${state.solved.length}`} detail="of 120 questions" />
        <StatCard icon={Bookmark} label="Bookmarked" value={`${state.bookmarks.length}`} detail="Ready to revisit" />
        <StatCard icon={Gauge} label="This week" value="3 / 5" detail="practice goal" />
      </div>

      <div className="mt-7 grid gap-6 xl:grid-cols-[1fr_300px]">
        <section className="min-w-0 rounded-2xl border border-[var(--border-color)] bg-[var(--bg-card)] p-5 sm:p-6 shadow-sm">
          <div className="flex flex-col gap-3 lg:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-3 h-4 w-4 text-[var(--text-muted)]" />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search questions..."
                className="w-full rounded-xl border border-[var(--border-color)] bg-[var(--bg-secondary)] py-2.5 pl-10 pr-3 text-sm text-[var(--text-main)] outline-none placeholder:text-[var(--text-muted)] focus:border-[var(--emerald-primary)] focus:bg-[var(--bg-card)]"
              />
            </div>
            <div className="flex gap-2 overflow-x-auto">
              <select
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                className="rounded-xl border border-[var(--border-color)] bg-[var(--bg-card)] py-2.5 px-3 text-xs font-bold text-[var(--text-main)] outline-none focus:border-[var(--emerald-primary)]"
              >
                {topics.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
              <select
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value)}
                className="rounded-xl border border-[var(--border-color)] bg-[var(--bg-card)] py-2.5 px-3 text-xs font-bold text-[var(--text-main)] outline-none focus:border-[var(--emerald-primary)]"
              >
                <option>All difficulty</option>
                <option>Easy</option>
                <option>Medium</option>
                <option>Hard</option>
              </select>
              <select
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                className="rounded-xl border border-[var(--border-color)] bg-[var(--bg-card)] py-2.5 px-3 text-xs font-bold text-[var(--text-main)] outline-none focus:border-[var(--emerald-primary)]"
              >
                <option>All companies</option>
                {allCompanies.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="mt-6 flex items-center justify-between border-b border-[var(--border-color)] pb-3 text-xs text-[var(--text-muted)]">
            <span>{filtered.length} questions</span>
            <span>Sorted by recommended</span>
          </div>

          <div className="divide-y divide-[var(--border-color)]">
            {filtered.map((question) => (
              <QuestionRow
                key={question.id}
                question={question}
                isBookmarked={state.bookmarks.includes(question.id)}
                onBookmark={() => toggleBookmark(question.id)}
                onOpen={() => setSelected(question)}
                onStatus={(status) => updateQuestion(question.id, status)}
                state={state}
              />
            ))}
            {filtered.length === 0 && (
              <EmptyState icon={Search} title="No questions found" detail="Try a different topic, company, or search term." />
            )}
          </div>
        </section>

        <aside className="rounded-2xl border border-[var(--border-color)] bg-[var(--bg-card)] p-5 shadow-sm">
          <p className="text-[10px] font-bold uppercase tracking-[.16em] text-[var(--emerald-primary)]">Topic progress</p>
          <h3 className="font-display mt-2 text-lg font-extrabold text-[var(--text-main)]">Your coverage</h3>
          <div className="mt-6 space-y-4">
            {['Arrays & Strings', 'Graphs', 'Design', 'Dynamic Programming', 'Systems'].map((item, index) => (
              <div key={item}>
                <div className="mb-2 flex justify-between text-xs font-semibold">
                  <span className="text-[var(--text-main)]">{item}</span>
                  <span className="text-[var(--text-muted)]">{[82, 34, 28, 12, 46][index]}%</span>
                </div>
                <div className="h-1.5 rounded-full bg-[var(--bg-secondary)] border border-[var(--border-color)]">
                  <div className="h-full rounded-full bg-[var(--emerald-primary)]" style={{ width: `${[82, 34, 28, 12, 46][index]}%` }} />
                </div>
              </div>
            ))}
          </div>
          <div className="mt-8 rounded-xl border border-[var(--border-color)] bg-[var(--bg-secondary)] p-4">
            <p className="flex items-center gap-2 text-xs font-bold text-[var(--emerald-primary)]">
              <ShieldCheck className="h-4 w-4" /> Interview note
            </p>
            <p className="mt-2 text-xs leading-5 text-[var(--text-muted)]">
              Questions are practice material, not guaranteed interview questions.
            </p>
          </div>
        </aside>
      </div>

      {selected && (
        <QuestionModal
          question={selected}
          onClose={() => setSelected(null)}
          isBookmarked={state.bookmarks.includes(selected.id)}
          onBookmark={() => toggleBookmark(selected.id)}
          notify={notify}
        />
      )}
    </div>
  );
};

export function QuestionRow({
  question,
  isBookmarked,
  onBookmark,
  onOpen,
  onStatus,
  state,
}: {
  question: Question;
  isBookmarked: boolean;
  onBookmark: () => void;
  onOpen: () => void;
  onStatus: (status: QuestionStatus) => void;
  state: WorkspaceState;
}) {
  const status = state.solved.includes(question.id) ? 'Solved' : state.attempted.includes(question.id) ? 'Attempted' : 'Not started';
  return (
    <div className="group flex items-center gap-3 py-4">
      <button onClick={onOpen} className="min-w-0 flex-1 text-left">
        <div className="flex items-center gap-3">
          <span
            className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border ${
              status === 'Solved'
                ? 'border-[var(--emerald-primary)] bg-[var(--sage-soft)] text-[var(--emerald-primary)]'
                : status === 'Attempted'
                ? 'border-[var(--sage)] bg-[var(--bg-secondary)] text-[var(--sage-dark)]'
                : 'border-[var(--border-color)] bg-[var(--bg-secondary)] text-[var(--text-muted)]'
            }`}
          >
            {status === 'Solved' ? <Check className="h-3.5 w-3.5" /> : status === 'Attempted' ? <Clock3 className="h-3.5 w-3.5" /> : <span className="h-1.5 w-1.5 rounded-full bg-current" />}
          </span>
          <span className="min-w-0">
            <span className="block truncate text-sm font-bold text-[var(--text-main)] transition group-hover:text-[var(--emerald-primary)]">
              {question.title}
            </span>
            <span className="mt-1 block text-xs text-[var(--text-muted)]">
              {question.topic} · {question.company}
            </span>
          </span>
        </div>
      </button>

      <span
        className={`hidden rounded-md px-2 py-1 text-[10px] font-bold sm:block ${
          question.difficulty === 'Easy'
            ? 'bg-[var(--sage-soft)] text-[var(--emerald-primary)]'
            : question.difficulty === 'Medium'
            ? 'bg-[var(--bg-secondary)] text-[var(--sage-dark)] border border-[var(--border-color)]'
            : 'bg-[var(--bg-muted)] text-[var(--emerald-deep)]'
        }`}
      >
        {question.difficulty}
      </span>
      <span className="hidden text-xs text-[var(--text-muted)] md:block">{question.time}</span>
      <select
        value={status}
        onChange={(event) => onStatus(event.target.value as QuestionStatus)}
        className="hidden rounded-lg border border-[var(--border-color)] bg-[var(--bg-card)] px-2 py-1.5 text-[10px] font-bold text-[var(--sage-dark)] outline-none sm:block"
      >
        <option>Solved</option>
        <option>Attempted</option>
        <option>Not started</option>
      </select>
      <button
        onClick={onBookmark}
        className={`rounded-lg p-2 transition ${isBookmarked ? 'text-[var(--emerald-primary)]' : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'}`}
      >
        <Bookmark className={`h-4 w-4 ${isBookmarked ? 'fill-current' : ''}`} />
      </button>
    </div>
  );
}

export function QuestionModal({
  question,
  onClose,
  isBookmarked,
  onBookmark,
  notify,
}: {
  question: Question;
  onClose: () => void;
  isBookmarked: boolean;
  onBookmark: () => void;
  notify: (message: string) => void;
}) {
  return (
    <Modal onClose={onClose}>
      <div className="flex items-start justify-between">
        <div>
          <span className="rounded-md bg-[var(--sage-soft)] px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-[var(--emerald-primary)]">
            {question.difficulty} · {question.time}
          </span>
          <h2 className="font-display mt-4 text-2xl font-extrabold text-[var(--text-main)]">{question.title}</h2>
          <p className="mt-2 text-sm text-[var(--text-muted)]">
            {question.topic} · Practice signal for {question.company}
          </p>
        </div>
        <button onClick={onClose} className="rounded-lg p-2 text-[var(--text-muted)] hover:bg-[var(--bg-secondary)] hover:text-[var(--text-main)]">
          <X className="h-5 w-5" />
        </button>
      </div>
      <div className="mt-7 rounded-2xl border border-[var(--border-color)] bg-[var(--bg-secondary)] p-4">
        <p className="text-xs font-bold uppercase tracking-wider text-[var(--sage-dark)]">Prompt</p>
        <p className="mt-3 text-sm leading-6 text-[var(--text-main)]">
          Explain a clean approach to this problem. Start with constraints, share your complexity trade-offs, and name the edge cases you would test.
        </p>
      </div>
      <div className="mt-4 flex items-center gap-3">
        <button
          onClick={() => notify('Hint unlocked: start with the simplest constraint')}
          className="rounded-xl border border-[var(--border-color)] px-4 py-2.5 text-xs font-bold text-[var(--text-main)] hover:border-[var(--emerald-primary)]"
        >
          <Lightbulb className="mr-1.5 inline h-3.5 w-3.5 text-[var(--emerald-primary)]" /> Show hint
        </button>
        <button
          onClick={() => {
            onBookmark();
            notify(isBookmarked ? 'Removed from bookmarks' : 'Saved to bookmarks');
          }}
          className="rounded-xl border border-[var(--border-color)] px-4 py-2.5 text-xs font-bold text-[var(--text-main)] hover:border-[var(--emerald-primary)]"
        >
          <Bookmark className={`mr-1.5 inline h-3.5 w-3.5 ${isBookmarked ? 'fill-current text-[var(--emerald-primary)]' : ''}`} />
          {isBookmarked ? 'Bookmarked' : 'Bookmark'}
        </button>
      </div>
      <button
        onClick={() => notify('Practice session started')}
        className="mt-7 w-full rounded-xl bg-[var(--emerald-primary)] px-4 py-3 text-sm font-bold text-white shadow-sm hover:bg-[var(--emerald-deep)]"
      >
        Start problem <ArrowRight className="ml-1 inline h-4 w-4" />
      </button>
    </Modal>
  );
}
