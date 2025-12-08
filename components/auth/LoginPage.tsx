
import React, { useState } from 'react';
import { supabase } from '../../src/lib/supabase';
import Button from '../common/Button';
import Input from '../common/Input'; // Assuming this exists, if not I'll standard input
import { UserProfile } from '../../types';

// Icons
const CheckCircleIcon = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
        <path fillRule="evenodd" d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12zm13.36-1.814a.75.75 0 10-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 00-1.06 1.06l2.25 2.25a.75.75 0 001.14-.094l3.75-5.25z" clipRule="evenodd" />
    </svg>
);

const BuildingOfficeIcon = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 21h16.5M4.5 3h15M5.25 3v18m13.5-18v18M9 6.75h1.5m-1.5 3h1.5m-1.5 3h1.5m3-6H15m-1.5 3H15m-1.5 3H15M9 21v-3.375c0-.621.504-1.125 1.125-1.125h3.75c.621 0 1.125.504 1.125 1.125V21" />
    </svg>
);

const UserIcon = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
    </svg>
);


const LoginPage = () => {
    const [step, setStep] = useState(1);
    const [role, setRole] = useState<'self_managing' | 'company' | null>(null);

    // Form State
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [phone, setPhone] = useState('');

    // Company Details
    const [companyName, setCompanyName] = useState('');
    const [website, setWebsite] = useState('');
    const [companyAddress, setCompanyAddress] = useState('');
    const [regNumber, setRegNumber] = useState('');
    const [jobTitle, setJobTitle] = useState('');

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isLogin, setIsLogin] = useState(false); // Toggle between Sign Up flow and Login

    // Handle Login separately
    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        try {
            const { error } = await supabase.auth.signInWithPassword({ email, password });
            if (error) throw error;
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleSignUp = async () => {
        setLoading(true);
        setError(null);

        try {
            // 1. Sign Up
            const { data: authData, error: authError } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    data: {
                        first_name: firstName,
                        last_name: lastName,
                        role: role,
                        company_name: companyName, // Metadata
                    },
                },
            });

            if (authError) throw authError;

            if (authData.user) {
                // 2. Insert into user_profiles
                // We do this to ensure data is strictly typed and available in our tables
                // even if a trigger exists, an upsert is safe.
                const profileData = {
                    id: authData.user.id,
                    name: `${firstName} ${lastName}`,
                    email: email,
                    company_name: companyName || null,
                    phone: phone || null,
                    company_address: companyAddress || null,
                    company_reg_no: regNumber || null,
                    website: website || null,
                    job_title: jobTitle || null,
                    // If role is company, we assume they might want data feed enabled later
                    stripe_data_feed_enabled: false,
                    role: role, // Persist the selected role
                };

                const { error: profileError } = await supabase
                    .from('user_profiles')
                    .upsert(profileData);

                if (profileError) {
                    console.error("Error creating profile:", profileError);
                    // We don't block the user here, but it's good to know.
                    // Logic can continue effectively.
                }
            }

            setStep(4); // Move to verification step
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    // --- Render Helpers ---

    // Check if we are in Login Mode
    if (isLogin) {
        return (
            <div className="min-h-screen bg-white flex">
                {/* Left Side - Testimonials (Hidden on mobile) */}
                <div className="hidden lg:flex w-1/2 bg-zinc-50 border-r border-zinc-200 p-12 flex-col justify-between">
                    <div>
                        <div className="flex items-center mb-12">
                            <img
                                src="https://raw.githubusercontent.com/WithSukani/DoorapLogo/4410b95b0d102d0b556e4ec9e42200a697751202/Black%20.png"
                                alt="Doorap Logo"
                                className="h-10 w-auto object-contain"
                            />
                        </div>

                        <div className="max-w-md">
                            <div className="inline-flex items-center px-3 py-1 rounded-full bg-green-100 text-green-800 text-xs font-medium mb-6">
                                INTELLIGENT PROPERTY MANAGEMENT
                            </div>
                            <h1 className="text-5xl font-bold tracking-tight text-zinc-900 mb-6 leading-tight">
                                Property management. Solved in one tap.
                            </h1>
                            <p className="text-lg text-zinc-500 mb-8">
                                Your portfolio, on autopilot. Automate the admin, compliance, and coordination.
                            </p>
                        </div>
                    </div>

                    {/* Testimonial Card */}
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-zinc-100">
                        <div className="flex gap-1 mb-4">
                            {[1, 2, 3, 4, 5].map(i => <span key={i} className="text-black text-sm">★</span>)}
                        </div>
                        <p className="text-zinc-900 font-medium mb-4">
                            "Finally, software that actually looks good and makes sense."
                        </p>
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center text-white text-xs">E</div>
                            <div>
                                <div className="text-xs font-bold text-zinc-900">Elena Rodriguez</div>
                                <div className="text-[10px] text-zinc-500 uppercase tracking-wider">LANDLORD, 15 UNITS</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Side - Login Form */}
                <div className="w-full lg:w-1/2 flex flex-col justify-center items-center p-8">
                    <div className="w-full max-w-sm">
                        <h2 className="text-2xl font-bold text-zinc-900 mb-2">Welcome back</h2>
                        <p className="text-zinc-600 mb-8">Please enter your details to sign in.</p>

                        <form onSubmit={handleLogin} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-zinc-700 mb-1">Email</label>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={e => setEmail(e.target.value)}
                                    className="w-full rounded-lg border-zinc-200 focus:border-black focus:ring-black"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-zinc-700 mb-1">Password</label>
                                <input
                                    type="password"
                                    value={password}
                                    onChange={e => setPassword(e.target.value)}
                                    className="w-full rounded-lg border-zinc-200 focus:border-black focus:ring-black"
                                    required
                                />
                            </div>

                            {error && <div className="text-red-600 text-sm">{error}</div>}

                            <Button variant="primary" type="submit" className="w-full justify-center bg-black text-white hover:bg-zinc-800" disabled={loading}>
                                {loading ? 'Signing in...' : 'Sign in'}
                            </Button>
                        </form>

                        <p className="mt-6 text-center text-sm text-zinc-600">
                            Don't have an account?{' '}
                            <button onClick={() => setIsLogin(false)} className="font-medium text-black hover:underline">
                                Sign up for free
                            </button>
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    // --- Sign Up Wizard Steps ---

    const renderStep = () => {
        switch (step) {
            case 1: // Role Selection
                return (
                    <div className="max-w-md w-full">
                        <div className="mb-8">
                            <span className="text-xs font-semibold tracking-wider text-zinc-500 uppercase">Step 1 of 3</span>
                            <div className="w-full bg-zinc-100 h-1 mt-2 rounded-full overflow-hidden">
                                <div className="bg-black h-full w-1/3 rounded-full"></div>
                            </div>
                        </div>

                        <h2 className="text-2xl font-bold text-zinc-900 mb-2">Which best describes you?</h2>
                        <p className="text-zinc-600 mb-8">We'll customize your Doorap experience based on your needs.</p>

                        <div className="space-y-4">
                            <button
                                onClick={() => setRole('self_managing')}
                                className={`w-full flex items-center p-4 border rounded-xl transition-all ${role === 'self_managing' ? 'border-black ring-1 ring-black bg-zinc-50' : 'border-zinc-200 hover:border-zinc-300'}`}
                            >
                                <div className="w-10 h-10 rounded-lg bg-zinc-100 flex items-center justify-center text-zinc-600 mr-4">
                                    <UserIcon className="w-6 h-6" />
                                </div>
                                <div className="text-left flex-1">
                                    <div className="font-semibold text-zinc-900">Self-Managing</div>
                                    <div className="text-sm text-zinc-500">I own and manage my own property portfolio personally.</div>
                                </div>
                                <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${role === 'self_managing' ? 'border-black' : 'border-zinc-300'}`}>
                                    {role === 'self_managing' && <div className="w-3 h-3 bg-black rounded-full" />}
                                </div>
                            </button>

                            <button
                                onClick={() => setRole('company')}
                                className={`w-full flex items-center p-4 border rounded-xl transition-all ${role === 'company' ? 'border-black ring-1 ring-black bg-zinc-50' : 'border-zinc-200 hover:border-zinc-300'}`}
                            >
                                <div className="w-10 h-10 rounded-lg bg-zinc-100 flex items-center justify-center text-zinc-600 mr-4">
                                    <BuildingOfficeIcon className="w-6 h-6" />
                                </div>
                                <div className="text-left flex-1">
                                    <div className="font-semibold text-zinc-900">Company / Agency</div>
                                    <div className="text-sm text-zinc-500">For Agencies, BTR, Rent-to-Rent & Corporate Portfolios.</div>
                                </div>
                                <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${role === 'company' ? 'border-black' : 'border-zinc-300'}`}>
                                    {role === 'company' && <div className="w-3 h-3 bg-black rounded-full" />}
                                </div>
                            </button>
                        </div>

                        <Button
                            onClick={() => role && setStep(2)}
                            disabled={!role}
                            className="w-full mt-8 bg-black text-white hover:bg-zinc-800 justify-center py-3"
                        >
                            Continue &rarr;
                        </Button>

                        <p className="mt-6 text-center text-sm text-zinc-600">
                            Already have an account?{' '}
                            <button onClick={() => setIsLogin(true)} className="font-medium text-black hover:underline">
                                Log in
                            </button>
                        </p>
                    </div>
                );

            case 2: // Account Info
                return (
                    <div className="max-w-md w-full">
                        <button onClick={() => setStep(1)} className="text-sm text-zinc-500 hover:text-black mb-6 flex items-center">
                            &larr; Back
                        </button>

                        <div className="mb-8">
                            <span className="text-xs font-semibold tracking-wider text-zinc-500 uppercase">Step 2 of 3</span>
                            <div className="w-full bg-zinc-100 h-1 mt-2 rounded-full overflow-hidden">
                                <div className="bg-black h-full w-2/3 rounded-full"></div>
                            </div>
                        </div>

                        <h2 className="text-2xl font-bold text-zinc-900 mb-2">Create your account</h2>
                        <p className="text-zinc-600 mb-8">Start managing your properties smarter today.</p>

                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-zinc-700 mb-1">First Name</label>
                                    <input
                                        type="text"
                                        value={firstName}
                                        onChange={e => setFirstName(e.target.value)}
                                        placeholder="John"
                                        className="w-full rounded-lg border-zinc-200 focus:border-black focus:ring-black"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-zinc-700 mb-1">Last Name</label>
                                    <input
                                        type="text"
                                        value={lastName}
                                        onChange={e => setLastName(e.target.value)}
                                        placeholder="Doe"
                                        className="w-full rounded-lg border-zinc-200 focus:border-black focus:ring-black"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-zinc-700 mb-1">Work Email</label>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={e => setEmail(e.target.value)}
                                    placeholder="john@company.com"
                                    className="w-full rounded-lg border-zinc-200 focus:border-black focus:ring-black"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-zinc-700 mb-1">Phone Number <span className="ml-2 text-[10px] bg-blue-100 text-blue-800 px-1.5 py-0.5 rounded uppercase tracking-wide">Required</span></label>
                                <input
                                    type="tel"
                                    value={phone}
                                    onChange={e => setPhone(e.target.value)}
                                    placeholder="+1 (555) 000-0000"
                                    className="w-full rounded-lg border-zinc-200 focus:border-black focus:ring-black"
                                />
                                <p className="text-xs text-zinc-500 mt-1 flex items-center">
                                    <span className="mr-1">🔒</span> We use this for Dori AI emergency alerts and security verification.
                                </p>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-zinc-700 mb-1">Password</label>
                                <input
                                    type="password"
                                    value={password}
                                    onChange={e => setPassword(e.target.value)}
                                    placeholder="Create a strong password"
                                    className="w-full rounded-lg border-zinc-200 focus:border-black focus:ring-black"
                                />
                            </div>
                        </div>

                        <Button
                            onClick={() => {
                                if (role === 'company') {
                                    setStep(3);
                                } else {
                                    handleSignUp();
                                }
                            }}
                            disabled={!email || !password || !firstName || !lastName || !phone}
                            className="w-full mt-8 bg-black text-white hover:bg-zinc-800 justify-center py-3"
                        >
                            {role === 'company' ? 'Continue →' : (loading ? 'Creating Account...' : 'Complete Setup')}
                        </Button>
                    </div>
                );

            case 3: // Company Info
                return (
                    <div className="max-w-md w-full">
                        <button onClick={() => setStep(2)} className="text-sm text-zinc-500 hover:text-black mb-6 flex items-center">
                            &larr; Back
                        </button>

                        <div className="mb-8">
                            <span className="text-xs font-semibold tracking-wider text-zinc-500 uppercase">Step 3 of 3</span>
                            <div className="w-full bg-zinc-100 h-1 mt-2 rounded-full overflow-hidden">
                                <div className="bg-black h-full w-full rounded-full"></div>
                            </div>
                        </div>

                        <h2 className="text-2xl font-bold text-zinc-900 mb-2">Tell us about your agency</h2>
                        <p className="text-zinc-600 mb-8">Help us set up your professional workspace.</p>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-zinc-700 mb-1">Company Name</label>
                                <input
                                    type="text"
                                    value={companyName}
                                    onChange={e => setCompanyName(e.target.value)}
                                    placeholder="Acme Estates Ltd."
                                    className="w-full rounded-lg border-zinc-200 focus:border-black focus:ring-black"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-zinc-700 mb-1">Company Website</label>
                                <div className="relative">
                                    <span className="absolute left-3 top-2.5 text-zinc-400">🌐</span>
                                    <input
                                        type="text"
                                        value={website}
                                        onChange={e => setWebsite(e.target.value)}
                                        placeholder="https://acme-estates.com"
                                        className="w-full rounded-lg border-zinc-200 pl-9 focus:border-black focus:ring-black"
                                    />
                                </div>
                                <p className="text-xs text-zinc-400 mt-1">Optional - helps us fetch your logo</p>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-zinc-700 mb-1">Company Address</label>
                                <div className="relative">
                                    <span className="absolute left-3 top-2.5 text-zinc-400">📍</span>
                                    <input
                                        type="text"
                                        value={companyAddress}
                                        onChange={e => setCompanyAddress(e.target.value)}
                                        placeholder="123 Business Park, London"
                                        className="w-full rounded-lg border-zinc-200 pl-9 focus:border-black focus:ring-black"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-zinc-700 mb-1">Company Number</label>
                                    <div className="relative">
                                        <span className="absolute left-3 top-2.5 text-zinc-400">#</span>
                                        <input
                                            type="text"
                                            value={regNumber}
                                            onChange={e => setRegNumber(e.target.value)}
                                            placeholder="Main switchboard"
                                            className="w-full rounded-lg border-zinc-200 pl-9 focus:border-black focus:ring-black"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-zinc-700 mb-1">Reg. Number</label>
                                    <div className="relative">
                                        <span className="absolute left-3 top-2.5 text-zinc-400">📄</span>
                                        <input
                                            type="text"
                                            placeholder="Registration No."
                                            className="w-full rounded-lg border-zinc-200 pl-9 focus:border-black focus:ring-black"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-zinc-700 mb-1">Your Job Title</label>
                                <div className="relative">
                                    <span className="absolute left-3 top-2.5 text-zinc-400">💼</span>
                                    <input
                                        type="text"
                                        value={jobTitle}
                                        onChange={e => setJobTitle(e.target.value)}
                                        placeholder="e.g. Director, Property Manager"
                                        className="w-full rounded-lg border-zinc-200 pl-9 focus:border-black focus:ring-black"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="mt-6 flex items-start bg-zinc-50 p-3 rounded-lg">
                            <div className="flex items-center h-5">
                                <input id="terms" type="checkbox" className="h-4 w-4 text-black border-zinc-300 rounded focus:ring-black" />
                            </div>
                            <div className="ml-3 text-xs text-zinc-600">
                                I agree to the <span className="font-semibold text-zinc-900">Terms of Service</span> and <span className="font-semibold text-zinc-900">Privacy Policy</span>. I understand that my data will be processed in accordance with these policies.
                            </div>
                        </div>

                        {error && <div className="text-red-600 text-sm mt-4">{error}</div>}

                        <Button
                            onClick={handleSignUp}
                            disabled={loading}
                            className="w-full mt-8 bg-black text-white hover:bg-zinc-800 justify-center py-3"
                        >
                            {loading ? 'Processing...' : 'Complete Setup'}
                        </Button>
                    </div>
                );


            case 4: // Verification
                return (
                    <div className="max-w-md w-full text-center">
                        <div className="mb-8 flex justify-center">
                            <div className="w-16 h-16 bg-zinc-100 rounded-2xl flex items-center justify-center">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8 text-black">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                                </svg>
                            </div>
                        </div>

                        <h2 className="text-2xl font-bold text-zinc-900 mb-2">Verify your email</h2>
                        <p className="text-zinc-600 mb-8">
                            We've sent a verification link to <span className="font-medium text-zinc-900">{email}</span>.
                            Please click the link to activate your account.
                        </p>

                        <div className="bg-blue-50 text-blue-800 p-4 rounded-lg text-sm mb-8 flex items-start text-left">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 mr-2 mt-0.5 flex-shrink-0">
                                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                            </svg>
                            Please check your spam folder if you don't see the email within a minute.
                        </div>

                        <Button
                            onClick={() => setIsLogin(true)}
                            variant="outline"
                            className="w-full justify-center"
                        >
                            Back to Login
                        </Button>
                    </div>
                );

            default:
                return null;
        }
    };

    return (
        <div className="min-h-screen bg-white flex">
            {/* Left Side - Testimonials */}
            <div className="hidden lg:flex w-1/2 bg-zinc-50 border-r border-zinc-200 p-12 flex-col justify-between">
                <div>
                    <div className="flex items-center mb-12">
                        <img
                            src="https://raw.githubusercontent.com/WithSukani/DoorapLogo/4410b95b0d102d0b556e4ec9e42200a697751202/Black%20.png"
                            alt="Doorap Logo"
                            className="h-10 w-auto object-contain"
                        />
                    </div>

                    <div className="max-w-md">
                        <div className="inline-flex items-center px-3 py-1 rounded-full bg-green-100 text-green-800 text-[10px] font-bold tracking-wide mb-6">
                            <span className="w-1.5 h-1.5 bg-green-500 rounded-full mr-2"></span>
                            INTELLIGENT PROPERTY MANAGEMENT
                        </div>
                        <h1 className="text-5xl font-bold tracking-tight text-zinc-900 mb-6 leading-tight">
                            Property management. Solved in one tap.
                        </h1>
                        <p className="text-lg text-zinc-500 mb-8">
                            Your portfolio, on autopilot. Automate the admin, compliance, and coordination.
                        </p>
                    </div>
                </div>

                {/* Carousel Effect for Testimonials */}
                <div className="space-y-4">
                    {/* Testimonial 1 */}
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-zinc-100 transform transition hover:scale-105 duration-300">
                        <div className="flex gap-1 mb-4">
                            {[1, 2, 3, 4, 5].map(i => <span key={i} className="text-black text-sm">★</span>)}
                        </div>
                        <p className="text-zinc-900 font-medium mb-4">
                            "The standard for modern agencies. It simply works."
                        </p>
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center text-white text-xs font-bold">S</div>
                            <div>
                                <div className="text-xs font-bold text-zinc-900">Sarah Jenkins</div>
                                <div className="text-[10px] text-zinc-500 uppercase tracking-wider">DIRECTOR, GLOBAL REALTY</div>
                            </div>
                        </div>
                    </div>

                    {/* Testimonial 2 */}
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-zinc-100 opacity-60 hover:opacity-100 transition duration-300">
                        <div className="flex gap-1 mb-4">
                            {[1, 2, 3, 4, 5].map(i => <span key={i} className="text-black text-sm">★</span>)}
                        </div>
                        <p className="text-zinc-900 font-medium mb-4">
                            "We've reduced admin time by 40% in just two months."
                        </p>
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center text-white text-xs font-bold">J</div>
                            <div>
                                <div className="text-xs font-bold text-zinc-900">James Wilson</div>
                                <div className="text-[10px] text-zinc-500 uppercase tracking-wider">PROPERTY MANAGER, URBAN STAY</div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="text-xs text-zinc-400 mt-8">
                    © 2024 DOORAP INC.
                </div>
            </div>

            {/* Right Side - Wizard */}
            <div className="w-full lg:w-1/2 flex flex-col justify-center items-center p-8 bg-white text-left">
                {renderStep()}
            </div>
        </div>
    );
};

export default LoginPage;
