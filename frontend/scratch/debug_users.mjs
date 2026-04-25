import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://dcmmeuayusmnsbxuywhp.supabase.co';
const supabaseAnonKey = 'sb_publishable_fboYZ1aXs8p0Yt6sOuC30g_LwMXMcFA';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function debugUsers() {
    console.log("--- Checking Users Table ---");
    const { data: users, error: uErr } = await supabase.from('users').select('*').limit(5);
    if (uErr) console.error("Users Error:", uErr);
    else console.log("Users:", JSON.stringify(users, null, 2));
}

debugUsers();
