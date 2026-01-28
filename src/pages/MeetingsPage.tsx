import React, { useMemo } from 'react';
import { useMeetingRequests } from '@/hooks/useMeetingRequests';
import { useStartups } from '@/hooks/useStartups';
import BottomNav from '@/components/layout/BottomNav';
import UserBadge from '@/components/layout/UserBadge';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import { Calendar, MapPin, Building2 } from 'lucide-react';

const MeetingsPage: React.FC = () => {
    const { startups, loading: startupsLoading } = useStartups();
    const { meetingRequests, loading: meetingsLoading, toggleMeetingRequest } = useMeetingRequests();

    const loading = startupsLoading || meetingsLoading;

    // Join meeting requests with startup data
    const requestedMeetings = useMemo(() => {
        return meetingRequests
            .map(request => {
                const startup = startups.find(s => s.id === request.startupId);
                return {
                    ...request,
                    startup
                };
            })
            .filter(item => item.startup) // Ensure we only show meetings with valid startup data
            .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    }, [meetingRequests, startups]);

    if (loading && requestedMeetings.length === 0) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <LoadingSpinner size="lg" />
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
                    <h1 className="text-4xl sm:text-5xl font-bold mb-3 tracking-tight">My Meetings</h1>
                    <div className="flex items-center justify-center gap-2 text-white/70">
                        <MapPin className="w-4 h-4" />
                        <span className="text-sm font-medium tracking-wide uppercase">Stockholm / 2026</span>
                    </div>
                </div>
            </div>

            <div className="max-w-2xl mx-auto px-4 pt-12 pb-12">
                {requestedMeetings.length === 0 ? (
                    <div className="text-center py-20 animate-fade-in">
                        <div className="w-20 h-20 bg-bg-card rounded-full flex items-center justify-center mx-auto mb-6">
                            <Calendar className="w-10 h-10 text-text-secondary/30" />
                        </div>
                        <h2 className="text-2xl font-bold text-text-primary mb-2">No Meetings Yet</h2>
                        <p className="text-text-secondary max-w-xs mx-auto">
                            Select startups from the list to request a 1-to-1 meeting during the event.
                        </p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {requestedMeetings.map((item) => (
                            <div
                                key={item.id}
                                className="bg-white rounded-[32px] p-6 shadow-premium border border-border/30 hover:shadow-elevated transition-all duration-300 group"
                            >
                                <div className="flex gap-5">
                                    {/* Logo */}
                                    <div className="w-16 h-16 rounded-2xl bg-bg-card overflow-hidden flex items-center justify-center flex-shrink-0 p-2 border border-border/20">
                                        {item.startup?.logo ? (
                                            <img
                                                src={item.startup.logo}
                                                alt={item.startup.name}
                                                className="w-full h-full object-contain"
                                            />
                                        ) : (
                                            <span className="text-xl font-bold text-primary">
                                                {item.startup?.name.charAt(0)}
                                            </span>
                                        )}
                                    </div>

                                    {/* Content */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex justify-between items-start mb-1">
                                            <h3 className="text-xl font-bold text-text-primary truncate group-hover:text-primary transition-colors">
                                                {item.startup?.name}
                                            </h3>
                                            <button
                                                onClick={() => toggleMeetingRequest(item.startupId)}
                                                className="text-text-secondary/40 hover:text-red-500 transition-colors p-1"
                                                title="Remove request"
                                            >
                                                <span className="text-xs font-bold uppercase tracking-widest">Remove</span>
                                            </button>
                                        </div>

                                        <p className="text-text-secondary text-sm line-clamp-2 mb-4">
                                            {item.startup?.description || 'Climate Startup'}
                                        </p>

                                        <div className="flex flex-wrap items-center gap-4">
                                            <div className="flex items-center gap-1.5 text-[10px] font-bold text-primary bg-primary/5 px-3 py-1.5 rounded-full uppercase tracking-wider">
                                                <Building2 className="w-3 h-3" />
                                                {item.startup?.industry}
                                            </div>
                                            <div className="flex items-center gap-1.5 text-[10px] font-bold text-text-secondary/60 uppercase tracking-wider">
                                                <Calendar className="w-3 h-3" />
                                                Added {item.createdAt.toLocaleDateString()}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <BottomNav />
        </div>
    );
};

export default MeetingsPage;
