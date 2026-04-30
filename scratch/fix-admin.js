
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const env = fs.readFileSync('.env', 'utf8');
const envVars = {};
env.split('\n').forEach(line => {
    const [key, value] = line.split('=');
    if (key && value) envVars[key.trim()] = value.trim().replace(/^"(.*)"$/, '$1');
});

// Use service role key if possible for updates, otherwise anon might work if RLS is off
const supabase = createClient(envVars.NEXT_PUBLIC_SUPABASE_URL, envVars.NEXT_PUBLIC_SUPABASE_ANON_KEY);

async function fixAdmin() {
    console.log("Updating admin_settings to use valid model...");
    const { data, error } = await supabase
        .from('admin_settings')
        .update({ ai_model: 'llama-3.3-70b-versatile' })
        .eq('ai_model', 'llama3gpt-4-test');
    
    if (error) {
        console.error("Error updating admin_settings:", error);
        return;
    }
    console.log("SUCCESS: Admin settings updated.");
}

fixAdmin();
