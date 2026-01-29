
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('CRITICAL: Missing Supabase environment variables!');
  alert('ERRO CRÍTICO: Variáveis de conexão com o Supabase não encontradas. Por favor, reinicie o terminal (pare e inicie o "npm run dev") para que as alterações no arquivo .env tenham efeito.');
}

export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder'
);
