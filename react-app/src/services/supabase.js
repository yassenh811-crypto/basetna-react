/* ============================================================
   🗄️ supabase.js — إعداد اتصال Supabase
   ============================================================ */
import { createClient } from '@supabase/supabase-js';

// شيل أي مسافة زيادة من المتغيرات
const supabaseUrl = (import.meta.env.VITE_SUPABASE_URL || '').trim();
const supabaseAnonKey = (import.meta.env.VITE_SUPABASE_ANON_KEY || '').trim();

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ تأكد من إعداد VITE_SUPABASE_URL و VITE_SUPABASE_ANON_KEY في ملف .env أو في Vercel');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
});