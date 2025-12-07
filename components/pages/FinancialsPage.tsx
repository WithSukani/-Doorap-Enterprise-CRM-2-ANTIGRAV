
import React, { useState, useEffect } from 'react';
import { supabase } from '../../utils/supabase';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { AlertCircle, CheckCircle, ExternalLink, Building2, Wallet } from 'lucide-react';
import { loadStripe } from '@stripe/stripe-js';

// Initialize Stripe with your Publishable Key
// TODO: Replace with your actual Publishable Key from environment variables
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || 'pk_test_placeholder');

const FinancialsPage = () => {
    const [loading, setLoading] = useState(true);
    const [activating, setActivating] = useState(false);
    const [linking, setLinking] = useState(false);
    const [financialsActive, setFinancialsActive] = useState(false);
    const [stripeAccountId, setStripeAccountId] = useState<string | null>(null);

    useEffect(() => {
        fetchProfile();
        // Check for success query param
        const params = new URLSearchParams(window.location.search);
        if (params.get('success') === 'true') {
            // Ideally we'd poll or wait for webhook here, but for now just refetch
            fetchProfile();
        }
    }, []);

    const fetchProfile = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', user.id)
                .single();

            if (error && error.code !== 'PGRST116') {
                console.error('Error fetching profile:', error);
            }

            if (data) {
                setFinancialsActive(data.financials_active);
                setStripeAccountId(data.stripe_account_id);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleActivate = async () => {
        setActivating(true);
        try {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) return;

            const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL || 'https://rwbyqcycgoyslkrwowja.supabase.co'}/functions/v1/stripe-connect/activate`, {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${session.access_token}`,
                    'Content-Type': 'application/json',
                },
            });

            const data = await response.json();

            if (!response.ok) {
                // If the backend returned an error status (400, 500), throw it
                throw new Error(data.error || 'Network response was not ok');
            }

            if (data.url) {
                window.location.href = data.url;
            } else {
                console.error("Missing URL in response:", data);
                alert(`Failed to get activation URL. Response: ${JSON.stringify(data)}`);
            }
        } catch (error) {
            console.error('Error activating:', error);
            alert(`An error occurred: ${error.message || error}`);
        } finally {
            setActivating(false);
        }
    };

    const handleLinkBank = async () => {
        setLinking(true);
        try {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) return;

            // 1. Get Client Secret
            const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL || 'https://rwbyqcycgoyslkrwowja.supabase.co'}/functions/v1/stripe-connect/financial-connection`, {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${session.access_token}`,
                    'Content-Type': 'application/json',
                },
            });
            const { client_secret } = await response.json();

            if (!client_secret) {
                throw new Error("Failed to get client secret");
            }

            // 2. Open Stripe Modal
            const stripe = await stripePromise;
            if (!stripe) return;

            const result = await stripe.collectFinancialConnectionsAccounts({
                clientSecret: client_secret,
            });

            if (result.error) {
                console.error(result.error.message);
            } else {
                // accounts linked successfully
                alert('Bank account linked successfully!');
                // You might want to save the linked account details or just refresh
            }

        } catch (error) {
            console.error('Error linking bank:', error);
        } finally {
            setLinking(false);
        }
    };

    if (loading) {
        return <div className="p-8 text-center text-white">Loading Financials...</div>;
    }

    return (
        <div className="p-8 max-w-4xl mx-auto space-y-8">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold tracking-tight text-white">Financials</h1>
                {financialsActive && (
                    <div className="flex items-center text-green-500 font-medium bg-green-500/10 px-3 py-1 rounded-full">
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Active
                    </div>
                )}
            </div>

            {!financialsActive ? (
                <Card className="border-zinc-800 bg-zinc-900/50">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Building2 className="w-6 h-6 text-blue-500" />
                            Activate Your Financial Account
                        </CardTitle>
                        <CardDescription className="text-zinc-400">
                            To start collecting rent and managing payments, you need to set up your financial account with Doorap.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="flex flex-col md:flex-row gap-4 items-center justify-between p-6 bg-zinc-950 rounded-lg border border-zinc-800">
                            <div className="space-y-2">
                                <h3 className="text-lg font-medium text-white">Get Started with Stripe</h3>
                                <p className="text-sm text-zinc-400 max-w-md">
                                    We partner with Stripe to provide secure payments and financial services. Activation takes just a few minutes.
                                </p>
                            </div>
                            <Button
                                onClick={handleActivate}
                                disabled={activating}
                                className="w-full md:w-auto bg-blue-600 hover:bg-blue-500 text-white font-semibold py-6 px-8 rounded-xl shadow-lg hover:scale-105 transition-all duration-200"
                            >
                                {activating ? 'Redirecting...' : 'Activate Financials'}
                                {!activating && <ExternalLink className="ml-2 w-4 h-4" />}
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid gap-6 md:grid-cols-2">
                    {/* Balance Card - Placeholder */}
                    <Card className="border-zinc-800 bg-zinc-900/50">
                        <CardHeader>
                            <CardTitle>Current Balance</CardTitle>
                            <CardDescription>Available for payout</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <p className="text-4xl font-bold text-white">$0.00</p>
                        </CardContent>
                    </Card>

                    {/* Bank Accounts Card */}
                    <Card className="border-zinc-800 bg-zinc-900/50">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Wallet className="w-5 h-5" />
                                Bank Accounts
                            </CardTitle>
                            <CardDescription>Manage linked accounts for payouts</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Button
                                onClick={handleLinkBank}
                                disabled={linking}
                                variant="outline"
                                className="w-full border-dashed border-2 py-8 hover:border-zinc-500 hover:bg-zinc-800/50"
                            >
                                {linking ? 'Opening...' : '+ Link Bank Account'}
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            )}
        </div>
    );
};

export default FinancialsPage;
