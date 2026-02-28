import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Variáveis de ambiente do Supabase não encontradas. Verifique o arquivo .env.local');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: false,   // Não persiste sessão de auth (usamos localStorage manual)
    autoRefreshToken: false, // Não faz chamada extra ao /auth/v1/token no startup
    detectSessionInUrl: false,
  },
});

