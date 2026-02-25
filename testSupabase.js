import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://YOUR_PROJECT_ID.supabase.co'
const supabaseKey = 'YOUR_PUBLISHABLE_KEY' // anon / publishable

const supabase = createClient(supabaseUrl, supabaseKey)

async function testConnection() {
  const { data, error } = await supabase
    .from('YOUR_TABLE_NAME')
    .select('*')
    .limit(1)

  if (error) {
    console.error('❌ Connection failed:', error.message)
  } else {
    console.log('✅ Connected successfully')
    console.log(data)
  }
}

testConnection()