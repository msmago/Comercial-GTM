
import { createClient } from '@supabase/supabase-js';

// Função auxiliar para capturar variáveis de ambiente de forma segura no Vite/Vercel
const getEnvVar = (name: string, fallback: string): string => {
  const v = (import.meta as any).env?.[`VITE_${name}`] || 
            (import.meta as any).env?.[name] || 
            (process as any).env?.[name] || 
            (window as any).process?.env?.[name] || 
            fallback;
  return v;
};

const SUPABASE_URL = getEnvVar('SUPABASE_URL', 'https://ottzppnrctbrtwsfgidr.supabase.co');
const SUPABASE_ANON_KEY = getEnvVar('SUPABASE_ANON_KEY', 'sb_publishable_RDXC_dqs-bANRVCa0klJFA_Ehm0dlpc');

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  }
});
