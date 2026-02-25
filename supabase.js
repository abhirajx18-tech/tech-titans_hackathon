import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://jehhkqkamsdhskqxdfsw.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImplaGhrcWthbXNkaHNrcXhkZnN3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzIwMDE1NjcsImV4cCI6MjA4NzU3NzU2N30.EV0Yj6kxbG_DNGppnIFBLQXLMwcGO7E-LotAn6BnbDg'

export const supabase = createClient(supabaseUrl, supabaseKey)