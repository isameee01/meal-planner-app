
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const env = fs.readFileSync('.env', 'utf8');
const envVars = {};
env.split('\n').forEach(line => {
    const [key, value] = line.split('=');
    if (key && value) envVars[key.trim()] = value.trim().replace(/^"(.*)"$/, '$1');
});

const supabase = createClient(envVars.NEXT_PUBLIC_SUPABASE_URL, envVars.NEXT_PUBLIC_SUPABASE_ANON_KEY);

async function checkAdmin() {
    const { data, error } = await supabase.from('admin_settings').select('*');
    if (error) {
        console.error("Error fetching admin_settings:", error);
        return;
    }
    console.log("ADMIN SETTINGS:");
    console.log(JSON.stringify(data, null, 2));
}

checkAdmin();
