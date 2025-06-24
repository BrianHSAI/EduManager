import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://laejutoyybubopageqtt.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxhZWp1dG95eWJ1Ym9wYWdlcXR0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAyMzUzMjMsImV4cCI6MjA2NTgxMTMyM30.yUlunE5BofEgipgg3QxrNQpLH53YksftxGM1oHyq-1w'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Helper to check if Supabase is properly configured
export const isSupabaseConfigured = () => {
  return true
}
