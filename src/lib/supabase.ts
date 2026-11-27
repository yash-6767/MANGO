import { createClient } from '@supabase/supabase-js';

const rawUrl = (import.meta.env.VITE_SUPABASE_URL ?? import.meta.env.SUPABASE_URL ?? '').trim();
const rawKey = (import.meta.env.VITE_SUPABASE_ANON_KEY ?? import.meta.env.SUPABASE_ANON_KEY ?? '').trim();

const isPlaceholderUrl = !rawUrl || rawUrl.includes('placeholder.supabase.co') || rawUrl.includes('your-project-id');
const isPlaceholderKey = !rawKey || rawKey.includes('placeholder-anon-key') || rawKey.includes('your-supabase-anon-key');

export const isSupabaseConfigured: boolean = Boolean(
  rawUrl &&
  rawKey &&
  !isPlaceholderUrl &&
  !isPlaceholderKey &&
  rawUrl.startsWith('https://')
);

const supabaseUrl = isSupabaseConfigured ? rawUrl : 'https://placeholder.supabase.co';
const supabaseAnonKey = isSupabaseConfigured ? rawKey : 'placeholder-anon-key';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

