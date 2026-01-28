import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useStartups } from '@/hooks/useStartups';
import { useMeetingRequests } from '@/hooks/useMeetingRequests';
import StartupCard from '@/components/common/StartupCard';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import Toast, { ToastType } from '@/components/common/Toast';
import BottomNav from '@/components/layout/BottomNav';

type FilterTab = 'all' | 'meetings';

import { Search, MapPin } from 'lucide-react';
import UserBadge from '@/components/layout/UserBadge';

const StartupsPage: React.FC = () => {
    const location = useLocation();
    const { startups, loading: startupsLoading } = useStartups();
    const { toggleMeetingRequest, isMeetingRequested } = useMeetingRequests();
    const [activeTab, setActiveTab] = useState<FilterTab>(
        location.pathname === '/meetings' ? 'meetings' : 'all'
    );
    const [searchQuery, setSearchQuery] = useState('');
    const [toast, setToast] = useState<{ message: string; type: ToastType } | null>(null);
    const [loadingStates, setLoadingStates] = useState<Record<string, boolean>>({});

    // Sync tab with location changes
    useEffect(() => {
        if (location.pathname === '/meetings') {
            setActiveTab('meetings');
        } else if (location.pathname === '/startups') {
            setActiveTab('all');
        }
    }, [location.pathname]);

    const handleToggleMeeting = async (startupId: string, startupName: string) => {
        setLoadingStates(prev => ({ ...prev, [startupId]: true }));

        try {
            const wasAdded = await toggleMeetingRequest(startupId);
            setToast({
                message: wasAdded
                    ? `Meeting request sent to ${startupName}`
                    : `Meeting request removed`,
                type: 'success',
            });
        } catch (error) {
            setToast({
                message: 'Failed to update meeting request',
                type: 'error',
            });
        } finally {
            setLoadingStates(prev => ({ ...prev, [startupId]: false }));
        }
    };

    const filteredStartups = startups
        .filter(startup => {
            const matchesTab = activeTab === 'all' || isMeetingRequested(startup.id);
            const matchesSearch = startup.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                startup.description.toLowerCase().includes(searchQuery.toLowerCase());
            return matchesTab && matchesSearch;
        });

    if (startupsLoading) {
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
                    <h1 className="text-4xl sm:text-5xl font-bold mb-3 tracking-tight">Sting Climate Race</h1>
                    <div className="flex items-center justify-center gap-2 text-white/70">
                        <MapPin className="w-4 h-4" />
                        <span className="text-sm font-medium tracking-wide uppercase">Stockholm / 2026</span>
                    </div>
                </div>
            </div>

            {/* Overlapping Search Bar Container */}
            <div className="max-w-xl mx-auto px-4 -mt-8 relative z-20">
                <div className="relative group animate-scale-up">
                    <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-text-secondary/40 group-focus-within:text-primary transition-colors" strokeWidth={2} />
                    <input
                        type="text"
                        placeholder="Search startups, solutions or industry..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-14 pr-6 py-5 rounded-2xl bg-white border border-transparent shadow-premium text-text-primary text-base placeholder:text-text-secondary/30 transition-all focus:border-primary/20 focus:ring-4 focus:ring-primary/5 focus:outline-none"
                    />
                </div>
            </div>

            <div className="max-w-2xl mx-auto px-4">
                {/* Removed filter tabs - showing all startups */}

                {/* Startup Cards */}
                <div className="px-4 py-8">
                    {filteredStartups.length === 0 ? (
                        <div className="text-center py-20">
                            <div className="w-20 h-20 bg-bg-card rounded-full flex items-center justify-center mx-auto mb-4">
                                <Search className="w-10 h-10 text-text-secondary opacity-20" />
                            </div>
                            <p className="text-text-secondary text-lg">
                                {searchQuery
                                    ? `No startups found matching "${searchQuery}"`
                                    : 'No startups available in this category'}
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {filteredStartups.map((startup, index) => (
                                <StartupCard
                                    key={startup.id}
                                    startup={startup}
                                    index={index}
                                    isRequested={isMeetingRequested(startup.id)}
                                    onToggleMeeting={() => handleToggleMeeting(startup.id, startup.name)}
                                    loading={loadingStates[startup.id]}
                                />
                            ))}
                        </div>
                    )}
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

export default StartupsPage;
