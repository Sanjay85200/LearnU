import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://dcmmeuayusmnsbxuywhp.supabase.co';
const supabaseAnonKey = 'sb_publishable_fboYZ1aXs8p0Yt6sOuC30g_LwMXMcFA';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function debugDB() {
    console.log("--- Checking Teachers Table ---");
    const { data: teachers, error: tErr } = await supabase.from('teachers').select('*').limit(5);
    if (tErr) console.error("Teachers Error:", tErr);
    else console.log("Teachers:", JSON.stringify(teachers, null, 2));

    console.log("\n--- Checking Questions Table ---");
    const { data: qs, error: qErr } = await supabase.from('questions').select('*').limit(1);
    if (qErr) console.error("Questions Error:", qErr);
    else console.log("Questions Sample:", JSON.stringify(qs, null, 2));
}

debugDB();
