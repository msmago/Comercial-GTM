
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.SUPABASE_URL || 'https://ottzppnrctbrtwsfgidr.supabase.co';
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || 'sb_publishable_RDXC_dqs-bANRVCa0klJFA_Ehm0dlpc';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
