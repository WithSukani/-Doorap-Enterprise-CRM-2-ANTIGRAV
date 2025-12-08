
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// 1. Read .env.local to get credentials
const envPath = path.resolve(__dirname, '.env.local');
let supabaseUrl = '';
let supabaseKey = '';

try {
    const envContent = fs.readFileSync(envPath, 'utf8');
    const lines = envContent.split('\n');
    lines.forEach(line => {
        if (line.startsWith('NEXT_PUBLIC_SUPABASE_URL=')) {
            supabaseUrl = line.split('=')[1].trim();
        }
        if (line.startsWith('NEXT_PUBLIC_SUPABASE_ANON_KEY=')) {
            supabaseKey = line.split('=')[1].trim();
        }
    });
} catch (e) {
    console.error("Error reading .env.local:", e.message);
    process.exit(1);
}

if (!supabaseUrl || !supabaseKey) {
    console.error("Missing credentials in .env.local");
    console.log("URL:", supabaseUrl ? "Found" : "Missing");
    console.log("Key:", supabaseKey ? "Found" : "Missing");
    process.exit(1);
}

// 2. Initialize Client
const supabase = createClient(supabaseUrl, supabaseKey);

// 3. Test Connection
async function testConnection() {
    console.log(`Connecting to ${supabaseUrl}...`);

    // Try to fetch 1 property just to check connection
    const { data, error } = await supabase.from('properties').select('count', { count: 'exact', head: true });

    if (error) {
        console.error("Connection Failed:", error.message);
        console.error("Details:", error);

        if (error.code === '42P01') { // undefined_table
            console.log("\nPossible Cause: The tables have not been created yet.");
            console.log("Action: Please run 'complete_schema.sql' in your Supabase SQL Editor.");
        }
    } else {
        console.log("Connection Successful!");
        console.log(`Successfully connected to the database.`);
        console.log(`Status: The 'properties' table exists (Count query returned).`);
    }
}

testConnection();
