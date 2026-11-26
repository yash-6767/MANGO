import React, { useState } from 'react';
import { Flame, Award, Bell, Check, LogOut, LogIn } from 'lucide-react';
import { PageHeader } from '../components/common/PageHeader';
import { StatCard } from '../components/common/StatCard';
import type { CompanyName, WorkspaceState } from '../types/user';
import { allCompanies, CAREER_TARGETS, PROGRAMMING_LANGUAGES, EXPERIENCE_LEVELS } from '../data/mangosData';
import type { User } from '@supabase/supabase-js';

interface ProfileProps {
  state: WorkspaceState;
  onUpdateProfile: (updated: Partial<WorkspaceState['profile']>) => void;
  currentUser: User | null;
  onOpenAuth: () => void;
  onSignOut: () => void;
  notify: (message: string) => void;
}

export const Profile: React.FC<ProfileProps> = ({
  state,
  onUpdateProfile,
  currentUser,
  onOpenAuth,
  onSignOut,
  notify,
}) => {
  const [fullName, setFullName] = useState(state.profile?.fullName || '');
  const [university, setUniversity] = useState(state.profile?.university || state.profile?.school || '');
  const [targetRole, setTargetRole] = useState(state.profile?.targetRole || state.profile?.role || 'Software Engineer');
  const [company, setCompany] = useState<CompanyName>(state.profile?.company || 'Meta');
  const [preferredLanguage, setPreferredLanguage] = useState(state.profile?.preferredLanguage || 'Python');
  const [experienceLevel, setExperienceLevel] = useState(state.profile?.experienceLevel || 'Beginner / Student');

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateProfile({
      fullName: fullName.trim(),
      university: university.trim(),
      school: university.trim(),
      targetRole,
      role: targetRole,
      company,
      preferredLanguage,
      experienceLevel,
    });
    notify('Profile and preferences updated successfully');
  };

  const initials = fullName
    .split(' ')
    .map((n) => n[0])
    .filter(Boolean)
    .join('')
    .substring(0, 2)
    .toUpperCase() || (currentUser?.email ? currentUser.email.substring(0, 2).toUpperCase() : 'G');

  return (
    <div>
      <PageHeader
        eyebrow="Your profile"
        title="Shape your preparation."
        detail="Keep your target role and company current so every recommendation and roadmap milestone stays relevant."
      />
      <div className="grid gap-5 lg:grid-cols-[.8fr_1.2fr]">
        {/* Left Column: Account & Activity Card */}
        <div className="space-y-5">
          <section className="rounded-2xl border border-[var(--border-color)] bg-[var(--bg-card)] p-6 shadow-sm">
            <div className="flex items-center gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[var(--emerald-primary)] text-xl font-extrabold text-white shadow-sm">
                {initials}
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="font-display text-xl font-extrabold text-[var(--text-main)] truncate">{fullName}</h3>
                <p className="mt-1 text-sm text-[var(--text-muted)] truncate">{university}</p>
                {currentUser ? (
                  <span className="mt-2 inline-flex items-center gap-1 text-[11px] font-bold text-[var(--emerald-primary)]">
                    <Check className="h-3 w-3" /> Signed in ({currentUser.email})
                  </span>
                ) : (
                  <span className="mt-2 inline-block rounded-md bg-[var(--bg-secondary)] px-2 py-0.5 text-[10px] font-bold text-[var(--sage-dark)] border border-[var(--border-color)]">
                    Guest Mode · Local storage only
                  </span>
                )}
              </div>
            </div>

            <div className="mt-7 grid grid-cols-2 gap-3">
              <StatCard icon={Flame} label="Streak" value={`${state.streak}d`} detail="Personal best 18d" />
              <StatCard icon={Award} label="Earned" value="4" detail="Milestones" />
            </div>

            <div className="mt-6 border-t border-[var(--border-color)] pt-4">
              {currentUser ? (
                <button
                  onClick={onSignOut}
                  className="w-full flex items-center justify-center gap-2 rounded-xl border border-[var(--border-color)] bg-[var(--bg-secondary)] px-4 py-2.5 text-xs font-bold text-[var(--text-main)] hover:border-[var(--status-danger-border)] hover:bg-[var(--status-danger-bg)] hover:text-[var(--status-danger)] transition"
                >
                  <LogOut className="h-3.5 w-3.5" /> Sign Out
                </button>
              ) : (
                <button
                  onClick={onOpenAuth}
                  className="w-full flex items-center justify-center gap-2 rounded-xl bg-[var(--emerald-primary)] px-4 py-2.5 text-xs font-bold text-white hover:bg-[var(--emerald-deep)] transition shadow-sm"
                >
                  <LogIn className="h-3.5 w-3.5" /> Sign In / Create Account
                </button>
              )}
            </div>
          </section>

          <div className="rounded-xl border border-[var(--border-color)] bg-[var(--bg-secondary)] p-4">
            <p className="flex items-center gap-2 text-xs font-bold text-[var(--emerald-primary)]">
              <Bell className="h-4 w-4" /> Weekly progress digest
            </p>
            <p className="mt-1 text-xs text-[var(--text-muted)] leading-relaxed">
              Your preparation activity is summarized every Monday morning.
            </p>
          </div>
        </div>

        {/* Right Column: Editable Preferences Form */}
        <section className="rounded-2xl border border-[var(--border-color)] bg-[var(--bg-card)] p-6 sm:p-7 shadow-sm">
          <h3 className="font-display text-lg font-extrabold text-[var(--text-main)]">
            Preparation preferences
          </h3>
          <p className="text-xs text-[var(--text-muted)] mt-1">
            Update your targets to adjust problem difficulty and milestone suggestions.
          </p>

          <form onSubmit={handleSave} className="mt-6 space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-2 block text-xs font-bold text-[var(--sage-dark)]">Full Name</label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="field"
                />
              </div>

              <div>
                <label className="mb-2 block text-xs font-bold text-[var(--sage-dark)]">University / School</label>
                <input
                  type="text"
                  value={university}
                  onChange={(e) => setUniversity(e.target.value)}
                  className="field"
                />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-2 block text-xs font-bold text-[var(--sage-dark)]">Target Company</label>
                <select
                  value={company}
                  onChange={(event) => setCompany(event.target.value as CompanyName)}
                  className="field"
                >
                  {allCompanies.map((item) => (
                    <option key={item}>{item}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-2 block text-xs font-bold text-[var(--sage-dark)]">Target Role</label>
                <select
                  value={targetRole}
                  onChange={(event) => setTargetRole(event.target.value)}
                  className="field"
                >
                  {CAREER_TARGETS.map((item) => (
                    <option key={item}>{item}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-2 block text-xs font-bold text-[var(--sage-dark)]">Primary Language</label>
                <select
                  value={preferredLanguage}
                  onChange={(e) => setPreferredLanguage(e.target.value)}
                  className="field"
                >
                  {PROGRAMMING_LANGUAGES.map((l) => (
                    <option key={l}>{l}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-2 block text-xs font-bold text-[var(--sage-dark)]">Experience Level</label>
                <select
                  value={experienceLevel}
                  onChange={(e) => setExperienceLevel(e.target.value)}
                  className="field"
                >
                  {EXPERIENCE_LEVELS.map((lvl) => (
                    <option key={lvl}>{lvl}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="pt-4 flex justify-end">
              <button
                type="submit"
                className="flex items-center gap-1.5 rounded-xl bg-[var(--emerald-primary)] px-5 py-2.5 text-xs font-bold text-white transition hover:bg-[var(--emerald-deep)] shadow-sm"
              >
                <Check className="h-4 w-4" /> Save Preferences
              </button>
            </div>
          </form>
        </section>
      </div>
    </div>
  );
};
