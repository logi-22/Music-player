import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://evlhiorraxcwpyhnfpzh.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV2bGhpb3JyYXhjd3B5aG5mcHpoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQyMDk2MTAsImV4cCI6MjA1OTc4NTYxMH0.t_5j06t4Woh8O-QTKooPNGVO7-B4oFtfLb4B3hGNP8w';

export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  },
});