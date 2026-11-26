import React from 'react';
import {
  LayoutDashboard,
  Code2,
  Target,
  ListChecks,
  MessageSquareText,
  Radar,
  FileSearch,
  BookOpen,
  Bookmark,
  Settings2,
  X,
  Sparkles,
  ChevronRight,
  LogIn,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import type { User } from '@supabase/supabase-js';

export type Page =
  | 'Dashboard'
  | 'DSA Practice'
  | 'Companies'
  | 'Roadmaps'
  | 'Mock Interview'
  | 'Skill Gap'
  | 'Resume Analyzer'
  | 'Learning Resources'
  | 'Bookmarks'
  | 'Profile';

interface NavItemConfig {
  label: Page;
  icon: LucideIcon;
  badge?: string;
  badgeColor?: string;
}

const workspaceNavItems: NavItemConfig[] = [
  { label: 'Dashboard', icon: LayoutDashboard },
  { label: 'DSA Practice', icon: Code2 },
  { label: 'Learning Resources', icon: BookOpen, badge: 'CURATED', badgeColor: 'bg-[var(--emerald-primary)] text-white' },
  { label: 'Companies', icon: Target },
  { label: 'Roadmaps', icon: ListChecks },
  { label: 'Mock Interview', icon: MessageSquareText, badge: 'NEW', badgeColor: 'bg-[var(--sage-soft)] text-[var(--emerald-primary)]' },
  { label: 'Skill Gap', icon: Radar },
  { label: 'Resume Analyzer', icon: FileSearch },
];

interface SidebarProps {
  page: Page;
  navigate: (page: Page) => void;
  mobileOpen: boolean;
  setMobileOpen: (open: boolean) => void;
  resourceBookmarkCount?: number;
  questionBookmarkCount?: number;
  currentUser?: User | null;
  userName?: string;
  onOpenAuth?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  page,
  navigate,
  mobileOpen,
  setMobileOpen,
  resourceBookmarkCount = 0,
  questionBookmarkCount = 0,
  currentUser,
  userName = 'Jordan Davis',
  onOpenAuth,
}) => {
  const totalBookmarks = resourceBookmarkCount + questionBookmarkCount;
  const initials = userName
    .split(' ')
    .map((n) => n[0])
    .filter(Boolean)
    .join('')
    .substring(0, 2)
    .toUpperCase() || 'JD';

  return (
    <>
      <aside
        className={`fixed inset-y-0 left-0 z-40 flex h-screen w-[260px] flex-col border-r border-[var(--border-color)] bg-[var(--bg-card)] transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          mobileOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'
        }`}
      >
        {/* 1. Fixed Top Branding Header */}
        <div className="shrink-0 flex items-center justify-between border-b border-[var(--border-color)] px-5 py-4">
          <button
            onClick={() => navigate('Dashboard')}
            className="flex items-center gap-2.5 text-left focus:outline-none group"
          >
            <span className="mango-mark">
              <span />
            </span>
            <div>
              <span className="font-display text-lg font-extrabold tracking-[-.04em] text-[var(--text-main)] group-hover:text-[var(--emerald-primary)] transition-colors">
                MANGOS
              </span>
              <span className="block text-[10px] font-bold uppercase tracking-[.18em] text-[var(--sage-dark)]">
                Career Prep
              </span>
            </div>
          </button>

          <button
            onClick={() => setMobileOpen(false)}
            className="rounded-lg p-1.5 text-[var(--text-muted)] hover:bg-[var(--bg-secondary)] hover:text-[var(--text-main)] lg:hidden"
            aria-label="Close navigation sidebar"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* 2. Independently Scrollable Navigation Area */}
        <div className="flex-1 min-h-0 overflow-y-auto px-3.5 py-4 space-y-6 sidebar-scrollbar">
          {/* Section: Workspace */}
          <div>
            <div className="px-3 text-[10px] font-bold uppercase tracking-[.18em] text-[var(--sage-dark)]">
              Workspace
            </div>
            <nav className="mt-2.5 space-y-1">
              {workspaceNavItems.map(({ label, icon: Icon, badge, badgeColor }) => {
                const isActive = page === label;
                return (
                  <button
                    key={label}
                    onClick={() => navigate(label)}
                    className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-semibold transition-all ${
                      isActive
                        ? 'bg-[var(--emerald-primary)] text-white shadow-sm font-bold'
                        : 'text-[var(--text-muted)] hover:bg-[var(--bg-secondary)] hover:text-[var(--text-main)]'
                    }`}
                  >
                    <Icon className={`h-[18px] w-[18px] shrink-0 ${isActive ? 'text-white' : 'text-[var(--sage-dark)]'}`} />
                    <span className="truncate">{label}</span>
                    {badge && (
                      <span
                        className={`ml-auto rounded-full px-2 py-0.5 text-[9px] font-black uppercase tracking-wider shrink-0 ${
                          isActive ? 'bg-white/20 text-white' : badgeColor || 'bg-[var(--sage-soft)] text-[var(--emerald-primary)]'
                        }`}
                      >
                        {badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Section: Your Space */}
          <div>
            <div className="px-3 text-[10px] font-bold uppercase tracking-[.18em] text-[var(--sage-dark)]">
              Your Space
            </div>
            <nav className="mt-2.5 space-y-1">
              <button
                onClick={() => navigate('Bookmarks')}
                className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-semibold transition-all ${
                  page === 'Bookmarks'
                    ? 'bg-[var(--emerald-primary)] text-white shadow-sm font-bold'
                    : 'text-[var(--text-muted)] hover:bg-[var(--bg-secondary)] hover:text-[var(--text-main)]'
                }`}
              >
                <Bookmark className={`h-[18px] w-[18px] shrink-0 ${page === 'Bookmarks' ? 'text-white' : 'text-[var(--sage-dark)]'}`} />
                <span>Bookmarks</span>
                {totalBookmarks > 0 && (
                  <span
                    className={`ml-auto rounded-full px-2 py-0.5 text-[10px] font-bold ${
                      page === 'Bookmarks' ? 'bg-white/20 text-white' : 'bg-[var(--sage-soft)] text-[var(--emerald-primary)]'
                    }`}
                  >
                    {totalBookmarks}
                  </span>
                )}
              </button>

              <button
                onClick={() => navigate('Profile')}
                className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-semibold transition-all ${
                  page === 'Profile'
                    ? 'bg-[var(--emerald-primary)] text-white shadow-sm font-bold'
                    : 'text-[var(--text-muted)] hover:bg-[var(--bg-secondary)] hover:text-[var(--text-main)]'
                }`}
              >
                <Settings2 className={`h-[18px] w-[18px] shrink-0 ${page === 'Profile' ? 'text-white' : 'text-[var(--sage-dark)]'}`} />
                <span>Profile & Settings</span>
              </button>
            </nav>
          </div>

          {/* Monthly Library Update Reminder Card */}
          <div className="rounded-2xl border border-[var(--border-color)] bg-[var(--bg-secondary)] p-3.5 text-xs text-[var(--sage-dark)]">
            <div className="flex items-center gap-1.5 font-bold text-[var(--emerald-primary)]">
              <Sparkles className="h-3.5 w-3.5 text-[var(--emerald-primary)]" />
              Monthly Library Update
            </div>
            <p className="mt-1 text-[11px] leading-relaxed text-[var(--text-muted)]">
              New verified free resources added every month. Check the <span className="font-bold text-[var(--emerald-primary)]">NEW</span> badge.
            </p>
          </div>
        </div>

        {/* 3. Anchored Bottom User & Plan Area */}
        <div className="shrink-0 border-t border-[var(--border-color)] bg-[var(--bg-secondary)] p-3.5">
          {currentUser ? (
            <div
              onClick={() => navigate('Profile')}
              className="flex items-center gap-3 rounded-xl p-2 transition hover:bg-[var(--bg-card)] cursor-pointer group"
            >
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[var(--emerald-primary)] text-xs font-black text-white shadow-sm">
                {initials}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-xs font-bold text-[var(--text-main)] group-hover:text-[var(--emerald-primary)] transition-colors">
                  {userName}
                </p>
                <p className="text-[11px] text-[var(--sage-dark)] truncate">{currentUser.email}</p>
              </div>
              <ChevronRight className="h-4 w-4 text-[var(--text-muted)] group-hover:text-[var(--text-main)]" />
            </div>
          ) : (
            <div className="space-y-2">
              <div
                onClick={() => navigate('Profile')}
                className="flex items-center gap-3 rounded-xl p-2 transition hover:bg-[var(--bg-card)] cursor-pointer group"
              >
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[var(--sage)] text-xs font-bold text-white shadow-sm">
                  {initials}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-xs font-bold text-[var(--text-main)]">{userName}</p>
                  <p className="text-[10px] text-[var(--text-muted)]">Guest mode</p>
                </div>
              </div>
              {onOpenAuth && (
                <button
                  onClick={onOpenAuth}
                  className="w-full flex items-center justify-center gap-1.5 rounded-xl bg-[var(--emerald-primary)] px-3 py-2 text-xs font-bold text-white transition hover:bg-[var(--emerald-deep)] shadow-sm"
                >
                  <LogIn className="h-3.5 w-3.5" /> Sign In / Sync
                </button>
              )}
            </div>
          )}
        </div>
      </aside>

      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/50 backdrop-blur-sm lg:hidden transition-opacity"
          onClick={() => setMobileOpen(false)}
          aria-hidden="true"
        />
      )}
    </>
  );
};
