
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    try {
        const supabaseClient = createClient(
            // Supabase API URL - env var automatically injected by Supabase
            Deno.env.get('SUPABASE_URL') ?? '',
            // Supabase Anon Key - env var automatically injected by Supabase
            Deno.env.get('SUPABASE_ANON_KEY') ?? '',
            { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
        )

        // Parse 'tool_name' from URL Query Parameter (Recommended for ElevenLabs)
        const url = new URL(req.url)
        let tool = url.searchParams.get('tool_name')

        // Parse Body (for arguments)
        const body = await req.json()
        const parameters = body // ElevenLabs sends arguments directly in body

        // Fallback: Check if 'tool' was in body (legacy support)
        if (!tool && body.tool) {
            tool = body.tool
        }

        // --- Tool: Identify Property Context ---
        if (tool === 'identify_property') {
            const { property_address, company_name } = parameters

            // 1. Search for Property
            const { data: property } = await supabaseClient
                .from('properties')
                .select('id, address, postcode, owner_name')
                .ilike('address', `%${property_address}%`)
                .limit(1)
                .single()

            // 2. Validate Management Context (Agency check)
            let companyValid = true
            let systemCompanyName = "Doorap Enterprise" // Default fallback

            if (company_name) {
                const { data: profile } = await supabaseClient
                    .from('user_profiles')
                    .select('company_name')
                    .ilike('company_name', `%${company_name}%`)
                    .limit(1)
                    .single()

                if (!profile) {
                    companyValid = false
                    // Fetch actual system company name for correction
                    const { data: anyProfile } = await supabaseClient
                        .from('user_profiles')
                        .select('company_name')
                        .limit(1)
                        .single()
                    if (anyProfile) systemCompanyName = anyProfile.company_name
                } else {
                    systemCompanyName = profile.company_name
                }
            }

            if (!property) {
                return new Response(JSON.stringify({
                    found: false,
                    message: "I can't find a property with that address in our portfolio. Could you please confirm the first line of the address?"
                }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
            }

            if (!companyValid) {
                return new Response(JSON.stringify({
                    found: true,
                    warning: "Company Mismatch",
                    property: property.address,
                    message: `I found the property at ${property.address}, but we are '${systemCompanyName}', not '${company_name}'. Are you sure you have the right agency? I can still help if you are a tenant there.`
                }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
            }

            return new Response(JSON.stringify({
                found: true,
                message: `Perfect. I have pulled up the file for ${property.address}. What can I help you with regarding this property?`,
                property_id: property.id,
                address: property.address,
                owner: property.owner_name
            }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
        }

        // --- Tool: Check Maintenance Report ---
        if (tool === 'check_maintenance_report') {
            const { phone_number, first_name, last_name, company_name } = parameters

            let tenant = null;

            // 1. Initial Lookup by Phone (Primary)
            if (phone_number) {
                const { data: tenantByPhone } = await supabaseClient
                    .from('tenants')
                    .select('id, property_id, name')
                    .ilike('phone', `%${phone_number}%`)
                    .single()
                tenant = tenantByPhone
            }

            // 2. Fallback Lookup by Name (Secondary)
            if (!tenant && first_name && last_name) {
                // Attempt to find by name (case insensitive, matching parts)
                // Note: In production, consider company_name/property_id filtering to avoid duplicates
                const { data: tenantByName } = await supabaseClient
                    .from('tenants')
                    .select('id, property_id, name')
                    .ilike('name', `%${first_name}%`)
                    .ilike('name', `%${last_name}%`)
                    .limit(1)
                    .single()

                if (tenantByName) {
                    tenant = tenantByName;
                    // Optional: Validate company if provided
                }
            }

            // 3. Not Found -> Guide the User
            if (!tenant) {
                // Dynamic response based on what we know
                if (!first_name && !last_name) {
                    return new Response(JSON.stringify({
                        found: false,
                        message: "I couldn't match your phone number to a record. Could I take your First and Last name to look you up manually?"
                    }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
                } else {
                    return new Response(JSON.stringify({
                        found: false,
                        message: `Sorry, I couldn't find a tenant record for ${first_name} ${last_name} either. You might need to contact support directly.`
                    }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
                }
            }

            // 4. Found Tenant -> Check Requests
            const { data: requests } = await supabaseClient
                .from('maintenance_requests')
                .select('*')
                .eq('property_id', tenant.property_id)
                .order('created_at', { ascending: false })
                .limit(1)

            if (requests && requests.length > 0) {
                const req = requests[0]
                return new Response(JSON.stringify({
                    found: true,
                    status: req.status,
                    description: req.description,
                    reported_date: req.reported_at,
                    message: `I found a report from ${new Date(req.reported_at).toLocaleDateString()}. Status is ${req.status}.`
                }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
            } else {
                return new Response(JSON.stringify({
                    found: false,
                    message: "I see your profile, but I don't see any active maintenance reports logged yet."
                }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
            }
        }

        // --- Tool: Check Availability (Mock/Simple) ---
        if (tool === 'check_availability') {
            const { date_time } = parameters // ISO string requested by user

            // In a real app, query 'calendar_events' table. For now, assume open unless it's Sunday 3am.
            const date = new Date(date_time)
            const hour = date.getHours()
            const day = date.getDay()

            // Logic: Agents work 9am-6pm, Mon-Sat.
            if (day === 0 || hour < 9 || hour > 18) {
                return new Response(JSON.stringify({
                    available: false,
                    reason: "Agents are only available Monday to Saturday, 9am to 6pm."
                }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
            }

            return new Response(JSON.stringify({
                available: true,
                slot: date_time,
                message: "That slot is available."
            }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
        }

        // --- Tool: Create Viewing (Lead Card) ---
        if (tool === 'create_viewing') {
            const { first_name, last_name, email, phone, property_address, preferred_time } = parameters

            // 1. Identify Property (Fuzzy match)
            const { data: property } = await supabaseClient
                .from('properties')
                .select('id, address')
                .ilike('address', `%${property_address}%`)
                .limit(1)
                .single()

            // 2. Create Task / Viewing Logic
            const taskDescription = `Viewing Request for ${first_name} ${last_name} (${phone}). Property: ${property?.address || property_address}. Time: ${preferred_time}`

            const { error } = await supabaseClient
                .from('tasks')
                .insert({
                    title: `Viewing: ${first_name} ${last_name}`,
                    description: taskDescription,
                    status: 'Todo',
                    priority: 'High',
                    due_date: preferred_time,
                    related_to: property?.id ? `property:${property.id}` : undefined
                })

            if (error) throw error

            return new Response(JSON.stringify({
                success: true,
                message: "Booking confirmed. Invitation sent."
            }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
        }

        // Default: Tool Not Found
        return new Response(JSON.stringify({ error: 'Tool not found' }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 400
        })

    } catch (error) {
        return new Response(JSON.stringify({ error: error.message }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 500,
        })
    }
})
