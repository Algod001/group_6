import { createClient } from '@supabase/supabase-js';
//VITE_API_URL=http://localhost:5000

const supabaseUrl = "https://xsconeslwecjwqsidano.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhzY29uZXNsd2Vjandxc2lkYW5vIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM1Nzc2NTYsImV4cCI6MjA3OTE1MzY1Nn0.YGGTm6757ojSYcrmGqp-ttNInyAAXI0sDwB7YuM_qXc"; 

export const supabase = createClient(supabaseUrl, supabaseKey);