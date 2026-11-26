import type { WorkspaceState } from '../types/user';
import { INITIAL_RESOURCES } from '../data/initialResources';

const STORAGE_VERSION = 1;
const GUEST_KEY = 'mangos_workspace_guest';
const USER_KEY_PREFIX = 'mangos_workspace_user_';
const DEMO_KEY = 'mangos_workspace_demo';
const LEGACY_KEY = 'mangos-workspace-state';

interface VersionedStorage<T> {
  version: number;
  updatedAt: string;
  data: T;
}

/**
 * Creates a clean, empty, neutral state for new users/guests.
 * Free of demo contamination (no Jordan Davis, 0 solved, 0 streak, no fake milestones).
 */
export function createNeutralState(): WorkspaceState {
  return {
    solved: [],
    attempted: [],
    bookmarks: [],
    resourceBookmarks: [],
    customResources: INITIAL_RESOURCES,
    completedMilestones: [],
    streak: 0,
    profile: {
      fullName: '',
      university: '',
      targetRole: '',
      company: 'Meta',
      preferredLanguage: 'Python',
      experienceLevel: 'Beginner / Student',
    },
  };
}

/**
 * Isolated demo state for optional "Demo Mode", completely segregated from real user accounts.
 */
export const DEMO_WORKSPACE_STATE: WorkspaceState = {
  solved: [1],
  attempted: [2],
  bookmarks: [2, 5],
  resourceBookmarks: ['res-freecodecamp', 'res-cs50', 'res-system-design-primer'],
  customResources: INITIAL_RESOURCES,
  completedMilestones: ['Programming fundamentals'],
  streak: 12,
  profile: {
    fullName: 'Jordan Davis (Demo)',
    university: 'University of Michigan',
    targetRole: 'Software Engineer',
    company: 'Meta',
    preferredLanguage: 'Python',
    experienceLevel: 'Beginner / Student',
  },
};

/**
 * Checks whether a given state contains genuine user activity vs clean/demo.
 */
export function isGenuineGuestData(state: WorkspaceState | null | undefined): boolean {
  if (!state) return false;
  
  // Ignore demo accounts
  if (state.profile?.fullName?.includes('Jordan Davis')) return false;

  const hasActivity =
    (state.solved && state.solved.length > 0) ||
    (state.attempted && state.attempted.length > 0) ||
    (state.bookmarks && state.bookmarks.length > 0) ||
    (state.resourceBookmarks && state.resourceBookmarks.length > 0) ||
    (state.completedMilestones && state.completedMilestones.length > 0) ||
    Boolean(state.profile?.fullName?.trim()) ||
    Boolean(state.profile?.university?.trim()) ||
    Boolean(state.profile?.targetRole?.trim() && state.profile?.targetRole !== 'Software Engineer');

  return hasActivity;
}

