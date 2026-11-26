import { useEffect, useState, useCallback, useRef } from 'react';
import type { SetStateAction } from 'react';
import { Sparkles } from 'lucide-react';
import { Sidebar, Page } from './components/Sidebar';
import { Topbar, SyncStatus } from './components/layout/Topbar';
import { Dashboard } from './pages/Dashboard';
import { DSA } from './pages/DSA';
import { Companies } from './pages/Companies';
import { Roadmaps } from './pages/Roadmaps';
import { MockInterview } from './pages/MockInterview';
import { SkillGap } from './pages/SkillGap';
import { ResumeAnalyzer } from './pages/ResumeAnalyzer';
import { Bookmarks } from './pages/Bookmarks';
import { Profile } from './pages/Profile';
import { LearningResourcesView } from './components/LearningResources/LearningResourcesView';
import { AuthModal } from './components/auth/AuthModal';
import { OnboardingModal } from './components/auth/OnboardingModal';
import { useAuth } from './hooks/useAuth';
import { useTheme } from './hooks/useTheme';
import { progressService } from './services/progressService';
import { resourceService } from './services/resourceService';
import { storageService, createNeutralState } from './services/storageService';
import type { WorkspaceState, QuestionStatus, UserProfile } from './types/user';
import type { LearningResource } from './types/resources';

