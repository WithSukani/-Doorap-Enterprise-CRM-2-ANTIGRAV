import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
    // Handle CORS preflight requests
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    try {
        // Create a Supabase client with the Admin Secret Key (Service Role Key)
        // This allows us to access auth.admin methods
        const supabaseAdmin = createClient(
            Deno.env.get('SUPABASE_URL') ?? '',
            Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
            {
                auth: {
                    autoRefreshToken: false,
                    persistSession: false
                }
            }
        )

        // Get the request body
        const { email, name, role, permissions, invited_by_user_id } = await req.json()

        if (!email) {
            return new Response(
                JSON.stringify({ error: 'Email is required' }),
                { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
            )
        }

        // 1. Invite the user via Supabase Auth Admin API
        // This sends the standard Supabase Invite email
        const { data: inviteData, error: inviteError } = await supabaseAdmin.auth.admin.inviteUserByEmail(email)

        if (inviteError) {
            console.error('Error inviting user:', inviteError)
            return new Response(
                JSON.stringify({ error: inviteError.message }),
                { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
            )
        }

        const invitedUser = inviteData.user

        // 2. Insert/Update the team_members table
        // We link the auth_user_id immediately so when they sign up/login, RLS works
        const { data: memberData, error: memberError } = await supabaseAdmin
            .from('team_members')
            .upsert({
                auth_user_id: invitedUser.id,
                email: email,
                name: name,
                role: role, // 'Admin', 'Property Manager', etc.
                status: 'Invited',
                permissions: permissions, // JSONB
                user_id: invited_by_user_id // The owner/admin who invited them
            })
            .select()
            .single()

        if (memberError) {
            console.error('Error creating team member record:', memberError)
            // Note: The user is technically invited in Auth, but DB record failed.
            // We return error so frontend knows something went wrong.
            return new Response(
                JSON.stringify({ error: 'User invited but failed to create team record: ' + memberError.message }),
                { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
            )
        }

        return new Response(
            JSON.stringify({ user: invitedUser, member: memberData }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
        )

    } catch (error) {
        console.error('Unexpected error:', error)
        return new Response(
            JSON.stringify({ error: error.message }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
        )
    }
})