export const storageService = {
  /**
   * Safe migration from legacy shared localStorage key
   */
  migrateLegacyStorage(): void {
    try {
      const legacyRaw = localStorage.getItem(LEGACY_KEY);
      if (!legacyRaw) return;

      const parsed = JSON.parse(legacyRaw) as Partial<WorkspaceState>;
      
      // If legacy state is Jordan Davis demo data, discard it
      if (parsed.profile?.fullName?.includes('Jordan Davis')) {
        localStorage.removeItem(LEGACY_KEY);
        return;
      }

      // If guest state doesn't exist yet, save genuine legacy progress into guest storage
      if (!localStorage.getItem(GUEST_KEY) && isGenuineGuestData(parsed as WorkspaceState)) {
        this.saveGuestState({
          ...createNeutralState(),
          ...parsed,
          profile: {
            ...createNeutralState().profile,
            ...(parsed.profile || {}),
          },
        });
      }

      // Clean up legacy key to prevent future cross-account pollution
      localStorage.removeItem(LEGACY_KEY);
    } catch {
      localStorage.removeItem(LEGACY_KEY);
    }
  },

  /**
   * Load state for a specific user ID or guest
   */
  loadState(userId?: string | null, isDemo: boolean = false): WorkspaceState {
    if (isDemo) {
      return this.loadDemoState();
    }

    const key = userId ? `${USER_KEY_PREFIX}${userId}` : GUEST_KEY;

    try {
      const raw = localStorage.getItem(key);
      if (!raw) {
        return createNeutralState();
      }

      const parsed = JSON.parse(raw) as VersionedStorage<WorkspaceState> | WorkspaceState;
      
      // Handle versioned envelope vs direct object
      const stateData: WorkspaceState =
        'version' in parsed && 'data' in parsed
          ? (parsed as VersionedStorage<WorkspaceState>).data
          : (parsed as WorkspaceState);

      // Validate & sanitize structure
      return {
        solved: Array.isArray(stateData.solved) ? stateData.solved : [],
        attempted: Array.isArray(stateData.attempted) ? stateData.attempted : [],
        bookmarks: Array.isArray(stateData.bookmarks) ? stateData.bookmarks : [],
        resourceBookmarks: Array.isArray(stateData.resourceBookmarks) ? stateData.resourceBookmarks : [],
        customResources:
          Array.isArray(stateData.customResources) && stateData.customResources.length > 0
            ? stateData.customResources
            : INITIAL_RESOURCES,
        completedMilestones: Array.isArray(stateData.completedMilestones) ? stateData.completedMilestones : [],
        streak: typeof stateData.streak === 'number' ? stateData.streak : 0,
        profile: {
          fullName: stateData.profile?.fullName || '',
          university: stateData.profile?.university || '',
          targetRole: stateData.profile?.targetRole || '',
          company: stateData.profile?.company || 'Meta',
          preferredLanguage: stateData.profile?.preferredLanguage || 'Python',
          experienceLevel: stateData.profile?.experienceLevel || 'Beginner / Student',
        },
      };
    } catch {
      return createNeutralState();
    }
  },

  /**
   * Save user-scoped workspace state
   */
  saveUserState(userId: string, state: WorkspaceState): void {
    if (!userId) return;
    try {
      const envelope: VersionedStorage<WorkspaceState> = {
        version: STORAGE_VERSION,
        updatedAt: new Date().toISOString(),
        data: state,
      };
      localStorage.setItem(`${USER_KEY_PREFIX}${userId}`, JSON.stringify(envelope));
    } catch (err) {
      console.warn('Failed to save user storage:', err);
    }
  },

  /**
   * Save guest workspace state
   */
  saveGuestState(state: WorkspaceState): void {
    try {
      const envelope: VersionedStorage<WorkspaceState> = {
        version: STORAGE_VERSION,
        updatedAt: new Date().toISOString(),
        data: state,
      };
      localStorage.setItem(GUEST_KEY, JSON.stringify(envelope));
    } catch (err) {
      console.warn('Failed to save guest storage:', err);
    }
  },

  /**
   * Get raw guest state if present
   */
  getGuestState(): WorkspaceState | null {
    try {
      const raw = localStorage.getItem(GUEST_KEY);
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      return 'data' in parsed ? parsed.data : parsed;
    } catch {
      return null;
    }
  },

  /**
   * Clear guest state after migration or reset
   */
  clearGuestState(): void {
    try {
      localStorage.removeItem(GUEST_KEY);
    } catch {
      // ignore
    }
  },

  /**
   * Demo mode operations
   */
  loadDemoState(): WorkspaceState {
    try {
      const raw = localStorage.getItem(DEMO_KEY);
      if (!raw) return DEMO_WORKSPACE_STATE;
      const parsed = JSON.parse(raw);
      return 'data' in parsed ? parsed.data : parsed;
    } catch {
      return DEMO_WORKSPACE_STATE;
    }
  },

  saveDemoState(state: WorkspaceState): void {
    try {
      const envelope: VersionedStorage<WorkspaceState> = {
        version: STORAGE_VERSION,
        updatedAt: new Date().toISOString(),
        data: state,
      };
      localStorage.setItem(DEMO_KEY, JSON.stringify(envelope));
    } catch {
      // ignore
    }
  },

  clearDemoState(): void {
    try {
      localStorage.removeItem(DEMO_KEY);
    } catch {
      // ignore
    }
  },
};
