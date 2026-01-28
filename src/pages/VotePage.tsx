import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStartups } from '@/hooks/useStartups';
import { useVoting } from '@/hooks/useVoting';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import Toast, { ToastType } from '@/components/common/Toast';
import BottomNav from '@/components/layout/BottomNav';

import { CheckCircle } from 'lucide-react';
import { cn } from '@/utils/helpers';
import UserBadge from '@/components/layout/UserBadge';

const VotePage: React.FC = () => {
    const navigate = useNavigate();
    const { startups, loading: startupsLoading } = useStartups();
    const { hasVoted, submitVote, userVote } = useVoting();
    const [selectedStartupId, setSelectedStartupId] = useState<string | null>(null);
    const [submitting, setSubmitting] = useState(false);
    const [toast, setToast] = useState<{ message: string; type: ToastType } | null>(null);

    const handleSubmitVote = async () => {
        if (!selectedStartupId) return;

        setSubmitting(true);
        try {
            await submitVote(selectedStartupId);
            setToast({
                message: 'Vote submitted successfully!',
                type: 'success',
            });

            // Redirect to leaderboard after a short delay
            setTimeout(() => {
                navigate('/leaderboard');
            }, 1500);
        } catch (error) {
            setToast({
                message: 'Failed to submit vote. Please try again.',
                type: 'error',
            });
            setSubmitting(false);
        }
    };

    if (startupsLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <LoadingSpinner size="lg" />
            </div>
        );
    }

    if (hasVoted) {
        const votedStartup = startups.find(s => s.id === userVote?.startupId);

        return (
            <div className="min-h-screen pb-20 safe-top bg-bg-primary flex flex-col items-center relative">
                {/* Top Right User Identity */}
                <div className="absolute top-4 right-4 z-50">
                    <UserBadge />
                </div>

                <div className="w-full max-w-2xl px-4 py-20 text-center animate-scale-up">
                    <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-8 relative">
                        <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full" />
                        <CheckCircle className="w-12 h-12 text-primary relative z-10" />
                    </div>
                    <h1 className="text-4xl font-bold text-text-primary mb-4">Vote Submitted!</h1>
                    <p className="text-text-secondary text-lg mb-2">
                        Thank you for participating in the Sting Climate Race Investor Mingle
                    </p>
                    <p className="text-text-secondary text-lg mb-8">
                        You voted for: <span className="text-primary font-bold">{votedStartup?.name}</span>
                    </p>
                    <button
                        onClick={() => navigate('/leaderboard')}
                        className="w-full sm:w-auto px-10 py-4 bg-primary text-white rounded-2xl font-bold shadow-premium hover:opacity-90 transition-all active:scale-95"
                    >
                        View Public Leaderboard
                    </button>
                </div>
                <BottomNav />
            </div>
        );
    }

    return (
        <div className="min-h-screen pb-32 safe-top bg-[#FBFBFB] relative">
            {/* Top Right User Identity */}
            <div className="absolute top-6 right-6 z-50">
                <UserBadge />
            </div>

            {/* Premium Header with solid background */}
            <div className="bg-primary text-white pt-24 pb-20 px-4 text-center relative overflow-hidden">
                {/* Background Decor */}
                <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-white/5 rounded-full blur-3xl pointer-events-none" />
                <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-48 h-48 bg-white/5 rounded-full blur-2xl pointer-events-none" />

                <div className="max-w-4xl mx-auto relative z-10 animate-fade-in">
                    <h1 className="text-4xl sm:text-5xl font-bold mb-3 tracking-tight">Who Won the Stage?</h1>
                    <div className="flex items-center justify-center gap-2 text-white/70">
                        <span className="text-sm font-medium tracking-wide uppercase">Decide the winner of the Sting Climate Race</span>
                    </div>
                </div>
            </div>

            {/* Voting List */}
            <div className="max-w-2xl mx-auto px-4 py-8 space-y-4">
                {startups.map((startup) => (
                    <button
                        key={startup.id}
                        onClick={() => setSelectedStartupId(startup.id)}
                        className={cn(
                            'w-full p-6 rounded-[32px] text-left transition-all duration-300 relative group',
                            selectedStartupId === startup.id
                                ? 'bg-white shadow-elevated border-2 border-primary/20 scale-[1.02]'
                                : 'bg-bg-card hover:bg-white hover:shadow-card'
                        )}
                    >
                        <div className="flex items-center gap-6">
                            {/* Custom Radio */}
                            <div
                                className={cn(
                                    'w-7 h-7 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all duration-300',
                                    selectedStartupId === startup.id
                                        ? 'border-primary bg-primary'
                                        : 'border-text-secondary/20'
                                )}
                            >
                                {selectedStartupId === startup.id && (
                                    <div className="w-2.5 h-2.5 bg-white rounded-full animate-scale-up" />
                                )}
                            </div>

                            {/* Logo */}
                            <div className="w-20 h-20 rounded-2xl bg-white shadow-sm overflow-hidden flex items-center justify-center flex-shrink-0 p-2 border border-border/40">
                                {startup.logo ? (
                                    <img
                                        src={startup.logo}
                                        alt={startup.name}
                                        className="w-full h-full object-contain"
                                    />
                                ) : (
                                    <span className="text-2xl font-bold text-primary">
                                        {startup.name.charAt(0)}
                                    </span>
                                )}
                            </div>

                            {/* Info */}
                            <div className="flex-1 min-w-0">
                                <h3 className="text-2xl font-bold text-text-primary mb-0.5 group-hover:text-primary transition-colors">
                                    {startup.name}
                                </h3>
                            </div>
                        </div>

                        {selectedStartupId === startup.id && (
                            <div className="absolute inset-0 bg-primary/5 rounded-[32px] pointer-events-none" />
                        )}
                    </button>
                ))}
            </div>

            {/* Submit Action */}
            <div className="fixed bottom-20 left-0 right-0 z-40 px-4 pb-8 pt-10 bg-gradient-to-t from-bg-primary via-bg-primary/95 to-transparent">
                <div className="max-w-2xl mx-auto">
                    <button
                        onClick={handleSubmitVote}
                        disabled={!selectedStartupId || submitting}
                        className="w-full py-5 rounded-2xl bg-primary text-white font-bold text-lg shadow-premium disabled:opacity-40 disabled:grayscale transition-all active:scale-[0.98]"
                    >
                        {submitting ? (
                            <span className="flex items-center justify-center gap-3">
                                <div className="w-6 h-6 border-3 border-white/30 border-t-white rounded-full animate-spin" />
                                Processing Vote...
                            </span>
                        ) : (
                            'Confirm your winner'
                        )}
                    </button>
                </div>
            </div>

            <BottomNav />


            {toast && (
                <Toast
                    message={toast.message}
                    type={toast.type}
                    onClose={() => setToast(null)}
                />
            )}
        </div>
    );
};

export default VotePage;