export function App() {
  const [page, setPage] = useState<Page>('Dashboard');
  const [state, setState] = useState<WorkspaceState>(createNeutralState);
  const [hydrated, setHydrated] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [toast, setToast] = useState('');
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [onboardingOpen, setOnboardingOpen] = useState(false);
  const [syncStatus, setSyncStatus] = useState<SyncStatus>('offline');

  const { theme, toggleTheme } = useTheme();
  const { user, signOut } = useAuth();
  const stateRef = useRef(state);
  stateRef.current = state;

  const notify = useCallback((message: string) => {
    setToast(message);
    window.setTimeout(() => setToast(''), 2800);
  }, []);

  // 1. Initial State Hydration (Safe Migration + User-Scoped Storage)
  useEffect(() => {
    const hydrateState = async () => {
      // Migrate legacy shared localStorage key and eliminate any demo contamination
      storageService.migrateLegacyStorage();

      // Load user or guest state from isolated storage
      const initial = user ? storageService.loadState(user.id) : storageService.loadState(null);

      // Also hydrate learning resources from service cache
      const cachedResources = resourceService.getLocalResources();
      if (cachedResources && cachedResources.length > 0) {
        initial.customResources = cachedResources;
      }

      setState(initial);
      setSyncStatus(user ? 'syncing' : 'offline');
      setHydrated(true);
    };

    void hydrateState();
  }, [user]);

  // 2. Synchronization with Cloud Database
  const triggerSync = useCallback(async (userId: string) => {
    setSyncStatus('syncing');
    const result = await progressService.synchronizeUserData(userId);

    setState(result.state);

    if (result.syncedWithCloud) {
      setSyncStatus('synced');
    } else {
      setSyncStatus(result.error ? 'error' : 'offline');
    }

    if (result.migratedGuestData) {
      notify('Guest progress successfully saved to your cloud account!');
    } else if (result.error) {
      notify('Could not sync with cloud. Changes saved in local storage.');
    }

    // Check if user needs onboarding
    if (!result.state.profile.targetRole || !result.state.profile.fullName) {
      setOnboardingOpen(true);
    }
  }, [notify]);

  useEffect(() => {
    if (!hydrated) return;

    if (user) {
      void triggerSync(user.id);
    } else {
      // Switched to guest mode or logged out: safely reset to guest state
      const guestState = storageService.loadState(null);
      setState(guestState);
      setSyncStatus('offline');
    }
  }, [user, hydrated, triggerSync]);

  // 3. User-Scoped Local Storage Auto-Persistence
  useEffect(() => {
    if (!hydrated) return;

    if (user) {
      storageService.saveUserState(user.id, state);
    } else {
      storageService.saveGuestState(state);
    }
    resourceService.setLocalResources(state.customResources);
  }, [state, hydrated, user]);

  const navigate = (next: Page) => {
    setPage(next);
    setMobileOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // DSA Actions
  const toggleQuestionBookmark = async (id: number) => {
    const isBookmarked = state.bookmarks.includes(id);
    const next = isBookmarked ? state.bookmarks.filter((item) => item !== id) : [...state.bookmarks, id];
    setState((curr) => ({ ...curr, bookmarks: next }));
    notify(isBookmarked ? 'Question removed from bookmarks' : 'Question saved to bookmarks');

    if (user) {
      const res = await progressService.toggleBookmark(user.id, String(id), 'question', !isBookmarked);
      if (!res.success) {
        setSyncStatus('error');
        notify('Bookmark saved locally. Cloud sync pending.');
      } else {
        setSyncStatus('synced');
      }
    }
  };

  const updateQuestion = async (id: number, status: QuestionStatus) => {
    setState((curr) => ({
      ...curr,
      solved: status === 'Solved' ? [...new Set([...curr.solved, id])] : curr.solved.filter((item) => item !== id),
      attempted: status === 'Attempted' ? [...new Set([...curr.attempted, id])] : curr.attempted.filter((item) => item !== id),
      streak: status === 'Solved' ? Math.max(1, curr.streak + 1) : curr.streak,
    }));

    if (user) {
      const res = await progressService.updateQuestionStatus(user.id, id, status);
      if (!res.success) {
        setSyncStatus('error');
        notify('Problem status saved locally. Cloud sync pending.');
      } else {
        setSyncStatus('synced');
      }
    }
  };

  // Milestone Actions
  const toggleMilestone = async (milestone: string) => {
    const isDone = state.completedMilestones.includes(milestone);
    const next = isDone
      ? state.completedMilestones.filter((item) => item !== milestone)
      : [...state.completedMilestones, milestone];

    setState((curr) => ({ ...curr, completedMilestones: next }));
    notify(isDone ? 'Milestone unmarked' : 'Milestone completed! Keep the momentum going.');

    if (user) {
      const res = await progressService.toggleMilestone(user.id, milestone, !isDone);
      if (!res.success) {
        setSyncStatus('error');
        notify('Milestone saved locally. Cloud sync pending.');
      } else {
        setSyncStatus('synced');
      }
    }
  };

  // Learning Resource Actions
  const toggleResourceBookmark = async (id: string) => {
    const isBookmarked = state.resourceBookmarks.includes(id);
    const next = isBookmarked
      ? state.resourceBookmarks.filter((item) => item !== id)
      : [...state.resourceBookmarks, id];

    setState((curr) => ({ ...curr, resourceBookmarks: next }));
    notify(isBookmarked ? 'Resource removed from bookmarks' : 'Resource saved to bookmarks');

    if (user) {
      const res = await progressService.toggleBookmark(user.id, id, 'resource', !isBookmarked);
      if (!res.success) {
        setSyncStatus('error');
        notify('Bookmark saved locally. Cloud sync pending.');
      } else {
        setSyncStatus('synced');
      }
    }
  };

  const setCustomResources = (updater: SetStateAction<LearningResource[]>) => {
    setState((current) => {
      const next = typeof updater === 'function' ? updater(current.customResources) : updater;
      resourceService.setLocalResources(next);
      return { ...current, customResources: next };
    });
  };

  // Profile Actions
  const handleUpdateProfile = async (updated: Partial<WorkspaceState['profile']>) => {
    setState((curr) => ({
      ...curr,
      profile: {
        ...curr.profile,
        ...updated,
      },
    }));

    if (user) {
      const res = await progressService.updateProfile(user.id, {
        fullName: updated.fullName,
        university: updated.university,
        targetRole: updated.targetRole || updated.role,
        targetCompany: updated.company,
        preferredLanguage: updated.preferredLanguage,
        experienceLevel: updated.experienceLevel,
      });
      if (!res.success) {
        setSyncStatus('error');
        notify('Profile saved locally. Cloud sync pending.');
      } else {
        setSyncStatus('synced');
      }
    }
  };

  const handleOnboardingSave = async (profileData: Partial<UserProfile>) => {
    await handleUpdateProfile({
      fullName: profileData.fullName,
      university: profileData.university,
      school: profileData.university,
      targetRole: profileData.targetRole,
      role: profileData.targetRole,
      company: profileData.targetCompany,
      preferredLanguage: profileData.preferredLanguage,
      experienceLevel: profileData.experienceLevel,
    });
    notify('Welcome! Your personalized workspace is ready.');
  };

  const handleSignOut = async () => {
    await signOut();
    setSyncStatus('offline');
    notify('Signed out successfully');
  };

  const userName = state.profile?.fullName || (user?.email ? user.email.split('@')[0] : 'Learner');
  const isAdmin = state.profile?.role === 'admin';

  return (
    <div data-theme={theme} className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-main)] flex">
      {/* 1. Full-Height, Independently Scrollable Sidebar */}
      <Sidebar
        page={page}
        navigate={navigate}
        mobileOpen={mobileOpen}
        setMobileOpen={setMobileOpen}
        resourceBookmarkCount={state.resourceBookmarks.length}
        questionBookmarkCount={state.bookmarks.length}
        currentUser={user}
        userName={userName}
        onOpenAuth={() => setAuthModalOpen(true)}
      />

      {/* 2. Main Content Area (Scrolls Independently from Sidebar) */}
      <div className="flex-1 min-w-0 lg:pl-[260px] flex flex-col min-h-screen">
        <Topbar
          page={page}
          onMenu={() => setMobileOpen(true)}
          theme={theme}
          onToggleTheme={toggleTheme}
          currentUser={user}
          userName={userName}
          syncStatus={syncStatus}
          onRetrySync={() => user && void triggerSync(user.id)}
          onOpenAuth={() => setAuthModalOpen(true)}
          onNavigateProfile={() => navigate('Profile')}
        />

        <main className="flex-1 mx-auto w-full max-w-[1440px] px-4 pb-16 pt-6 sm:px-8 lg:px-10 lg:pt-8">
          {page === 'Dashboard' && <Dashboard state={state} navigate={navigate} notify={notify} />}
          {page === 'DSA Practice' && (
            <DSA
              state={state}
              toggleBookmark={toggleQuestionBookmark}
              updateQuestion={updateQuestion}
              notify={notify}
            />
          )}
          {page === 'Learning Resources' && (
            <LearningResourcesView
              resources={state.customResources}
              setResources={setCustomResources}
              bookmarkedIds={state.resourceBookmarks}
              toggleBookmark={toggleResourceBookmark}
              notify={notify}
              isAdmin={isAdmin}
            />
          )}
          {page === 'Companies' && <Companies navigate={navigate} notify={notify} />}
          {page === 'Roadmaps' && <Roadmaps state={state} toggleMilestone={toggleMilestone} />}
          {page === 'Mock Interview' && <MockInterview notify={notify} />}
          {page === 'Skill Gap' && <SkillGap navigate={navigate} />}
          {page === 'Resume Analyzer' && <ResumeAnalyzer notify={notify} />}
          {page === 'Bookmarks' && (
            <Bookmarks
              state={state}
              toggleQuestionBookmark={toggleQuestionBookmark}
              toggleResourceBookmark={toggleResourceBookmark}
              updateQuestion={updateQuestion}
              navigate={navigate}
            />
          )}
          {page === 'Profile' && (
            <Profile
              state={state}
              onUpdateProfile={handleUpdateProfile}
              currentUser={user}
              onOpenAuth={() => setAuthModalOpen(true)}
              onSignOut={handleSignOut}
              notify={notify}
            />
          )}
        </main>
      </div>

      {/* Modals */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        onSuccess={() => notify('Authentication successful!')}
      />

      <OnboardingModal
        isOpen={onboardingOpen}
        onClose={() => setOnboardingOpen(false)}
        onSave={handleOnboardingSave}
        initialProfile={{
          fullName: state.profile?.fullName,
          university: state.profile?.university,
          targetRole: state.profile?.targetRole,
          targetCompany: state.profile?.company,
        }}
      />

      {/* Toast Notification */}
      {toast && (
        <div className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-2xl border border-[var(--sage)] bg-[var(--emerald-deep)] px-5 py-3 text-sm font-bold text-white shadow-2xl flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-[var(--sage-soft)]" />
          <span>{toast}</span>
        </div>
      )}
    </div>
  );
}

export default App;
