import React from 'react';
import { useStartups } from '@/hooks/useStartups';
import { useLeaderboard } from '@/hooks/useVoting';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import BottomNav from '@/components/layout/BottomNav';

import { Trophy, MapPin } from 'lucide-react';
import { cn } from '@/utils/helpers';
import UserBadge from '@/components/layout/UserBadge';

const LeaderboardPage: React.FC = () => {
    const { startups, loading: startupsLoading } = useStartups();
    const { leaderboard, loading: leaderboardLoading } = useLeaderboard(startups);

    const loading = startupsLoading || leaderboardLoading;

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <LoadingSpinner size="lg" />
            </div>
        );
    }

    const hasAnyVotes = leaderboard.some(entry => entry.voteCount > 0);

    if (!hasAnyVotes) {
        return (
            <div className="min-h-screen pb-32 safe-top bg-[#FBFBFB] relative">
                <div className="absolute top-4 right-4 z-50">
                    <UserBadge />
                </div>

                <div className="max-w-2xl mx-auto px-4 pt-48 pb-8 text-center animate-fade-in">
                    <div className="w-24 h-24 bg-primary/5 rounded-full flex items-center justify-center mx-auto mb-8">
                        <Trophy className="w-12 h-12 text-primary opacity-20" />
                    </div>
                    <h1 className="text-4xl font-bold text-text-primary mb-4">Results Pending</h1>
                    <p className="text-text-secondary max-w-sm mx-auto leading-relaxed">
                        The leaderboard will go live once the first votes are cast. Stay tuned for the results!
                    </p>
                </div>
                <BottomNav />
            </div>
        );
    }

    const topThree = leaderboard.slice(0, 3);
    const remaining = leaderboard.slice(3);

    // Reorder top three for podium display: [2nd, 1st, 3rd]
    const podiumOrder = topThree.length >= 3
        ? [topThree[1], topThree[0], topThree[2]]
        : topThree.length === 2
            ? [topThree[1], topThree[0]]
            : topThree;

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
                    <h1 className="text-4xl sm:text-5xl font-bold mb-3 tracking-tight">Leaderboard</h1>
                    <div className="flex items-center justify-center gap-2 text-white/70">
                        <MapPin className="w-4 h-4" />
                        <span className="text-sm font-medium tracking-wide uppercase">Stockholm / 2026</span>
                    </div>
                </div>
            </div>

            {/* Podium Section */}
            <div className="max-w-2xl mx-auto px-4 pt-12 pb-8">
                <div className="flex items-end justify-center gap-1 sm:gap-4 h-[420px]">
                    {podiumOrder.map((entry) => {
                        const rank = entry.rank;
                        const isFirst = rank === 1;
                        const isSecond = rank === 2;

                        // Podium height and styling
                        const height = isFirst ? 'h-48' : isSecond ? 'h-36' : 'h-28';
                        const order = isFirst ? 'order-2' : isSecond ? 'order-1' : 'order-3';
                        const badgeColor = isFirst ? 'bg-[#FFD700]' : isSecond ? 'bg-[#C0C0C0]' : 'bg-[#CD7F32]';

                        return (
                            <div key={entry.startup.id} className={`flex flex-col items-center flex-1 ${order} animate-slide-up`}>
                                {/* Avatar/Logo with Rank Badge */}
                                <div className="relative mb-6">
                                    <div className={cn(
                                        "rounded-full p-2 border-4 bg-white shadow-premium",
                                        isFirst ? "w-36 h-36 border-primary/20" : "w-24 h-24 border-border/40"
                                    )}>
                                        <div className="w-full h-full rounded-full overflow-hidden bg-bg-card flex items-center justify-center">
                                            {entry.startup.logo ? (
                                                <img src={entry.startup.logo} alt={entry.startup.name} className="w-full h-full object-contain" />
                                            ) : (
                                                <span className={cn("font-bold text-primary", isFirst ? "text-4xl" : "text-2xl")}>
                                                    {entry.startup.name.charAt(0)}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                    {/* Rank Badge overlay */}
                                    <div className={cn(
                                        "absolute -top-1 -right-1 w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-sm border-2 border-white",
                                        badgeColor
                                    )}>
                                        {rank}
                                    </div>
                                </div>

                                {/* Name and Score */}
                                <div className="text-center mb-4">
                                    <p className={cn("font-bold text-text-primary line-clamp-1 mb-2", isFirst ? "text-lg" : "text-sm")}>
                                        {entry.startup.name}
                                    </p>
                                    <div className="inline-flex items-center bg-primary/10 rounded-xl px-3 py-1 gap-1.5">
                                        <Trophy className="w-3 h-3 text-primary" />
                                        <span className="text-sm font-bold text-primary">{entry.voteCount}</span>
                                    </div>
                                </div>

                                {/* 3D Podium Block */}
                                <div className={cn(
                                    "w-full rounded-t-2xl flex items-center justify-center relative overflow-hidden",
                                    height,
                                    isFirst ? "bg-gradient-to-b from-primary/30 to-primary/10" : "bg-gradient-to-b from-border/40 to-border/10"
                                )}>
                                    <span className="text-6xl font-black text-primary/10 select-none">
                                        {rank}
                                    </span>
                                    {/* Top face highlight */}
                                    <div className="absolute top-0 left-0 right-0 h-1 bg-white/20" />
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Remaining Rankings List */}
            <div className="max-w-2xl mx-auto px-4 pb-12">
                <div className="bg-white rounded-[32px] shadow-elevated overflow-hidden border border-border/30">
                    {remaining.map((entry, index) => (
                        <div
                            key={entry.startup.id}
                            className={cn(
                                "flex items-center gap-4 px-6 py-5 transition-colors",
                                index !== remaining.length - 1 && "border-b border-border/30"
                            )}
                        >
                            <span className="w-6 text-lg font-bold text-text-secondary/50">{entry.rank}</span>

                            <div className="w-16 h-16 rounded-2xl bg-bg-card overflow-hidden flex items-center justify-center flex-shrink-0 p-2 border border-border/20">
                                {entry.startup.logo ? (
                                    <img src={entry.startup.logo} alt={entry.startup.name} className="w-full h-full object-contain" />
                                ) : (
                                    <span className="text-xl font-bold text-primary">{entry.startup.name.charAt(0)}</span>
                                )}
                            </div>

                            <div className="flex-1 min-w-0">
                                <h4 className="font-bold text-text-primary text-lg truncate">{entry.startup.name}</h4>
                            </div>

                            <div className="flex items-center bg-bg-card rounded-lg px-3 py-1.5 gap-2">
                                <Trophy className="w-3.5 h-3.5 text-primary opacity-60" />
                                <span className="font-bold text-primary">{entry.voteCount}</span>
                            </div>
                        </div>
                    ))}
                    {remaining.length === 0 && (
                        <div className="py-12 text-center text-text-secondary/60 italic">
                            Full rankings will appear once more votes are cast
                        </div>
                    )}
                </div>
            </div>

            <BottomNav />
        </div>
    );
};

export default LeaderboardPage;
