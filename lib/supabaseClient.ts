import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://wsuptvmeejvxyipazpip.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndzdXB0dm1lZWp2eHlpcGF6cGlwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDkzNzUzNDksImV4cCI6MjA2NDk1MTM0OX0.UDQW0jHGFV1KWu4LezLoFhrNRF9h4LF1xKh1B2e_ZLY'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
