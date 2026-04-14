import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://dcmmeuayusmnsbxuywhp.supabase.co';
const supabaseAnonKey = 'sb_publishable_fboYZ1aXs8p0Yt6sOuC30g_LwMXMcFA';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
