'use client';

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://mfomdkwegcdqdwagmtde.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1mb21ka3dlZ2NkcWR3YWdtdGRlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU1MDkxMDUsImV4cCI6MjA3MTA4NTEwNX0.kvODMX_UfObMMbfvhKj_tPlkQISQiSQ9eg5thUo_cmc'

if (!supabaseUrl || !supabaseAnonKey) {
  // Agar jelas saat env belum diset
  console.warn('Supabase env belum diset: NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);


