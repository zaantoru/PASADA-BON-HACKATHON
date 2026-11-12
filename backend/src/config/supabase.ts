import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL;
const secretKey = process.env.SUPABASE_SECRET_KEY;

if (!supabaseUrl || !secretKey) {
  throw new Error('Missing SUPABASE_URL or SUPABASE_SECRET_KEY in backend/.env');
}

// Server-side client. The secret key bypasses Row Level Security,
// so only use it in the backend.
export const supabase = createClient(supabaseUrl, secretKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});
