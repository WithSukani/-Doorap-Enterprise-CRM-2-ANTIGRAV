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

        if (!user && !req.url.includes("webhook")) {
            // Webhooks don't have user session, but other endpoints do
            // Actually webhooks are global, so we might not need this check here if we separate logic nicely
        }

        const url = new URL(req.url);
        const path = url.pathname.split("/").pop(); // activate, financial-connection, check-status, get-data, etc.

        // Webhooks don't require auth user, handle first
        if (path === "webhook") {
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
                if (account.charges_enabled && account.details_submitted) {
                    await supabaseClient
                        .from("profiles")
                        .update({ financials_active: true, updated_at: new Date().toISOString() })
                        .eq("stripe_account_id", account.id);
                }
            }

            return new Response(JSON.stringify({ received: true }), {
                headers: { ...corsHeaders, "Content-Type": "application/json" },
            });
        }

        // All other endpoints require user
        if (!user) {
            throw new Error("User not found");
        }

        // Helper to get connected account ID
        const getStripeId = async () => {
            const { data: profile } = await supabaseClient
                .from("profiles")
                .select("stripe_account_id, financials_active")
                .eq("id", user.id)
                .single();
            return profile;
        };

        if (path === "activate") {
            const profile = await getStripeId();
            let accountId = profile?.stripe_account_id;

            if (!accountId) {
                const account = await stripe.accounts.create({
                    type: "express",
                    country: "GB",
                    email: user.email,
                    capabilities: {
                        card_payments: { requested: true },
                        transfers: { requested: true },
                    },
                });
                accountId = account.id;

                await supabaseClient.from("profiles").upsert({
                    id: user.id,
                    stripe_account_id: accountId,
                });
            }

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
            const profile = await getStripeId();
            if (!profile?.stripe_account_id) throw new Error("Stripe account not found.");

            const session = await stripe.financialConnections.sessions.create({
                account_holder: { type: 'account', account: profile.stripe_account_id },
                permissions: ['balances', 'ownership', 'payment_method', 'transactions'],
            });

            return new Response(JSON.stringify({ client_secret: session.client_secret }), {
                headers: { ...corsHeaders, "Content-Type": "application/json" },
            });

        } else if (path === "check-status") {
            const profile = await getStripeId();
            if (!profile?.stripe_account_id) {
                return new Response(JSON.stringify({ active: false }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
            }

            const account = await stripe.accounts.retrieve(profile.stripe_account_id);
            const isActive = account.charges_enabled && account.details_submitted;

            if (isActive && !profile.financials_active) {
                await supabaseClient
                    .from("profiles")
                    .update({ financials_active: true, updated_at: new Date().toISOString() })
                    .eq("id", user.id);
            }

            return new Response(JSON.stringify({ active: isActive }), {
                headers: { ...corsHeaders, "Content-Type": "application/json" },
            });

        } else if (path === "get-data") {
            const profile = await getStripeId();
            if (!profile?.stripe_account_id) return new Response(JSON.stringify({ error: "No Stripe account" }), { status: 400, headers: corsHeaders });

            try {
                const balance = await stripe.balance.retrieve({ stripeAccount: profile.stripe_account_id });
                const accounts = await stripe.financialConnections.accounts.list({
                    account_holder: { type: 'account', account: profile.stripe_account_id },
                    expand: ['data.balance'],
                }, { stripeAccount: profile.stripe_account_id });

                return new Response(JSON.stringify({ balance, bankAccounts: accounts.data }), {
                    headers: { ...corsHeaders, "Content-Type": "application/json" },
                });
            } catch (err) {
                return new Response(JSON.stringify({ error: err.message }), { status: 500, headers: corsHeaders });
            }

        } else if (path === "create-payment-link") {
            const { amount, currency, description, type } = await req.json();
            const profile = await getStripeId();
            if (!profile?.stripe_account_id) return new Response(JSON.stringify({ error: "No Stripe account" }), { status: 400, headers: corsHeaders });

            try {
                const product = await stripe.products.create({ name: description || "Payment" }, { stripeAccount: profile.stripe_account_id });
                const priceData: any = {
                    unit_amount: Math.round(amount * 100),
                    currency: currency || 'gbp',
                    product: product.id,
                };
                if (type === 'recurring') priceData.recurring = { interval: 'month' };

                const price = await stripe.prices.create(priceData, { stripeAccount: profile.stripe_account_id });
                const paymentLink = await stripe.paymentLinks.create({
                    line_items: [{ price: price.id, quantity: 1 }],
                    metadata: { created_by: user.id, description }
                }, { stripeAccount: profile.stripe_account_id });

                return new Response(JSON.stringify({ url: paymentLink.url }), {
                    headers: { ...corsHeaders, "Content-Type": "application/json" },
                });
            } catch (err) {
                return new Response(JSON.stringify({ error: err.message }), { status: 500, headers: corsHeaders });
            }

        } else if (path === "get-transactions") {
            const { limit } = await req.json().catch(() => ({ limit: 10 }));
            const profile = await getStripeId();
            if (!profile?.stripe_account_id) return new Response(JSON.stringify({ error: "No Stripe account" }), { status: 400, headers: corsHeaders });

            try {
                const transactions = await stripe.balanceTransactions.list({
                    limit: limit || 20,
                    expand: ['data.source'],
                }, { stripeAccount: profile.stripe_account_id });

                return new Response(JSON.stringify({ transactions: transactions.data }), {
                    headers: { ...corsHeaders, "Content-Type": "application/json" },
                });
            } catch (err) {
                return new Response(JSON.stringify({ error: err.message }), { status: 500, headers: corsHeaders });
            }
        }

        throw new Error(`Unknown path: ${path}`);

    } catch (error) {
        return new Response(JSON.stringify({ error: error.message }), {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
    }
});
