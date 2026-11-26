import React, { useState } from 'react';
import { Download, Bookmark as BookmarkIcon } from 'lucide-react';
import { PageHeader } from '../components/common/PageHeader';
import { EmptyState } from '../components/common/EmptyState';
import { ResourceCard } from '../components/LearningResources/ResourceCard';
import { QuestionRow } from './DSA';
import { questionsData } from '../data/mangosData';
import type { WorkspaceState, QuestionStatus, Question } from '../types/user';
import type { Page } from '../components/Sidebar';

interface BookmarksProps {
  state: WorkspaceState;
  toggleQuestionBookmark: (id: number) => void;
  toggleResourceBookmark: (id: string) => void;
  updateQuestion: (id: number, status: QuestionStatus) => void;
  navigate: (page: Page) => void;
}

export const Bookmarks: React.FC<BookmarksProps> = ({
  state,
  toggleQuestionBookmark,
  toggleResourceBookmark,
  updateQuestion,
  navigate,
}) => {
  const [tab, setTab] = useState<'resources' | 'questions'>('resources');

  const savedQuestions = questionsData.filter((question: Question) => state.bookmarks.includes(question.id));
  const savedResources = state.customResources.filter((resource) => state.resourceBookmarks.includes(resource.id));

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Your space"
        title="Bookmarks & saved items."
        detail="Keep the learning resources and coding practice questions that deserve another pass close by."
        action={
          <div className="flex items-center gap-2 rounded-xl border border-[var(--border-color)] bg-[var(--bg-card)] p-1">
            <button
              onClick={() => setTab('resources')}
              className={`rounded-lg px-3 py-1.5 text-xs font-bold transition ${
                tab === 'resources' ? 'bg-[var(--emerald-primary)] text-white shadow-sm' : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'
              }`}
            >
              Learning Resources ({savedResources.length})
            </button>
            <button
              onClick={() => setTab('questions')}
              className={`rounded-lg px-3 py-1.5 text-xs font-bold transition ${
                tab === 'questions' ? 'bg-[var(--emerald-primary)] text-white shadow-sm' : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'
              }`}
            >
              Practice Questions ({savedQuestions.length})
            </button>
          </div>
        }
      />

      {tab === 'resources' ? (
        <section className="space-y-4">
          <div className="flex items-center justify-between border-b border-[var(--border-color)] pb-3 text-xs text-[var(--text-muted)]">
            <span>{savedResources.length} saved learning resources</span>
            <button
              onClick={() => navigate('Learning Resources')}
              className="text-xs font-bold text-[var(--emerald-primary)] hover:underline"
            >
              Browse all learning resources →
            </button>
          </div>

          {savedResources.length > 0 ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {savedResources.map((resource) => (
                <ResourceCard
                  key={resource.id}
                  resource={resource}
                  isBookmarked={true}
                  onToggleBookmark={toggleResourceBookmark}
                />
              ))}
            </div>
          ) : (
            <div className="rounded-3xl border border-[var(--border-color)] bg-[var(--bg-card)] py-16 px-6 text-center shadow-sm">
              <span className="inline-flex rounded-2xl bg-[var(--bg-secondary)] p-4 text-[var(--sage-dark)] border border-[var(--border-color)]">
                <BookmarkIcon className="h-6 w-6" />
              </span>
              <h4 className="font-display mt-4 text-lg font-bold text-[var(--text-main)]">No saved resources yet</h4>
              <p className="mt-2 text-xs text-[var(--text-muted)] max-w-sm mx-auto">
                Explore the Learning Resources library and bookmark materials to access them quickly from here.
              </p>
              <button
                onClick={() => navigate('Learning Resources')}
                className="mt-5 rounded-xl bg-[var(--emerald-primary)] px-4 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-[var(--emerald-deep)]"
              >
                Go to Learning Resources
              </button>
            </div>
          )}
        </section>
      ) : (
        <section className="rounded-2xl border border-[var(--border-color)] bg-[var(--bg-card)] p-5 sm:p-6 shadow-sm">
          <div className="flex items-center justify-between border-b border-[var(--border-color)] pb-4">
            <div>
              <h3 className="font-display text-lg font-extrabold text-[var(--text-main)]">Saved questions</h3>
              <p className="mt-1 text-xs text-[var(--text-muted)]">Your revision list · {savedQuestions.length} saved</p>
            </div>
            <button className="rounded-xl border border-[var(--border-color)] bg-[var(--bg-secondary)] px-3 py-2 text-xs font-bold text-[var(--text-main)]">
              <Download className="mr-1 inline h-3.5 w-3.5" /> Export list
            </button>
          </div>
          {savedQuestions.length ? (
            <div className="divide-y divide-[var(--border-color)]">
              {savedQuestions.map((question: Question) => (
                <QuestionRow
                  key={question.id}
                  question={question}
                  isBookmarked
                  onBookmark={() => toggleQuestionBookmark(question.id)}
                  onOpen={() => undefined}
                  onStatus={(status) => updateQuestion(question.id, status)}
                  state={state}
                />
              ))}
            </div>
          ) : (
            <EmptyState icon={BookmarkIcon} title="Your revision list is empty" detail="Bookmark a question in DSA Practice to see it here." />
          )}
        </section>
      )}
    </div>
  );
};
