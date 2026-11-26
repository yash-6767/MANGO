import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { LearningResource } from '../types/resources';
import { INITIAL_RESOURCES } from '../data/initialResources';

const LOCAL_RESOURCES_KEY = 'mangos_learning_resources_catalog';

export interface ResourceOperationResult {
  success: boolean;
  error?: string;
  isCloudSynced?: boolean;
}

export const resourceService = {
  /**
   * Fetch all learning resources from Supabase with fallback to INITIAL_RESOURCES + localStorage
   */
  async getResources(): Promise<LearningResource[]> {
    if (!isSupabaseConfigured) {
      return this.getLocalResources();
    }
    try {
      const { data, error } = await supabase
        .from('learning_resources')
        .select('*')
        .order('date_added', { ascending: false });

      if (error || !data || data.length === 0) {
        return this.getLocalResources();
      }

      const remoteList: LearningResource[] = data.map((row) => ({
        id: row.id,
        name: row.name,
        description: row.description,
        url: row.official_url,
        provider: row.provider,
        category: row.category,
        tags: row.tags || [],
        difficulty: row.difficulty,
        free_status: row.free_status,
        paid_features: row.paid_features,
        date_added: row.date_added,
        last_verified: row.last_verified,
        status: row.status,
        learning_path: row.learning_path,
        is_featured: row.is_featured,
      }));

      // Cache locally for offline resilience
      this.setLocalResources(remoteList);
      return remoteList;
    } catch {
      return this.getLocalResources();
    }
  },

  getLocalResources(): LearningResource[] {
    const saved = localStorage.getItem(LOCAL_RESOURCES_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch {
        // fallback
      }
    }
    return INITIAL_RESOURCES;
  },

  setLocalResources(resources: LearningResource[]): void {
    try {
      localStorage.setItem(LOCAL_RESOURCES_KEY, JSON.stringify(resources));
    } catch (err) {
      console.warn('Failed to cache resources locally:', err);
    }
  },

  /**
   * Upsert single resource.
   * If caller is admin and Supabase is configured, saves to shared cloud catalogue.
   * Otherwise saves to local catalog only.
   */
  async saveResource(resource: LearningResource, isAdmin: boolean = false): Promise<ResourceOperationResult> {
    // 1. Always update local cache
    const list = this.getLocalResources();
    const idx = list.findIndex((r) => r.id === resource.id);
    if (idx >= 0) list[idx] = resource;
    else list.unshift(resource);
    this.setLocalResources(list);

    // 2. If not admin or not configured, return as local save
    if (!isSupabaseConfigured || !isAdmin) {
      return { success: true, isCloudSynced: false };
    }

    // 3. Save to remote Supabase catalogue as admin
    try {
      const { error } = await supabase.from('learning_resources').upsert({
        id: resource.id,
        name: resource.name,
        description: resource.description,
        official_url: resource.url,
        provider: resource.provider,
        category: resource.category,
        tags: resource.tags,
        difficulty: resource.difficulty,
        free_status: resource.free_status,
        paid_features: resource.paid_features,
        date_added: resource.date_added,
        last_verified: resource.last_verified,
        status: resource.status,
        learning_path: resource.learning_path,
        is_featured: resource.is_featured,
        updated_at: new Date().toISOString(),
      });

      if (error) {
        return { success: false, error: error.message, isCloudSynced: false };
      }
      return { success: true, isCloudSynced: true };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Database error';
      return { success: false, error: msg, isCloudSynced: false };
    }
  },

  /**
   * Delete single resource
   */
  async deleteResource(resourceId: string, isAdmin: boolean = false): Promise<ResourceOperationResult> {
    // Remove from local cache
    const list = this.getLocalResources().filter((r) => r.id !== resourceId);
    this.setLocalResources(list);

    if (!isSupabaseConfigured || !isAdmin) {
      return { success: true, isCloudSynced: false };
    }

    try {
      const { error } = await supabase
        .from('learning_resources')
        .delete()
        .eq('id', resourceId);

      if (error) {
        return { success: false, error: error.message, isCloudSynced: false };
      }
      return { success: true, isCloudSynced: true };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to delete resource';
      return { success: false, error: msg, isCloudSynced: false };
    }
  },

  /**
   * Batch upsert resources (e.g. JSON import)
   */
  async batchSaveResources(
    resources: LearningResource[],
    isAdmin: boolean = false
  ): Promise<ResourceOperationResult> {
    const list = this.getLocalResources();
    const map = new Map<string, LearningResource>();
    list.forEach((r) => map.set(r.id, r));
    resources.forEach((r) => map.set(r.id, r));
    const merged = Array.from(map.values());
    this.setLocalResources(merged);

    if (!isSupabaseConfigured || !isAdmin) {
      return { success: true, isCloudSynced: false };
    }

    try {
      const rows = resources.map((r) => ({
        id: r.id,
        name: r.name,
        description: r.description,
        official_url: r.url,
        provider: r.provider,
        category: r.category,
        tags: r.tags,
        difficulty: r.difficulty,
        free_status: r.free_status,
        paid_features: r.paid_features,
        date_added: r.date_added,
        last_verified: r.last_verified,
        status: r.status,
        learning_path: r.learning_path,
        is_featured: r.is_featured,
        updated_at: new Date().toISOString(),
      }));

      const { error } = await supabase.from('learning_resources').upsert(rows);
      if (error) {
        return { success: false, error: error.message, isCloudSynced: false };
      }
      return { success: true, isCloudSynced: true };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Batch save failed';
      return { success: false, error: msg, isCloudSynced: false };
    }
  },
};
