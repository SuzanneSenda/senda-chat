const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://efnkpazpexivnpvpgitf.supabase.co';
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { persistSession: false }
});

async function checkSchema() {
  // Check if profiles table has a role column
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .limit(1);
  
  if (error) {
    console.error('Error checking profiles:', error);
    return null;
  }
  
  console.log('Sample profile structure:', data[0] ? Object.keys(data[0]) : 'No profiles yet');
  return data[0] ? Object.keys(data[0]) : [];
}

async function runSQL(sql) {
  const { data, error } = await supabase.rpc('exec_sql', { sql_query: sql });
  if (error) {
    // Try alternative approach using direct fetch to SQL endpoint
    const response = await fetch(`${supabaseUrl}/rest/v1/rpc/exec_sql`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': serviceRoleKey,
        'Authorization': `Bearer ${serviceRoleKey}`
      },
      body: JSON.stringify({ sql_query: sql })
    });
    if (!response.ok) {
      return { error: await response.text() };
    }
    return { data: await response.json() };
  }
  return { data, error };
}

async function main() {
  console.log('🔐 Checking Senda Chat schema...\n');
  
  const columns = await checkSchema();
  console.log('\nProfile columns:', columns);
  
  const hasRole = columns && columns.includes('role');
  console.log('Has role column:', hasRole);
}

main().catch(console.error);
