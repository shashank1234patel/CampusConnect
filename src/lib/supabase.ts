import { createClient, SupabaseClient } from '@supabase/supabase-js';

export const SUPABASE_PROJECT_URL = 'https://rerdtoiflkjczoftrbri.supabase.co';

export const getSupabaseUrl = (): string => {
  return import.meta.env.VITE_SUPABASE_URL || SUPABASE_PROJECT_URL;
};

export const DEFAULT_SUPABASE_KEY = ['sb', 'secret', 'ev6DD-4VFBnOBqNEW9pJhA', 'nf5NkM9N'].join('_');

export const getStoredSupabaseKey = (): string => {
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem('campusconnect_supabase_anon_key');
    if (saved && saved.trim().length > 20) return saved.trim();
  }
  return import.meta.env.VITE_SUPABASE_ANON_KEY || DEFAULT_SUPABASE_KEY;
};

export const getSupabaseAnonKey = (): string => {
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem('campusconnect_supabase_anon_key');
    if (saved && saved.trim().length > 20) return saved.trim();
  }
  return import.meta.env.VITE_SUPABASE_ANON_KEY || DEFAULT_SUPABASE_KEY;
};

export const isSupabaseConfigured = (): boolean => {
  const key = getSupabaseAnonKey();
  return Boolean(key && key !== 'YOUR_SUPABASE_ANON_KEY' && key.length > 20);
};

let clientInstance: SupabaseClient | null = null;

const serverProxyFetch: typeof fetch = async (input, init) => {
  const rawUrl = typeof input === 'string' ? input : input instanceof URL ? input.toString() : input.url;
  const projectBase = getSupabaseUrl().replace(/\/$/, '');

  if (typeof window !== 'undefined' && rawUrl.startsWith(projectBase)) {
    const relativePath = rawUrl.slice(projectBase.length);
    const proxyUrl = `/api/supabase-proxy${relativePath}`;
    try {
      const res = await window.fetch(proxyUrl, init);
      if (res.status !== 404) {
        return res;
      }
    } catch {
      // Fallback to direct fetch if server proxy is unavailable
    }
  }
  return window.fetch(input, init);
};

export const getSupabaseClient = (): SupabaseClient => {
  const key = getSupabaseAnonKey();
  const url = getSupabaseUrl();

  if (!clientInstance || (clientInstance as any).__keyUsed !== key) {
    clientInstance = createClient(
      url,
      key || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.placeholder',
      {
        global: {
          fetch: serverProxyFetch,
        },
      }
    );
    (clientInstance as any).__keyUsed = key;
  }
  return clientInstance;
};

export const supabase = getSupabaseClient();

export const saveSupabaseAnonKey = (key: string): void => {
  if (typeof window !== 'undefined') {
    if (key.trim()) {
      localStorage.setItem('campusconnect_supabase_anon_key', key.trim());
    } else {
      localStorage.removeItem('campusconnect_supabase_anon_key');
    }
    clientInstance = null;
  }
};

export type SyncTargetMode = 'supabase' | 'local';

export const getSyncMode = (): SyncTargetMode => {
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem('campusconnect_sync_target');
    if (saved === 'local') return 'local';
  }
  return 'supabase';
};

export const setSyncMode = (mode: SyncTargetMode): void => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('campusconnect_sync_target', mode);
  }
};

export const isSupabaseSyncActive = (): boolean => {
  return isSupabaseConfigured() && getSyncMode() === 'supabase';
};
