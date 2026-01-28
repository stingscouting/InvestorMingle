import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

const CompleteSignIn: React.FC = () => {
    const navigate = useNavigate();
    const { completeSignIn } = useAuth();
    const [error, setError] = useState('');
    const [emailFallback, setEmailFallback] = useState('');
    const [showFallback, setShowFallback] = useState(false);

    const handleSignIn = async () => {
        try {
            setError('');
            // If we are showing fallback, we might need to pass the email somewhere or rely on AuthContext finding it
            // Actually, I'll update AuthContext to take an optional email param for completion
            await completeSignIn();
            navigate('/startups', { replace: true });
        } catch (err: any) {
            if (err.message.includes('Email is required')) {
                setShowFallback(true);
            } else {
                setError(err.message || 'Failed to complete sign-in');
            }
        }
    };

    useEffect(() => {
        handleSignIn();
    }, []);

    const handleSubmitFallback = (e: React.FormEvent) => {
        e.preventDefault();
        window.localStorage.setItem('emailForSignIn', emailFallback);
        setShowFallback(false);
        handleSignIn();
    };

    if (showFallback) {
        return (
            <div className="min-h-screen flex items-center justify-center px-4 bg-bg-primary">
                <div className="max-w-md w-full text-center">
                    <div className="bg-white rounded-3xl shadow-elevated p-8">
                        <h1 className="text-h2 mb-4">Confirm Your Email</h1>
                        <p className="text-text-secondary mb-6 text-sm">
                            To complete your secure sign-in, please confirm the email address you used.
                        </p>
                        <form onSubmit={handleSubmitFallback} className="space-y-4">
                            <input
                                type="email"
                                value={emailFallback}
                                onChange={(e) => setEmailFallback(e.target.value)}
                                placeholder="you@example.com"
                                required
                                className="input"
                            />
                            <button type="submit" className="btn btn-primary w-full">
                                Complete Sign-In
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center px-4">
                <div className="max-w-md w-full text-center">
                    <div className="bg-white rounded-3xl shadow-elevated p-8">
                        <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                            <span className="text-4xl">❌</span>
                        </div>
                        <h1 className="text-h1 mb-4">Sign-In Failed</h1>
                        <p className="text-text-secondary mb-6">{error}</p>
                        <button
                            onClick={() => navigate('/')}
                            className="btn btn-primary"
                        >
                            Back to Login
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center px-4">
            <div className="max-w-md w-full text-center">
                <div className="bg-white rounded-3xl shadow-elevated p-8">
                    <div className="w-20 h-20 bg-primary rounded-full flex items-center justify-center mx-auto mb-6">
                        <div className="w-12 h-12 border-4 border-white border-t-transparent rounded-full animate-spin" />
                    </div>
                    <h1 className="text-h1 mb-4">Completing Sign-In</h1>
                    <p className="text-text-secondary">Please wait while we verify your email...</p>
                </div>
            </div>
        </div>
    );
};

export default CompleteSignIn;
