import { createClient } from '@supabase/supabase-js';

// User's provided Supabase credentials
const supabaseUrl = 'https://dcmmeuayusmnsbxuywhp.supabase.co';
const supabaseAnonKey = 'sb_publishable_fboYZ1aXs8p0Yt6sOuC30g_LwMXMcFA';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testFlow() {
    console.log("1. Testing signup...");
    const email = `test_${Date.now()}@learnu.com`;
    // Attempt standard signup
    const { data, error } = await supabase.auth.signUp({
        email: email,
        password: 'password123',
        options: { data: { role: 'student' } }
    });

    if (error) {
        console.error("Auth Error:", error.message);
        return;
    }
    
    console.log("Signup success. User ID:", data.user ? data.user.id : 'No user returned');

    if (data?.user) {
        console.log("2. Testing sync to students table...");
        const payload = {
            id: data.user.id,
            name: email.split('@')[0], 
            email: email,
            mobile: '1234567890',
            coupon_key: 'PREMIUM'
        };

        const { error: dbError, data: resData } = await supabase.from('students').upsert([payload]);
        if (dbError) {
            console.error("Database Insert Error:", dbError.message);
        } else {
            console.log("Database Insert Success!");
        }
    }
}

testFlow();
