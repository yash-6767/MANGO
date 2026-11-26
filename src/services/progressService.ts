import { supabase, isSupabaseConfigured } from '../lib/supabase';
import type { CompanyName, UserProfile, QuestionStatus, WorkspaceState } from '../types/user';

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
        targetRole: data.target_role || 'Software Engineer',
        targetCompany: (data.target_company as CompanyName) || 'Meta',
        preferredLanguage: data.preferred_language || 'Python',
        experienceLevel: data.experience_level || 'Beginner / Student',
        preferences: data.preferences || {},
      };
    } catch {
      return null;
    }
  },

  /**
   * Update or upsert user profile
   */
  async updateProfile(userId: string, profile: Partial<UserProfile>): Promise<boolean> {
    if (!isSupabaseConfigured || !userId) return false;
    try {
      const { error } = await supabase.from('profiles').upsert({
        id: userId,
        full_name: profile.fullName,
        university: profile.university,
        target_role: profile.targetRole,
        target_company: profile.targetCompany,
        preferred_language: profile.preferredLanguage,
        experience_level: profile.experienceLevel,
        preferences: profile.preferences,
        updated_at: new Date().toISOString(),
      });
      return !error;
    } catch {
      return false;
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
  async toggleMilestone(userId: string, milestoneId: string, completed: boolean): Promise<boolean> {
    if (!isSupabaseConfigured || !userId) return false;
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
        return !error;
      } else {
        const { error } = await supabase
          .from('user_progress')
          .delete()
          .eq('user_id', userId)
          .eq('milestone_id', milestoneId);
        return !error;
      }
    } catch {
      return false;
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
  async updateQuestionStatus(userId: string, questionId: number, status: QuestionStatus): Promise<boolean> {
    if (!isSupabaseConfigured || !userId) return false;
    try {
      if (status === 'Not started') {
        const { error } = await supabase
          .from('dsa_progress')
          .delete()
          .eq('user_id', userId)
          .eq('question_id', questionId);
        return !error;
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
        return !error;
      }
    } catch {
      return false;
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
  async toggleBookmark(userId: string, itemId: string, itemType: 'question' | 'resource', add: boolean): Promise<boolean> {
    if (!isSupabaseConfigured || !userId) return false;
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
        return !error;
      } else {
        const { error } = await supabase
          .from('user_bookmarks')
          .delete()
          .eq('user_id', userId)
          .eq('item_id', itemId)
          .eq('item_type', itemType);
        return !error;
      }
    } catch {
      return false;
    }
  },

  /**
   * Safe, Idempotent Data Migration:
   * Migrates local/guest state to normalized tables when user signs in.
   */
  async migrateGuestDataToUser(userId: string, localState: WorkspaceState): Promise<void> {
    if (!isSupabaseConfigured || !userId || !localState) return;

    try {
      // 1. Migrate profile if target company/role provided and not placeholder
      if (localState.profile?.targetRole || localState.profile?.company) {
        await supabase.from('profiles').upsert({
          id: userId,
          full_name: localState.profile.fullName || undefined,
          university: localState.profile.university || undefined,
          target_role: localState.profile.targetRole || 'Software Engineer',
          target_company: localState.profile.company || 'Meta',
          preferred_language: localState.profile.preferredLanguage || 'Python',
          experience_level: localState.profile.experienceLevel || 'Beginner / Student',
          updated_at: new Date().toISOString(),
        });
      }

      // 2. Migrate milestones
      if (localState.completedMilestones && localState.completedMilestones.length > 0) {
        const milestoneRows = localState.completedMilestones.map((milestoneId) => ({
          user_id: userId,
          milestone_id: milestoneId,
          completed: true,
          completed_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }));
        await supabase.from('user_progress').upsert(milestoneRows, { onConflict: 'user_id,milestone_id' });
      }

      // 3. Migrate solved & attempted DSA questions
      const dsaRows: Array<{ user_id: string; question_id: number; status: 'Solved' | 'Attempted'; updated_at: string }> = [];
      localState.solved?.forEach((qId) => {
        dsaRows.push({ user_id: userId, question_id: qId, status: 'Solved', updated_at: new Date().toISOString() });
      });
      localState.attempted?.forEach((qId) => {
        if (!localState.solved?.includes(qId)) {
          dsaRows.push({ user_id: userId, question_id: qId, status: 'Attempted', updated_at: new Date().toISOString() });
        }
      });
      if (dsaRows.length > 0) {
        await supabase.from('dsa_progress').upsert(dsaRows, { onConflict: 'user_id,question_id' });
      }

      // 4. Migrate bookmarks
      const bookmarkRows: Array<{ user_id: string; item_id: string; item_type: 'question' | 'resource'; created_at: string }> = [];
      localState.bookmarks?.forEach((qId) => {
        bookmarkRows.push({ user_id: userId, item_id: String(qId), item_type: 'question', created_at: new Date().toISOString() });
      });
      localState.resourceBookmarks?.forEach((rId) => {
        bookmarkRows.push({ user_id: userId, item_id: rId, item_type: 'resource', created_at: new Date().toISOString() });
      });
      if (bookmarkRows.length > 0) {
        await supabase.from('user_bookmarks').upsert(bookmarkRows, { onConflict: 'user_id,item_id,item_type' });
      }

      // 5. Backwards compatibility: keep mangos_workspace_state updated for the user
      await supabase.from('mangos_workspace_state').upsert(
        {
          learner_key: userId,
          state: localState,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'learner_key' }
      );
    } catch (err) {
      console.warn('Idempotent migration notice:', err);
    }
  },
};
