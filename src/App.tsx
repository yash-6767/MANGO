import { useEffect, useState, useCallback, useRef } from 'react';
import type { SetStateAction } from 'react';
import { Sparkles } from 'lucide-react';
import { Sidebar, Page } from './components/Sidebar';
import { Topbar } from './components/layout/Topbar';
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
import { INITIAL_RESOURCES } from './data/initialResources';
import { useAuth } from './hooks/useAuth';
import { useTheme } from './hooks/useTheme';
import { progressService } from './services/progressService';
import { resourceService } from './services/resourceService';
import type { WorkspaceState, QuestionStatus, UserProfile } from './types/user';
import type { LearningResource } from './types/resources';

const defaultState: WorkspaceState = {
  solved: [1],
  attempted: [2],
  bookmarks: [2, 5],
  resourceBookmarks: ['res-freecodecamp', 'res-cs50', 'res-system-design-primer'],
  customResources: INITIAL_RESOURCES,
  completedMilestones: ['Programming fundamentals'],
  streak: 12,
  profile: {
    fullName: 'Jordan Davis',
    university: 'University of Michigan',
    school: 'University of Michigan',
    targetRole: 'Software Engineer',
    role: 'Software Engineer',
    company: 'Meta',
    preferredLanguage: 'Python',
    experienceLevel: 'Beginner / Student',
  },
};

export function App() {
  const [page, setPage] = useState<Page>('Dashboard');
  const [state, setState] = useState<WorkspaceState>(defaultState);
  const [hydrated, setHydrated] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [toast, setToast] = useState('');
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [onboardingOpen, setOnboardingOpen] = useState(false);

  const { theme, toggleTheme } = useTheme();
  const { user, signOut } = useAuth();
  const stateRef = useRef(state);
  stateRef.current = state;

  const notify = useCallback((message: string) => {
    setToast(message);
    window.setTimeout(() => setToast(''), 2600);
  }, []);

  // 1. Initial State Hydration (LocalStorage + Supabase)
  useEffect(() => {
    const hydrateState = async () => {
      let workingState = defaultState;
      const local = localStorage.getItem('mangos-workspace-state');
      if (local) {
        try {
          const parsed = JSON.parse(local) as Partial<WorkspaceState>;
          workingState = {
            ...defaultState,
            ...parsed,
            profile: {
              ...defaultState.profile,
              ...(parsed.profile || {}),
            },
            customResources: parsed.customResources && parsed.customResources.length > 0
              ? parsed.customResources
              : INITIAL_RESOURCES,
            resourceBookmarks: parsed.resourceBookmarks || defaultState.resourceBookmarks,
          };
        } catch {
          workingState = defaultState;
        }
      }

      // Also check if custom learning resources were saved in service cache
      const cachedResources = resourceService.getLocalResources();
      if (cachedResources && cachedResources.length > 0) {
        workingState.customResources = cachedResources;
      }

      setState(workingState);
      setHydrated(true);
    };

    void hydrateState();
  }, []);

  // 2. User Authentication Sync & Data Migration
  useEffect(() => {
    if (!hydrated || !user) return;

    const syncUserData = async () => {
      // Safe, idempotent migration of any existing local state into normalized database tables
      await progressService.migrateGuestDataToUser(user.id, stateRef.current);

      // Load user profile from Supabase
      const remoteProfile = await progressService.getProfile(user.id);
      const remoteMilestones = await progressService.getMilestones(user.id);
      const remoteDSA = await progressService.getDSAProgress(user.id);
      const remoteBookmarks = await progressService.getBookmarks(user.id);

      setState((prev) => {
        const updatedProfile = remoteProfile
          ? {
              ...prev.profile,
              fullName: remoteProfile.fullName || prev.profile?.fullName,
              university: remoteProfile.university || prev.profile?.university,
              targetRole: remoteProfile.targetRole || prev.profile?.targetRole,
              company: remoteProfile.targetCompany || prev.profile?.company,
              preferredLanguage: remoteProfile.preferredLanguage || prev.profile?.preferredLanguage,
              experienceLevel: remoteProfile.experienceLevel || prev.profile?.experienceLevel,
            }
          : prev.profile;

        return {
          ...prev,
          profile: updatedProfile,
          completedMilestones: remoteMilestones.length > 0 ? remoteMilestones : prev.completedMilestones,
          solved: remoteDSA.solved.length > 0 ? remoteDSA.solved : prev.solved,
          attempted: remoteDSA.attempted.length > 0 ? remoteDSA.attempted : prev.attempted,
          bookmarks: remoteBookmarks.questionBookmarks.length > 0 ? remoteBookmarks.questionBookmarks : prev.bookmarks,
          resourceBookmarks: remoteBookmarks.resourceBookmarks.length > 0 ? remoteBookmarks.resourceBookmarks : prev.resourceBookmarks,
        };
      });

      // Prompt onboarding if profile is fresh or missing target role
      if (!remoteProfile?.targetRole || !remoteProfile?.fullName) {
        setOnboardingOpen(true);
      }
    };

    void syncUserData();
  }, [user, hydrated]);

  // 3. LocalStorage persistence
  useEffect(() => {
    if (!hydrated) return;
    localStorage.setItem('mangos-workspace-state', JSON.stringify(state));
    resourceService.setLocalResources(state.customResources);
  }, [state, hydrated]);

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
      await progressService.toggleBookmark(user.id, String(id), 'question', !isBookmarked);
    }
  };

  const updateQuestion = async (id: number, status: QuestionStatus) => {
    setState((curr) => ({
      ...curr,
      solved: status === 'Solved' ? [...new Set([...curr.solved, id])] : curr.solved.filter((item) => item !== id),
      attempted: status === 'Attempted' ? [...new Set([...curr.attempted, id])] : curr.attempted.filter((item) => item !== id),
    }));

    if (user) {
      await progressService.updateQuestionStatus(user.id, id, status);
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
      await progressService.toggleMilestone(user.id, milestone, !isDone);
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
      await progressService.toggleBookmark(user.id, id, 'resource', !isBookmarked);
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
      await progressService.updateProfile(user.id, {
        fullName: updated.fullName,
        university: updated.university,
        targetRole: updated.targetRole || updated.role,
        targetCompany: updated.company,
        preferredLanguage: updated.preferredLanguage,
        experienceLevel: updated.experienceLevel,
      });
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
    notify('Signed out successfully');
  };

  const userName = state.profile?.fullName || (user?.email ? user.email.split('@')[0] : 'Learner');

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
