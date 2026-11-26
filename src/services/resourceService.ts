import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { LearningResource } from '../types/resources';
import { INITIAL_RESOURCES } from '../data/initialResources';

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

      return data.map((row) => ({
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
    } catch {
      return this.getLocalResources();
    }
  },

  getLocalResources(): LearningResource[] {
    const saved = localStorage.getItem('mangos_learning_resources');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch {
        // use initial
      }
    }
    return INITIAL_RESOURCES;
  },

  setLocalResources(resources: LearningResource[]): void {
    localStorage.setItem('mangos_learning_resources', JSON.stringify(resources));
  },

  /**
   * Upsert single resource
   */
  async saveResource(resource: LearningResource): Promise<boolean> {
    if (!isSupabaseConfigured) {
      const list = this.getLocalResources();
      const idx = list.findIndex((r) => r.id === resource.id);
      if (idx >= 0) list[idx] = resource;
      else list.unshift(resource);
      this.setLocalResources(list);
      return true;
    }

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
      return !error;
    } catch {
      return false;
    }
  },

  /**
   * Batch upsert resources
   */
  async batchSaveResources(resources: LearningResource[]): Promise<boolean> {
    const list = this.getLocalResources();
    const map = new Map<string, LearningResource>();
    list.forEach((r) => map.set(r.id, r));
    resources.forEach((r) => map.set(r.id, r));
    const merged = Array.from(map.values());
    this.setLocalResources(merged);

    if (!isSupabaseConfigured) return true;

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
      return !error;
    } catch {
      return false;
    }
  },
};
