import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { SupabaseSettings } from '../types';
import { SUPABASE_URL, SUPABASE_ANON_KEY } from './supabaseConfig';

const SETTINGS_KEY = 'tecnogest_supabase_settings';

export const getSupabaseSettings = (): SupabaseSettings => {
  const envUrl = (import.meta as any).env?.VITE_SUPABASE_URL || '';
  const envKey = (import.meta as any).env?.VITE_SUPABASE_ANON_KEY || '';

  const activeUrl = SUPABASE_URL || envUrl;
  const activeKey = SUPABASE_ANON_KEY || envKey;

  try {
    const saved = localStorage.getItem(SETTINGS_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      return {
        url: activeUrl || parsed.url,
        anonKey: activeKey || parsed.anonKey,
        isConnected: Boolean(activeUrl || parsed.isConnected),
        lastSync: parsed.lastSync,
      };
    }
  } catch (e) {
    console.error('Error reading supabase settings from storage', e);
  }

  return {
    url: activeUrl,
    anonKey: activeKey,
    isConnected: Boolean(activeUrl && activeKey),
  };
};

export const saveSupabaseSettings = (settings: Partial<SupabaseSettings>) => {
  const current = getSupabaseSettings();
  const updated = { ...current, ...settings };
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(updated));
  return updated;
};

let cachedClient: SupabaseClient | null = null;
let lastUsedUrl = '';
let lastUsedKey = '';

export const getSupabaseClient = (): SupabaseClient | null => {
  const settings = getSupabaseSettings();
  if (!settings.url || !settings.anonKey) {
    return null;
  }

  if (cachedClient && lastUsedUrl === settings.url && lastUsedKey === settings.anonKey) {
    return cachedClient;
  }

  try {
    cachedClient = createClient(settings.url, settings.anonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      },
    });
    lastUsedUrl = settings.url;
    lastUsedKey = settings.anonKey;
    return cachedClient;
  } catch (error) {
    console.error('Failed to initialize Supabase client:', error);
    return null;
  }
};

export const testSupabaseConnection = async (url: string, anonKey: string): Promise<{ success: boolean; message: string }> => {
  if (!url || !anonKey) {
    return { success: false, message: 'URL e Anon Key são obrigatórias.' };
  }

  try {
    // Valida formato de URL
    new URL(url);
  } catch {
    return { success: false, message: 'Formato de URL inválido. Exemplo: https://xyzcompany.supabase.co' };
  }

  try {
    const testClient = createClient(url, anonKey);
    // Tenta uma consulta simples
    const { error } = await testClient.from('company_profile').select('id').limit(1);

    if (error) {
      // Se a tabela não existe ainda, mas a conexão foi aceita pelo Supabase (código 42P01 = tabela não existe)
      if (error.code === '42P01' || error.message.includes('relation "public.company_profile" does not exist')) {
        return {
          success: true,
          message: 'Conexão com Supabase validada com sucesso! Lembre-se de rodar o Script SQL para criar as tabelas.',
        };
      }
      return { success: false, message: `Erro do Supabase: ${error.message} (Código: ${error.code})` };
    }

    return { success: true, message: 'Conectado com sucesso ao banco de dados Supabase!' };
  } catch (err: any) {
    return { success: false, message: `Falha na requisição: ${err.message || 'Verifique sua URL e conexão com a internet.'}` };
  }
};
