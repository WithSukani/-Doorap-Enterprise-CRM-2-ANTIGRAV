
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import Stripe from "https://esm.sh/stripe@12.0.0?target=deno";

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") ?? "", {
    apiVersion: "2022-11-15",
    httpClient: Stripe.createFetchHttpClient(),
});

const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
    if (req.method === "OPTIONS") {
        return new Response("ok", { headers: corsHeaders });
    }

    try {
        const supabaseClient = createClient(
            Deno.env.get("SUPABASE_URL") ?? "",
            Deno.env.get("SUPABASE_ANON_KEY") ?? "",
            {
                global: { headers: { Authorization: req.headers.get("Authorization")! } },
            }
        );

        const {
            data: { user },
        } = await supabaseClient.auth.getUser();

        if (!user) {
            throw new Error("User not found");
        }

        const url = new URL(req.url);
        const path = url.pathname.split("/").pop(); // activate or financial-connection

        if (path === "activate") {
            // 1. Activate Financials (Create Account + Link)
            // Check if profile exists and has stripe_account_id
            const { data: profile } = await supabaseClient
                .from("profiles")
                .select("stripe_account_id")
                .eq("id", user.id)
                .single();

            let accountId = profile?.stripe_account_id;

            if (!accountId) {
                // Create Stripe Express Account
                const account = await stripe.accounts.create({
                    type: "express",
                    country: "US", // Defaulting to US for now
                    email: user.email,
                    capabilities: {
                        card_payments: { requested: true },
                        transfers: { requested: true },
                    },
                });
                accountId = account.id;

                // Upsert profile with new stripe_account_id
                await supabaseClient.from("profiles").upsert({
                    id: user.id,
                    stripe_account_id: accountId,
                });
            }

            // Create Account Link
            const accountLink = await stripe.accountLinks.create({
                account: accountId,
                refresh_url: `${req.headers.get("origin")}/financials`,
                return_url: `${req.headers.get("origin")}/financials?success=true`,
                type: "account_onboarding",
            });

            return new Response(JSON.stringify({ url: accountLink.url }), {
                headers: { ...corsHeaders, "Content-Type": "application/json" },
            });

        } else if (path === "financial-connection") {
            // 2. Financial Connection Session
            const { data: profile } = await supabaseClient
                .from("profiles")
                .select("stripe_account_id")
                .eq("id", user.id)
                .single();

            if (!profile?.stripe_account_id) {
                throw new Error("Stripe account not found. Please activate financials first.");
            }

            const session = await stripe.financialConnections.sessions.create({
                account_holder: { type: 'account', account: profile.stripe_account_id },
                permissions: ['balances', 'ownership', 'payment_method', 'transactions'],
            });

            return new Response(JSON.stringify({ client_secret: session.client_secret }), {
                headers: { ...corsHeaders, "Content-Type": "application/json" },
            });
        } else if (path === "webhook") {
            // 3. Webhook Handler
            const signature = req.headers.get("stripe-signature");
            const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET");

            if (!signature || !webhookSecret) {
                return new Response("Missing signature or secret", { status: 400 });
            }

            const body = await req.text();
            let event;

            try {
                event = await stripe.webhooks.constructEventAsync(
                    body,
                    signature,
                    webhookSecret
                );
            } catch (err) {
                return new Response(`Webhook Error: ${err.message}`, { status: 400 });
            }

            if (event.type === "account.updated") {
                const account = event.data.object;

                // Check if account is fully onboarded
                // 'charges_enabled' usually means they can accept payments (e.g. rent)
                // 'details_submitted' means they finished the form
                if (account.charges_enabled && account.details_submitted) {
                    const { error } = await supabaseClient
                        .from("profiles")
                        .update({ financials_active: true, updated_at: new Date().toISOString() })
                        .eq("stripe_account_id", account.id);

                    if (error) {
                        console.error("Error updating profile:", error);
                        return new Response("Database Update Failed", { status: 500 });
                    }
                }
            }

            return new Response(JSON.stringify({ received: true }), {
                headers: { ...corsHeaders, "Content-Type": "application/json" },
            });
        }

        throw new Error(`Unknown path: ${path}`);

    } catch (error) {
        return new Response(JSON.stringify({ error: error.message }), {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
    }
});
