import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://dcmmeuayusmnsbxuywhp.supabase.co';
const supabaseAnonKey = 'sb_publishable_fboYZ1aXs8p0Yt6sOuC30g_LwMXMcFA';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function debugDB() {
    console.log("--- Checking Tests Table ---");
    const { data: tests, error: testErr } = await supabase.from('tests').select('*').limit(5);
    if (testErr) console.error("Test Error:", testErr);
    else console.log("Tests:", JSON.stringify(tests, null, 2));

    console.log("\n--- Checking Students Table ---");
    const { data: students, error: studentErr } = await supabase.from('students').select('*').limit(5);
    if (studentErr) console.error("Student Error:", studentErr);
    else console.log("Students:", JSON.stringify(students, null, 2));

    console.log("\n--- Checking Results Join ---");
    const { data: results, error: resErr } = await supabase
        .from('results')
        .select('*, students(name)')
        .limit(5);
    if (resErr) console.error("Results Join Error:", resErr);
    else console.log("Results Join:", JSON.stringify(results, null, 2));
}

debugDB();
