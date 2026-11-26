import { supabase, isSupabaseConfigured } from '../lib/supabase';
import type { CompanyName, UserProfile, QuestionStatus, WorkspaceState } from '../types/user';
import { storageService, isGenuineGuestData } from './storageService';
import { INITIAL_RESOURCES } from '../data/initialResources';

export interface SyncResult {
  state: WorkspaceState;
  syncedWithCloud: boolean;
  migratedGuestData: boolean;
  error?: string;
}

export const progressService = {
  /**
   * Fetch profile from public.profiles
   */
  async getProfile(userId: string): Promise<UserProfile | null> {
    if (!isSupabaseConfigured || !userId) return null;
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (error || !data) return null;
      return {
        fullName: data.full_name || '',
        university: data.university || '',
        targetRole: data.target_role || '',
        targetCompany: (data.target_company as CompanyName) || 'Meta',
        preferredLanguage: data.preferred_language || 'Python',
        experienceLevel: data.experience_level || 'Beginner / Student',
        role: (data.role as 'student' | 'mentor' | 'admin') || 'student',
        preferences: data.preferences || {},
      };
    } catch {
      return null;
    }
  },

  /**
   * Update or upsert user profile
   */
  async updateProfile(userId: string, profile: Partial<UserProfile>): Promise<{ success: boolean; error?: string }> {
    if (!isSupabaseConfigured || !userId) {
      return { success: true }; // offline / local save handled by caller
    }
    try {
      const payload: Record<string, unknown> = {
        id: userId,
        updated_at: new Date().toISOString(),
      };
      if (profile.fullName !== undefined) payload.full_name = profile.fullName;
      if (profile.university !== undefined) payload.university = profile.university;
      if (profile.targetRole !== undefined) payload.target_role = profile.targetRole;
      if (profile.targetCompany !== undefined) payload.target_company = profile.targetCompany;
      if (profile.preferredLanguage !== undefined) payload.preferred_language = profile.preferredLanguage;
      if (profile.experienceLevel !== undefined) payload.experience_level = profile.experienceLevel;
      if (profile.preferences !== undefined) payload.preferences = profile.preferences;

      const { error } = await supabase.from('profiles').upsert(payload);
      if (error) return { success: false, error: error.message };
      return { success: true };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to update profile';
      return { success: false, error: msg };
    }
  },

  /**
   * Fetch user completed milestones
   */
  async getMilestones(userId: string): Promise<string[]> {
    if (!isSupabaseConfigured || !userId) return [];
    try {
      const { data, error } = await supabase
        .from('user_progress')
        .select('milestone_id')
        .eq('user_id', userId)
        .eq('completed', true);

      if (error || !data) return [];
      return data.map((d) => d.milestone_id);
    } catch {
      return [];
    }
  },

  /**
   * Toggle a milestone
   */
  async toggleMilestone(userId: string, milestoneId: string, completed: boolean): Promise<{ success: boolean; error?: string }> {
    if (!isSupabaseConfigured || !userId) return { success: true };
    try {
      if (completed) {
        const { error } = await supabase.from('user_progress').upsert(
          {
            user_id: userId,
            milestone_id: milestoneId,
            completed: true,
            completed_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
          { onConflict: 'user_id,milestone_id' }
        );
        if (error) return { success: false, error: error.message };
        return { success: true };
      } else {
        const { error } = await supabase
          .from('user_progress')
          .delete()
          .eq('user_id', userId)
          .eq('milestone_id', milestoneId);
        if (error) return { success: false, error: error.message };
        return { success: true };
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to update milestone';
      return { success: false, error: msg };
    }
  },

  /**
   * Fetch user DSA question progress
   */
  async getDSAProgress(userId: string): Promise<{ solved: number[]; attempted: number[] }> {
    if (!isSupabaseConfigured || !userId) return { solved: [], attempted: [] };
    try {
      const { data, error } = await supabase
        .from('dsa_progress')
        .select('question_id, status')
        .eq('user_id', userId);

      if (error || !data) return { solved: [], attempted: [] };
      const solved: number[] = [];
      const attempted: number[] = [];
      data.forEach((row) => {
        if (row.status === 'Solved') solved.push(row.question_id);
        else if (row.status === 'Attempted') attempted.push(row.question_id);
      });
      return { solved, attempted };
    } catch {
      return { solved: [], attempted: [] };
    }
  },

  /**
   * Update single question status
   */
  async updateQuestionStatus(
    userId: string,
    questionId: number,
    status: QuestionStatus
  ): Promise<{ success: boolean; error?: string }> {
    if (!isSupabaseConfigured || !userId) return { success: true };
    try {
      if (status === 'Not started') {
        const { error } = await supabase
          .from('dsa_progress')
          .delete()
          .eq('user_id', userId)
          .eq('question_id', questionId);
        if (error) return { success: false, error: error.message };
        return { success: true };
      } else {
        const { error } = await supabase.from('dsa_progress').upsert(
          {
            user_id: userId,
            question_id: questionId,
            status,
            last_attempted_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
          { onConflict: 'user_id,question_id' }
        );
        if (error) return { success: false, error: error.message };
        return { success: true };
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to update problem status';
      return { success: false, error: msg };
    }
  },

  /**
   * Fetch all user bookmarks (questions and resources)
   */
  async getBookmarks(userId: string): Promise<{ questionBookmarks: number[]; resourceBookmarks: string[] }> {
    if (!isSupabaseConfigured || !userId) return { questionBookmarks: [], resourceBookmarks: [] };
    try {
      const { data, error } = await supabase
        .from('user_bookmarks')
        .select('item_id, item_type')
        .eq('user_id', userId);

      if (error || !data) return { questionBookmarks: [], resourceBookmarks: [] };
      const questionBookmarks: number[] = [];
      const resourceBookmarks: string[] = [];

      data.forEach((row) => {
        if (row.item_type === 'question') {
          const num = parseInt(row.item_id, 10);
          if (!isNaN(num)) questionBookmarks.push(num);
        } else if (row.item_type === 'resource') {
          resourceBookmarks.push(row.item_id);
        }
      });

      return { questionBookmarks, resourceBookmarks };
    } catch {
      return { questionBookmarks: [], resourceBookmarks: [] };
    }
  },

  /**
   * Toggle bookmark
   */
  async toggleBookmark(
    userId: string,
    itemId: string,
    itemType: 'question' | 'resource',
    add: boolean
  ): Promise<{ success: boolean; error?: string }> {
    if (!isSupabaseConfigured || !userId) return { success: true };
    try {
      if (add) {
        const { error } = await supabase.from('user_bookmarks').upsert(
          {
            user_id: userId,
            item_id: itemId,
            item_type: itemType,
            created_at: new Date().toISOString(),
          },
          { onConflict: 'user_id,item_id,item_type' }
        );
        if (error) return { success: false, error: error.message };
        return { success: true };
      } else {
        const { error } = await supabase
          .from('user_bookmarks')
          .delete()
          .eq('user_id', userId)
          .eq('item_id', itemId)
          .eq('item_type', itemType);
        if (error) return { success: false, error: error.message };
        return { success: true };
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to update bookmark';
      return { success: false, error: msg };
    }
  },

  /**
   * Robust Synchronization & Migration Flow:
   * 1. Detect authenticated user.
   * 2. Load remote database data first (Source of Truth).
   * 3. Inspect genuine guest data (if any).
   * 4. Perform non-destructive union merge.
   * 5. Migrate only valid guest changes to remote.
   * 6. Update user-scoped local cache.
   * 7. Clear guest state to prevent double-migration.
   */
  async synchronizeUserData(userId: string): Promise<SyncResult> {
    if (!userId) {
      const guest = storageService.loadState();
      return { state: guest, syncedWithCloud: false, migratedGuestData: false };
    }

    // If Supabase is not configured, fall back directly to user-scoped local storage
    if (!isSupabaseConfigured) {
      const cached = storageService.loadState(userId);
      return { state: cached, syncedWithCloud: false, migratedGuestData: false };
    }

    try {
      // Step 1: Load remote data FIRST
      const [remoteProfile, remoteMilestones, remoteDSA, remoteBookmarks] = await Promise.all([
        this.getProfile(userId),
        this.getMilestones(userId),
        this.getDSAProgress(userId),
        this.getBookmarks(userId),
      ]);

      // Step 2: Check for genuine guest data in local storage
      const guestState = storageService.getGuestState();
      const hasGenuineGuest = isGenuineGuestData(guestState);
      let didMigrateGuest = false;

      // Step 3: Perform union-based conflict resolution
      let finalSolved = remoteDSA.solved;
      let finalAttempted = remoteDSA.attempted;
      let finalMilestones = remoteMilestones;
      let finalQuestionBookmarks = remoteBookmarks.questionBookmarks;
      let finalResourceBookmarks = remoteBookmarks.resourceBookmarks;

      // If genuine guest activity exists, merge it into remote data
      if (hasGenuineGuest && guestState) {
        // A. Solved questions: Union
        const newSolvedFromGuest = guestState.solved.filter((q) => !remoteDSA.solved.includes(q));
        if (newSolvedFromGuest.length > 0) {
          const insertRows = newSolvedFromGuest.map((qId) => ({
            user_id: userId,
            question_id: qId,
            status: 'Solved' as const,
            last_attempted_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          }));
          await supabase.from('dsa_progress').upsert(insertRows, { onConflict: 'user_id,question_id' });
          finalSolved = Array.from(new Set([...finalSolved, ...newSolvedFromGuest]));
        }

        // B. Attempted questions: Union (excluding solved)
        const newAttemptedFromGuest = guestState.attempted.filter(
          (q) => !remoteDSA.attempted.includes(q) && !finalSolved.includes(q)
        );
        if (newAttemptedFromGuest.length > 0) {
          const insertRows = newAttemptedFromGuest.map((qId) => ({
            user_id: userId,
            question_id: qId,
            status: 'Attempted' as const,
            last_attempted_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          }));
          await supabase.from('dsa_progress').upsert(insertRows, { onConflict: 'user_id,question_id' });
          finalAttempted = Array.from(new Set([...finalAttempted, ...newAttemptedFromGuest]));
        }

        // C. Milestones: Union
        const newMilestonesFromGuest = guestState.completedMilestones.filter(
          (m) => !remoteMilestones.includes(m)
        );
        if (newMilestonesFromGuest.length > 0) {
          const milestoneRows = newMilestonesFromGuest.map((m) => ({
            user_id: userId,
            milestone_id: m,
            completed: true,
            completed_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          }));
          await supabase.from('user_progress').upsert(milestoneRows, { onConflict: 'user_id,milestone_id' });
          finalMilestones = Array.from(new Set([...finalMilestones, ...newMilestonesFromGuest]));
        }

        // D. Question Bookmarks: Union
        const newQBFromGuest = guestState.bookmarks.filter(
          (b) => !remoteBookmarks.questionBookmarks.includes(b)
        );
        if (newQBFromGuest.length > 0) {
          const qbRows = newQBFromGuest.map((b) => ({
            user_id: userId,
            item_id: String(b),
            item_type: 'question' as const,
            created_at: new Date().toISOString(),
          }));
          await supabase.from('user_bookmarks').upsert(qbRows, { onConflict: 'user_id,item_id,item_type' });
          finalQuestionBookmarks = Array.from(new Set([...finalQuestionBookmarks, ...newQBFromGuest]));
        }

        // E. Resource Bookmarks: Union
        const newRBFromGuest = guestState.resourceBookmarks.filter(
          (b) => !remoteBookmarks.resourceBookmarks.includes(b)
        );
        if (newRBFromGuest.length > 0) {
          const rbRows = newRBFromGuest.map((b) => ({
            user_id: userId,
            item_id: b,
            item_type: 'resource' as const,
            created_at: new Date().toISOString(),
          }));
          await supabase.from('user_bookmarks').upsert(rbRows, { onConflict: 'user_id,item_id,item_type' });
          finalResourceBookmarks = Array.from(new Set([...finalResourceBookmarks, ...newRBFromGuest]));
        }

        // F. Profile merge: if remote profile is missing info and guest provided it, save to remote
        if (!remoteProfile?.targetRole && guestState.profile?.targetRole) {
          await this.updateProfile(userId, {
            targetRole: guestState.profile.targetRole,
            targetCompany: guestState.profile.company,
            preferredLanguage: guestState.profile.preferredLanguage,
            experienceLevel: guestState.profile.experienceLevel,
          });
        }

        // Clear guest state now that it has been safely migrated
        storageService.clearGuestState();
        didMigrateGuest = true;
      }

      // Step 4: Assemble finalized state
      // If user has existing local cache for this user ID, merge any custom resources
      const existingUserLocal = storageService.loadState(userId);

      const mergedState: WorkspaceState = {
        solved: finalSolved,
        attempted: finalAttempted,
        bookmarks: finalQuestionBookmarks,
        resourceBookmarks: finalResourceBookmarks,
        completedMilestones: finalMilestones,
        customResources:
          existingUserLocal.customResources.length > 0
            ? existingUserLocal.customResources
            : INITIAL_RESOURCES,
        streak: finalSolved.length > 0 ? Math.max(1, existingUserLocal.streak) : 0,
        profile: {
          fullName: remoteProfile?.fullName || existingUserLocal.profile?.fullName || '',
          university: remoteProfile?.university || existingUserLocal.profile?.university || '',
          targetRole: remoteProfile?.targetRole || existingUserLocal.profile?.targetRole || '',
          company: remoteProfile?.targetCompany || existingUserLocal.profile?.company || 'Meta',
          preferredLanguage: remoteProfile?.preferredLanguage || existingUserLocal.profile?.preferredLanguage || 'Python',
          experienceLevel: remoteProfile?.experienceLevel || existingUserLocal.profile?.experienceLevel || 'Beginner / Student',
          role: remoteProfile?.role || 'student',
        },
      };

      // Step 5: Persist to user-scoped localStorage
      storageService.saveUserState(userId, mergedState);

      return {
        state: mergedState,
        syncedWithCloud: true,
        migratedGuestData: didMigrateGuest,
      };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Database sync failed';
      console.warn('Sync notice:', msg);
      // Fallback to local user cache
      const cached = storageService.loadState(userId);
      return {
        state: cached,
        syncedWithCloud: false,
        migratedGuestData: false,
        error: msg,
      };
    }
  },
};
