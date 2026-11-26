import React, { useState } from 'react';
import { Sparkles, ArrowRight, Check } from 'lucide-react';
import type { CompanyName, UserProfile } from '../../types/user';
import {
  CAREER_TARGETS,
  PROGRAMMING_LANGUAGES,
  TARGET_COMPANIES,
  EXPERIENCE_LEVELS,
} from '../../data/mangosData';

interface OnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (profile: Partial<UserProfile>) => void;
  initialProfile?: Partial<UserProfile>;
}

export const OnboardingModal: React.FC<OnboardingModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialProfile,
}) => {
  const [fullName, setFullName] = useState(initialProfile?.fullName || '');
  const [university, setUniversity] = useState(initialProfile?.university || '');
  const [targetRole, setTargetRole] = useState(initialProfile?.targetRole || 'Software Engineer');
  const [targetCompany, setTargetCompany] = useState<CompanyName>(initialProfile?.targetCompany || 'Meta');
  const [preferredLanguage, setPreferredLanguage] = useState(initialProfile?.preferredLanguage || 'Python');
  const [experienceLevel, setExperienceLevel] = useState(initialProfile?.experienceLevel || 'Beginner / Student');

  if (!isOpen) return null;

  const handleSave = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    onSave({
      fullName: fullName.trim() || 'Learner',
      university: university.trim() || 'University',
      targetRole,
      targetCompany,
      preferredLanguage,
      experienceLevel,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 p-4 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-xl rounded-2xl border border-[var(--border-color)] bg-[var(--bg-card)] p-6 shadow-2xl sm:p-8 text-[var(--text-main)] my-8 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--sage-soft)] text-[var(--emerald-primary)] shadow-inner">
            <Sparkles className="h-6 w-6" />
          </div>
          <h2 className="font-display text-2xl font-extrabold text-[var(--text-main)]">
            Tailor Your Career Path
          </h2>
          <p className="mt-1 text-xs text-[var(--text-muted)] max-w-md mx-auto">
            Personalize your daily challenges, company signals, and roadmap milestones. All fields are optional.
          </p>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSave} className="flex-1 overflow-y-auto space-y-4 pr-1 sidebar-scrollbar">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[var(--sage-dark)] mb-1.5">
                Your Name
              </label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="e.g. Jordan Davis"
                className="w-full rounded-xl border border-[var(--border-color)] bg-[var(--bg-secondary)] px-3.5 py-2.5 text-xs font-semibold text-[var(--text-main)] outline-none focus:border-[var(--emerald-primary)] focus:bg-[var(--bg-card)]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[var(--sage-dark)] mb-1.5">
                University or College
              </label>
              <input
                type="text"
                value={university}
                onChange={(e) => setUniversity(e.target.value)}
                placeholder="e.g. University of Michigan"
                className="w-full rounded-xl border border-[var(--border-color)] bg-[var(--bg-secondary)] px-3.5 py-2.5 text-xs font-semibold text-[var(--text-main)] outline-none focus:border-[var(--emerald-primary)] focus:bg-[var(--bg-card)]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[var(--sage-dark)] mb-1.5">
              Target Career Role
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {CAREER_TARGETS.map((role) => (
                <button
                  type="button"
                  key={role}
                  onClick={() => setTargetRole(role)}
                  className={`rounded-xl border px-3 py-2 text-xs font-bold text-left transition ${
                    targetRole === role
                      ? 'border-[var(--emerald-primary)] bg-[var(--sage-soft)] text-[var(--emerald-primary)]'
                      : 'border-[var(--border-color)] bg-[var(--bg-secondary)] text-[var(--text-muted)] hover:text-[var(--text-main)]'
                  }`}
                >
                  {role}
                </button>
              ))}
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[var(--sage-dark)] mb-1.5">
                Target Company Signal
              </label>
              <select
                value={targetCompany}
                onChange={(e) => setTargetCompany(e.target.value as CompanyName)}
                className="field"
              >
                {TARGET_COMPANIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[var(--sage-dark)] mb-1.5">
                Primary Coding Language
              </label>
              <select
                value={preferredLanguage}
                onChange={(e) => setPreferredLanguage(e.target.value)}
                className="field"
              >
                {PROGRAMMING_LANGUAGES.map((lang) => (
                  <option key={lang} value={lang}>
                    {lang}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[var(--sage-dark)] mb-1.5">
              Experience Level
            </label>
            <select
              value={experienceLevel}
              onChange={(e) => setExperienceLevel(e.target.value)}
              className="field"
            >
              {EXPERIENCE_LEVELS.map((lvl) => (
                <option key={lvl} value={lvl}>
                  {lvl}
                </option>
              ))}
            </select>
          </div>

          {/* Action buttons */}
          <div className="flex items-center justify-between border-t border-[var(--border-color)] pt-5 mt-4">
            <button
              type="button"
              onClick={onClose}
              className="text-xs font-bold text-[var(--text-muted)] hover:text-[var(--text-main)]"
            >
              Skip for now
            </button>
            <button
              type="submit"
              className="flex items-center gap-1.5 rounded-xl bg-[var(--emerald-primary)] px-5 py-2.5 text-xs font-bold text-white transition hover:bg-[var(--emerald-deep)] shadow-sm"
            >
              <Check className="h-4 w-4" />
              Save & Personalize Workspace <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
