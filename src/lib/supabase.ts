import { createClient, SupabaseClient } from '@supabase/supabase-js';

export const SUPABASE_PROJECT_URL = 'https://rerdtoiflkjczoftrbri.supabase.co';

export const getSupabaseUrl = (): string => {
  return import.meta.env.VITE_SUPABASE_URL || SUPABASE_PROJECT_URL;
};

export const getStoredSupabaseKey = (): string => {
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem('campusconnect_supabase_anon_key');
    if (saved && saved.trim().length > 20) return saved.trim();
  }
  return import.meta.env.VITE_SUPABASE_ANON_KEY || '';
};

export const getSupabaseAnonKey = (): string => {
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem('campusconnect_supabase_anon_key');
    if (saved && saved.trim().length > 20) return saved.trim();
  }
  return import.meta.env.VITE_SUPABASE_ANON_KEY || '';
};

export const isSupabaseConfigured = (): boolean => {
  const key = getSupabaseAnonKey();
  return Boolean(key && key !== 'YOUR_SUPABASE_ANON_KEY' && key.length > 20);
};

let clientInstance: SupabaseClient | null = null;

export const getSupabaseClient = (): SupabaseClient => {
  const key = getSupabaseAnonKey();
  const url = getSupabaseUrl();
  
  if (!clientInstance || (clientInstance as any).__keyUsed !== key) {
    clientInstance = createClient(
      url,
      key || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.placeholder'
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
