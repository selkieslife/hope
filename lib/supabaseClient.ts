import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://wsuptvmeejvxyipazpip.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
