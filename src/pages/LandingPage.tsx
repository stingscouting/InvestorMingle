import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Mail, Building2, User } from 'lucide-react';

const LandingPage: React.FC = () => {
    const { sendLoginLink, getUserByEmail } = useAuth();
    const [email, setEmail] = useState('');
    const [formData, setFormData] = useState({
        name: '',
        company: '',
    });
    const [step, setStep] = useState<'email' | 'register' | 'success'>('email');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [registeredUser, setRegisteredUser] = useState<{ name: string } | null>(null);

    const handleContinue = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const cleanEmail = email.toLowerCase().trim();
            const user = await getUserByEmail(cleanEmail);
            if (user) {
                // Path 1: Pre-registered
                setRegisteredUser({ name: user.name });
                await sendLoginLink(cleanEmail);
                setStep('success');
            } else {
                // Path 2: New User
                setStep('register');
            }
        } catch (err: any) {
            console.error('Auth Error:', err);
            setError(err.message || 'Connection error. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            await sendLoginLink(email.toLowerCase().trim(), formData.name, formData.company);
            setStep('success');
        } catch (err: any) {
            setError(err.message || 'Failed to send magic link.');
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData(prev => ({
            ...prev,
            [e.target.name]: e.target.value,
        }));
    };

    return (
        <div className="min-h-screen flex items-center justify-center px-4 safe-top safe-bottom bg-gradient-to-br from-bg-primary via-bg-card to-bg-primary">
            <div className="max-w-md w-full animate-slide-up">
                {/* Logo */}
                <div className="flex justify-center mb-8">
                    <img
                        src="/sting-logo.jpg"
                        alt="Sting Logo"
                        className="w-24 h-24 object-contain rounded-2xl shadow-sm border border-border/20"
                    />
                </div>

                {/* Header */}
                <div className="text-center mb-8">
                    <h1 className="text-h1 mb-3">
                        Welcome to<br />
                        <span className="text-primary">Sting Climate Race</span>
                    </h1>
                    <p className="text-text-secondary">
                        Meet ten outstanding climate tech companies of Sting Climate Race 2025
                    </p>
                </div>

                {/* Registration Form */}
                <div className="bg-white rounded-3xl shadow-elevated p-8">
                    <div className="mb-6 text-center">
                        <h2 className="text-h2">
                            {step === 'email' ? 'Sign In' : step === 'register' ? 'Join Us' : 'Check your email'}
                        </h2>
                        {step === 'email' && (
                            <p className="text-text-secondary text-xs mt-2">
                                Please use the email you registered with. If you haven't registered, we'll help you do it now.
                            </p>
                        )}
                    </div>

                    {step === 'success' ? (
                        <div className="text-center space-y-4 animate-scale-up">
                            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Mail className="w-8 h-8 text-primary" />
                            </div>
                            <p className="text-text-primary font-medium">
                                Magic Link Sent!
                            </p>
                            <p className="text-text-secondary text-sm">
                                {registeredUser ? (
                                    <>Welcome back, <span className="font-bold text-primary">{registeredUser.name.split(' ')[0]}</span>. </>
                                ) : null}
                                We've sent a sign-in link to <span className="font-bold">{email}</span>.
                                Please check your inbox (and spam) to complete access.
                            </p>
                            <button
                                onClick={() => setStep('email')}
                                className="text-primary text-xs font-bold uppercase tracking-widest pt-4"
                            >
                                Use a different email
                            </button>
                        </div>
                    ) : (
                        <form onSubmit={step === 'email' ? handleContinue : handleRegister} className="space-y-4">
                            {/* Email Input (Always shown, disabled in step 2) */}
                            <div>
                                <label htmlFor="email" className="block text-sm font-medium text-text-primary mb-2">
                                    Email Address
                                </label>
                                <div className="relative">
                                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary">
                                        <Mail className="w-5 h-5" />
                                    </div>
                                    <input
                                        type="email"
                                        id="email"
                                        name="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        required
                                        disabled={step !== 'email'}
                                        className="input pl-12 disabled:opacity-50"
                                        placeholder="you@example.com"
                                    />
                                </div>
                            </div>

                            {step === 'register' && (
                                <div className="space-y-4 animate-slide-up">
                                    <div className="bg-primary/5 p-4 rounded-2xl text-xs text-primary font-medium leading-relaxed">
                                        We don't have you registered yet — let's add you to the event list!
                                    </div>
                                    {/* Name Input */}
                                    <div>
                                        <label htmlFor="name" className="block text-sm font-medium text-text-primary mb-2">
                                            Full Name
                                        </label>
                                        <div className="relative">
                                            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary">
                                                <User className="w-5 h-5" />
                                            </div>
                                            <input
                                                type="text"
                                                id="name"
                                                name="name"
                                                value={formData.name}
                                                onChange={handleChange}
                                                required
                                                className="input pl-12"
                                                placeholder="John Doe"
                                            />
                                        </div>
                                    </div>

                                    {/* Company Input */}
                                    <div>
                                        <label htmlFor="company" className="block text-sm font-medium text-text-primary mb-2">
                                            Company Name
                                        </label>
                                        <div className="relative">
                                            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary">
                                                <Building2 className="w-5 h-5" />
                                            </div>
                                            <input
                                                type="text"
                                                id="company"
                                                name="company"
                                                value={formData.company}
                                                onChange={handleChange}
                                                required
                                                className="input pl-12"
                                                placeholder="Your Company"
                                            />
                                        </div>
                                    </div>
                                </div>
                            )}

                            {error && (
                                <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4 text-red-700 text-sm">
                                    {error}
                                </div>
                            )}

                            {/* Action Button */}
                            <button
                                type="submit"
                                disabled={loading}
                                className="btn btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {loading ? (
                                    <span className="flex items-center justify-center gap-2">
                                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                        Processing...
                                    </span>
                                ) : (
                                    step === 'email' ? 'Continue' : 'Complete Registration'
                                )}
                            </button>
                        </form>
                    )}

                    <p className="text-[10px] text-text-secondary/40 text-center mt-8 uppercase tracking-[0.2em]">
                        Sting Climate Race 2025
                    </p>
                </div>
            </div>
        </div>
    );
};

export default LandingPage;
