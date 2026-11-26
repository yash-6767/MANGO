import React from 'react';
import { Menu, Sun, Moon, Bell, LogIn, Cloud, CloudOff, RefreshCw, AlertCircle } from 'lucide-react';
import type { Page } from '../Sidebar';
import type { User } from '@supabase/supabase-js';

export type SyncStatus = 'synced' | 'syncing' | 'offline' | 'error';

interface TopbarProps {
  page: Page;
  onMenu: () => void;
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
  currentUser: User | null;
  userName: string;
  syncStatus: SyncStatus;
  onRetrySync?: () => void;
  onOpenAuth: () => void;
  onNavigateProfile: () => void;
}

export const Topbar: React.FC<TopbarProps> = ({
  page,
  onMenu,
  theme,
  onToggleTheme,
  currentUser,
  userName,
  syncStatus,
  onRetrySync,
  onOpenAuth,
  onNavigateProfile,
}) => {
  const getInitials = (): string => {
    if (userName.trim()) {
      const parts = userName.trim().split(' ').filter(Boolean);
      if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
      if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
    }
    if (currentUser?.email) {
      return currentUser.email.substring(0, 2).toUpperCase();
    }
    return 'G';
  };

  const initials = getInitials();

  return (
    <header className="sticky top-0 z-20 flex h-[70px] shrink-0 items-center justify-between border-b border-[var(--border-color)] bg-[var(--bg-secondary)]/95 px-4 backdrop-blur-xl sm:px-8 lg:px-10 text-[var(--text-main)]">
      <div className="flex items-center gap-3">
        <button
          onClick={onMenu}
          className="rounded-xl border border-[var(--border-color)] bg-[var(--bg-card)] p-2 text-[var(--sage-dark)] shadow-sm lg:hidden hover:bg-[var(--bg-secondary)]"
          aria-label="Open sidebar menu"
        >
          <Menu className="h-5 w-5" />
        </button>
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[.18em] text-[var(--sage-dark)]">
            {currentUser ? 'Student Workspace' : 'Guest Mode (Local Only)'}
          </p>
          <h1 className="font-display mt-0.5 text-lg font-extrabold tracking-tight text-[var(--text-main)]">{page}</h1>
        </div>
      </div>

      <div className="flex items-center gap-2.5">
        {/* Sync Status Badge */}
        {syncStatus === 'syncing' && (
          <div className="hidden items-center gap-1.5 rounded-full border border-[var(--border-color)] bg-[var(--bg-card)] px-2.5 py-1 text-[11px] font-medium text-[var(--sage-dark)] sm:flex shadow-sm">
            <RefreshCw className="h-3 w-3 animate-spin text-[var(--emerald-primary)]" />
            <span>Syncing...</span>
          </div>
        )}
        {syncStatus === 'synced' && (
          <div
            title="All changes saved to cloud"
            className="hidden items-center gap-1.5 rounded-full border border-[var(--border-color)] bg-[var(--bg-card)] px-2.5 py-1 text-[11px] font-medium text-[var(--emerald-primary)] sm:flex shadow-sm"
          >
            <Cloud className="h-3.5 w-3.5 text-[var(--emerald-primary)]" />
            <span>Cloud Synced</span>
          </div>
        )}
        {syncStatus === 'offline' && (
          <div
            title="Operating in local mode. Sign in to sync across devices."
            className="hidden items-center gap-1.5 rounded-full border border-[var(--border-color)] bg-[var(--bg-card)] px-2.5 py-1 text-[11px] font-medium text-[var(--sage-dark)] sm:flex shadow-sm"
          >
            <CloudOff className="h-3.5 w-3.5" />
            <span>Local Storage</span>
          </div>
        )}
        {syncStatus === 'error' && (
          <button
            onClick={onRetrySync}
            title="Cloud sync encountered an issue. Click to retry."
            className="flex items-center gap-1.5 rounded-full border border-[var(--status-warning-border)] bg-[var(--status-warning-bg)] px-2.5 py-1 text-[11px] font-bold text-[var(--status-warning)] shadow-sm transition hover:opacity-90"
          >
            <AlertCircle className="h-3.5 w-3.5 text-[var(--status-warning)]" />
            <span>Sync Pending (Retry)</span>
          </button>
        )}

        <button
          onClick={onToggleTheme}
          aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
          title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
          className="rounded-xl border border-[var(--border-color)] bg-[var(--bg-card)] p-2.5 text-[var(--sage-dark)] transition hover:border-[var(--sage)] hover:text-[var(--emerald-primary)] shadow-sm"
        >
          {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </button>

        <button
          aria-label="Notifications"
          className="relative rounded-xl border border-[var(--border-color)] bg-[var(--bg-card)] p-2.5 text-[var(--sage-dark)] transition hover:border-[var(--sage)] hover:text-[var(--emerald-primary)] shadow-sm"
        >
          <Bell className="h-4 w-4" />
          <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-[var(--emerald-primary)]" />
        </button>

        <div className="hidden h-7 w-px bg-[var(--border-color)] sm:block mx-1" />

        {currentUser ? (
          <button
            onClick={onNavigateProfile}
            title={currentUser.email || 'Profile'}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-[var(--emerald-primary)] text-xs font-black text-white shadow-sm hover:opacity-90 transition active:scale-95"
          >
            {initials}
          </button>
        ) : (
          <button
            onClick={onOpenAuth}
            className="flex items-center gap-1.5 rounded-xl bg-[var(--emerald-primary)] px-3 py-1.5 text-xs font-bold text-white shadow-sm hover:bg-[var(--emerald-deep)] transition"
          >
            <LogIn className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Sign In</span>
          </button>
        )}
      </div>
    </header>
  );
};
