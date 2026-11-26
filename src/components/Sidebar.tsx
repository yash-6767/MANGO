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
  LogOut,
  ChevronRight,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

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

export interface NavItemConfig {
  label: Page;
  icon: LucideIcon;
  badge?: string;
  badgeColor?: string;
}

export const workspaceNavItems: NavItemConfig[] = [
  { label: 'Dashboard', icon: LayoutDashboard },
  { label: 'DSA Practice', icon: Code2 },
  { label: 'Learning Resources', icon: BookOpen, badge: 'CURATED', badgeColor: 'bg-[#176B50] text-white' },
  { label: 'Companies', icon: Target },
  { label: 'Roadmaps', icon: ListChecks },
  { label: 'Mock Interview', icon: MessageSquareText, badge: 'NEW', badgeColor: 'bg-[#176B50]/15 text-[#176B50]' },
  { label: 'Skill Gap', icon: Radar },
  { label: 'Resume Analyzer', icon: FileSearch },
];

export const userSpaceNavItems: NavItemConfig[] = [
  { label: 'Bookmarks', icon: Bookmark },
  { label: 'Profile', icon: Settings2 },
];

interface SidebarProps {
  page: Page;
  navigate: (page: Page) => void;
  mobileOpen: boolean;
  setMobileOpen: (open: boolean) => void;
  resourceBookmarkCount?: number;
  questionBookmarkCount?: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  page,
  navigate,
  mobileOpen,
  setMobileOpen,
  resourceBookmarkCount = 0,
  questionBookmarkCount = 0,
}) => {
  const totalBookmarks = resourceBookmarkCount + questionBookmarkCount;

  return (
    <>
      <aside
        className={`fixed inset-y-0 left-0 z-40 flex h-screen w-[260px] flex-col border-r border-[#DDDCCF] bg-white transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          mobileOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'
        }`}
      >
        {/* 1. Fixed Top Branding Header */}
        <div className="shrink-0 flex items-center justify-between border-b border-[#DDDCCF]/60 px-5 py-4">
          <button
            onClick={() => navigate('Dashboard')}
            className="flex items-center gap-2.5 text-left focus:outline-none group"
          >
            <span className="mango-mark">
              <span />
            </span>
            <div>
              <span className="font-display text-lg font-extrabold tracking-[-.04em] text-[#24332B] group-hover:text-[#176B50] transition-colors">
                MANGOS
              </span>
              <span className="block text-[10px] font-bold uppercase tracking-[.18em] text-[#5F7563]">
                Career Prep
              </span>
            </div>
          </button>

          <button
            onClick={() => setMobileOpen(false)}
            className="rounded-lg p-1.5 text-[#68766C] hover:bg-[#FAF8F2] hover:text-[#24332B] lg:hidden"
            aria-label="Close navigation sidebar"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* 2. Independently Scrollable Navigation Area */}
        <div className="flex-1 min-h-0 overflow-y-auto px-3.5 py-4 space-y-6 sidebar-scrollbar">
          {/* Section: Workspace */}
          <div>
            <div className="px-3 text-[10px] font-bold uppercase tracking-[.18em] text-[#5F7563]">
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
                        ? 'bg-[#176B50] text-white shadow-sm font-bold'
                        : 'text-[#68766C] hover:bg-[#FAF8F2] hover:text-[#24332B]'
                    }`}
                  >
                    <Icon className={`h-[18px] w-[18px] shrink-0 ${isActive ? 'text-white' : 'text-[#5F7563]'}`} />
                    <span className="truncate">{label}</span>
                    {badge && (
                      <span
                        className={`ml-auto rounded-full px-2 py-0.5 text-[9px] font-black uppercase tracking-wider shrink-0 ${
                          isActive ? 'bg-white/20 text-white' : badgeColor || 'bg-[#DCE6D8] text-[#176B50]'
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
            <div className="px-3 text-[10px] font-bold uppercase tracking-[.18em] text-[#5F7563]">
              Your Space
            </div>
            <nav className="mt-2.5 space-y-1">
              <button
                onClick={() => navigate('Bookmarks')}
                className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-semibold transition-all ${
                  page === 'Bookmarks'
                    ? 'bg-[#176B50] text-white shadow-sm font-bold'
                    : 'text-[#68766C] hover:bg-[#FAF8F2] hover:text-[#24332B]'
                }`}
              >
                <Bookmark className={`h-[18px] w-[18px] shrink-0 ${page === 'Bookmarks' ? 'text-white' : 'text-[#5F7563]'}`} />
                <span>Bookmarks</span>
                {totalBookmarks > 0 && (
                  <span
                    className={`ml-auto rounded-full px-2 py-0.5 text-[10px] font-bold ${
                      page === 'Bookmarks' ? 'bg-white/20 text-white' : 'bg-[#DCE6D8] text-[#176B50]'
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
                    ? 'bg-[#176B50] text-white shadow-sm font-bold'
                    : 'text-[#68766C] hover:bg-[#FAF8F2] hover:text-[#24332B]'
                }`}
              >
                <Settings2 className={`h-[18px] w-[18px] shrink-0 ${page === 'Profile' ? 'text-white' : 'text-[#5F7563]'}`} />
                <span>Profile & Settings</span>
              </button>
            </nav>
          </div>

          {/* Learning Pro Tip Card in scroll area */}
          <div className="rounded-2xl border border-[#DDDCCF] bg-[#FAF8F2] p-3.5 text-xs text-[#5F7563]">
            <div className="flex items-center gap-1.5 font-bold text-[#104C3A]">
              <Sparkles className="h-3.5 w-3.5 text-[#176B50]" />
              Monthly Library Update
            </div>
            <p className="mt-1 text-[11px] leading-relaxed text-[#68766C]">
              New verified free resources added every 30 days. Look for the <span className="font-bold text-[#176B50]">NEW</span> badge in Learning Resources.
            </p>
          </div>
        </div>

        {/* 3. Anchored Bottom User & Plan Area */}
        <div className="shrink-0 border-t border-[#DDDCCF] bg-[#FAF8F2] p-3.5">
          <div
            onClick={() => navigate('Profile')}
            className="flex items-center gap-3 rounded-xl p-2 transition hover:bg-white cursor-pointer group"
          >
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#176B50] text-xs font-black text-white shadow-sm">
              JD
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-bold text-[#24332B] group-hover:text-[#176B50] transition-colors">
                Jordan Davis
              </p>
              <p className="text-[11px] text-[#5F7563]">Student Plan</p>
            </div>
            <ChevronRight className="h-4 w-4 text-[#68766C] group-hover:text-[#24332B]" />
          </div>
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
