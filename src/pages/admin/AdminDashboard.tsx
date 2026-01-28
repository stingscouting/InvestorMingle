import React, { useState, useEffect } from 'react';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { db, ADMIN_EMAILS } from '@/config/firebase';
import { useAuth } from '@/contexts/AuthContext';
import { Navigate } from 'react-router-dom';
import { User, MeetingRequest, Startup, Vote } from '@/types';
import { exportToCSV } from '@/utils/exportCSV';
import { formatDate, isAdmin } from '@/utils/helpers';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import { Download, Users, TrendingUp, CheckCircle, X, BarChart3, PieChart } from 'lucide-react';
import BottomNav from '@/components/layout/BottomNav';
import UserBadge from '@/components/layout/UserBadge';

interface InvestorRow extends User {
    meetingRequestsCount: number;
    hasVoted: boolean;
}

interface StartupAnalytics extends Startup {
    votes: number;
    bookings: number;
}

const AdminDashboard: React.FC = () => {
    const { user, firebaseUser } = useAuth();
    const [investors, setInvestors] = useState<InvestorRow[]>([]);
    const [startupStats, setStartupStats] = useState<StartupAnalytics[]>([]);
    const [totalVotes, setTotalVotes] = useState(0);
    const [totalMeetingRequests, setTotalMeetingRequests] = useState(0);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [activeTab, setActiveTab] = useState<'investors' | 'startups'>('investors');
    const [error, setError] = useState<string | null>(null);

    if (!user || !isAdmin(firebaseUser?.email || user?.email || '', ADMIN_EMAILS)) {
        return <Navigate to="/startups" replace />;
    }

    useEffect(() => {
        const fetchData = async () => {
            console.log('Admin: Starting data fetch for:', firebaseUser?.email);
            try {
                // Fetch all data from Firebase
                const [usersSnap, meetingsSnap, votesSnap, startupsSnap] = await Promise.all([
                    getDocs(collection(db, 'users')),
                    getDocs(collection(db, 'meetingRequests')),
                    getDocs(collection(db, 'votes')),
                    getDocs(query(collection(db, 'startups'), orderBy('name', 'asc')))
                ]);

                console.log('Admin: Fetch successful', {
                    users: usersSnap.size,
                    meetings: meetingsSnap.size,
                    votes: votesSnap.size,
                    startups: startupsSnap.size
                });

                const usersData = usersSnap.docs.map(doc => {
                    const data = doc.data();
                    const convertDate = (val: any) => {
                        if (val?.toDate) return val.toDate();
                        if (val instanceof Date) return val;
                        return new Date();
                    };

                    return {
                        id: doc.id,
                        ...data,
                        createdAt: convertDate(data.createdAt),
                        lastActive: convertDate(data.lastActive),
                    } as User;
                });

                const meetingsData = meetingsSnap.docs.map(doc => doc.data() as MeetingRequest);
                const votesData = votesSnap.docs.map(doc => doc.data() as Vote);
                const startupsData = startupsSnap.docs
                    .map(doc => ({ id: doc.id, ...doc.data() } as Startup))
                    .filter(s => s.name && s.name.trim() !== '');

                const votedUserIds = new Set(votesSnap.docs.map(doc => doc.id));

                // Deduplicate users by email (keep the one with most activity/data)
                const uniqueUsersMap = new Map<string, User>();
                usersData.forEach(u => {
                    const email = u.email.toLowerCase().trim();
                    const existing = uniqueUsersMap.get(email);
                    if (!existing || u.lastActive > existing.lastActive) {
                        uniqueUsersMap.set(email, u);
                    }
                });
                const uniqueUsers = Array.from(uniqueUsersMap.values());

                // Investor Stats (Consolidated by Email)
                const investorsWithStats: InvestorRow[] = uniqueUsers.map(u => {
                    const email = u.email.toLowerCase().trim();
                    // Find all User IDs associated with this email (to catch stats from duplicates)
                    const associatedIds = usersData
                        .filter(user => user.email.toLowerCase().trim() === email)
                        .map(user => user.id);

                    return {
                        ...u,
                        meetingRequestsCount: meetingsData.filter(req => associatedIds.includes(req.userId)).length,
                        hasVoted: associatedIds.some(id => votedUserIds.has(id)),
                    };
                });

                // Startup Stats
                const startupsWithStats: StartupAnalytics[] = startupsData.map(s => ({
                    ...s,
                    votes: votesData.filter(v => v.startupId === s.id).length,
                    bookings: meetingsData.filter(m => m.startupId === s.id).length,
                }));

                // Sort startups by bookings descending
                startupsWithStats.sort((a, b) => b.bookings - a.bookings);

                setInvestors(investorsWithStats);
                setStartupStats(startupsWithStats);

                // Total counts (unique counts for participation)
                setTotalVotes(votesSnap.size);
                setTotalMeetingRequests(meetingsSnap.size);
                setLoading(false);
            } catch (err: any) {
                console.error('Admin Fetch Error:', err);
                setError(err.message || 'Permission denied or connection error.');
                setLoading(false);
            }
        };

        fetchData();
    }, [firebaseUser?.email]);

    const handleExportInvestors = () => {
        const data = investors.map(inv => ({
            Name: inv.name,
            Company: inv.company,
            Email: inv.email,
            'Reg Date': formatDate(inv.createdAt),
            'Last Active': formatDate(inv.lastActive),
            Meetings: inv.meetingRequestsCount,
            Voted: inv.hasVoted ? 'Yes' : 'No',
        }));
        exportToCSV(data, 'investors-list');
    };

    const handleExportStartups = () => {
        const data = startupStats.map(s => ({
            'Startup Name': s.name,
            Industry: s.industry,
            Stage: s.stage,
            Bookings: s.bookings,
            Votes: s.votes,
        }));
        exportToCSV(data, 'startup-analytics');
    };

    const filteredInvestors = investors.filter(inv =>
        inv.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        inv.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
        inv.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const filteredStartups = startupStats.filter(s =>
        s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (s.industry || '').toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) return <div className="min-h-screen flex items-center justify-center"><LoadingSpinner size="lg" /></div>;

    if (error) {
        return (
            <div className="min-h-screen bg-bg-primary flex items-center justify-center p-4">
                <div className="bg-white rounded-3xl shadow-card p-8 max-w-md w-full text-center">
                    <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4 text-red-600">
                        <X className="w-8 h-8" />
                    </div>
                    <h2 className="text-2xl font-bold text-text-primary mb-2">Access Error</h2>
                    <p className="text-text-secondary text-sm mb-6">{error}</p>
                    <button onClick={() => window.location.reload()} className="btn btn-primary w-full">Try Again</button>
                    <p className="text-[10px] mt-4 text-text-secondary">Please ensure your email domain is allowed in Firestore Rules.</p>
                </div>
                <BottomNav />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-bg-primary pb-20 safe-top">
            <div className="bg-primary text-white px-4 pt-16 pb-12 shadow-lg relative overflow-hidden">
                {/* Background Decor */}
                <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-white/5 rounded-full blur-3xl pointer-events-none" />

                <div className="absolute top-4 right-4 z-20">
                    <UserBadge className="bg-white/20 border-white/30" />
                </div>

                <div className="max-w-4xl mx-auto relative z-10">
                    <h1 className="text-3xl sm:text-4xl font-bold mb-2">Event Analytics</h1>
                    <p className="opacity-80 text-sm sm:text-base max-w-md">Real-time engagement tracking for Sting Climate Race</p>
                </div>
            </div>

            <div className="max-w-4xl mx-auto px-4 -mt-8 relative z-20">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[
                        { label: 'Investors', val: investors.length, icon: Users, col: 'text-blue-600' },
                        { label: 'Bookings', val: totalMeetingRequests, icon: TrendingUp, col: 'text-primary' },
                        { label: 'Votes', val: totalVotes, icon: BarChart3, col: 'text-green-600' },
                        { label: 'Participation', val: `${Math.round((totalVotes / (investors.length || 1)) * 100)}%`, icon: PieChart, col: 'text-purple-600' }
                    ].map((s, i) => (
                        <div key={i} className="bg-white rounded-2xl shadow-elevated p-4 animate-scale-up" style={{ animationDelay: `${i * 100}ms` }}>
                            <s.icon className={`w-5 h-5 ${s.col} mb-1`} />
                            <p className="text-2xl font-bold text-text-primary">{s.val}</p>
                            <p className="text-xs text-text-secondary uppercase tracking-wider font-semibold">{s.label}</p>
                        </div>
                    ))}
                </div>

                <div className="mt-8 bg-white rounded-3xl shadow-card overflow-hidden">
                    <div className="flex border-b border-border">
                        <button
                            onClick={() => { setActiveTab('investors'); setSearchTerm(''); }}
                            className={`flex-1 py-4 font-bold transition-all ${activeTab === 'investors' ? 'text-primary border-b-4 border-primary bg-primary/5' : 'text-text-secondary hover:bg-bg-card'}`}
                        >
                            Investor Engagement
                        </button>
                        <button
                            onClick={() => { setActiveTab('startups'); setSearchTerm(''); }}
                            className={`flex-1 py-4 font-bold transition-all ${activeTab === 'startups' ? 'text-primary border-b-4 border-primary bg-primary/5' : 'text-text-secondary hover:bg-bg-card'}`}
                        >
                            Startup Performance
                        </button>
                    </div>

                    <div className="p-4 border-b border-border flex flex-col sm:flex-row gap-4 items-center justify-between bg-bg-card/30">
                        <input
                            type="text"
                            placeholder={activeTab === 'investors' ? "Search Name, Company..." : "Search Startup, Industry..."}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full sm:max-w-xs px-4 py-2.5 rounded-xl border border-border bg-white text-sm focus:ring-2 focus:ring-primary/20 outline-none"
                        />
                        <button
                            onClick={activeTab === 'investors' ? handleExportInvestors : handleExportStartups}
                            className="w-full sm:w-auto px-6 py-2.5 bg-primary text-white rounded-xl text-sm font-bold flex items-center justify-center gap-2 hover:opacity-90 transition-all active:scale-95"
                        >
                            <Download className="w-4 h-4" />
                            Export CSV
                        </button>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead className="bg-bg-card/50 text-text-secondary uppercase text-[10px] font-bold tracking-widest">
                                {activeTab === 'investors' ? (
                                    <tr>
                                        <th className="px-6 py-4 text-left">Investor / Company</th>
                                        <th className="px-6 py-4 text-center">Meetings</th>
                                        <th className="px-6 py-4 text-center">Vote</th>
                                        <th className="px-6 py-4 text-right">Last Active</th>
                                    </tr>
                                ) : (
                                    <tr>
                                        <th className="px-6 py-4 text-left">Startup</th>
                                        <th className="px-6 py-4 text-center">Bookings</th>
                                        <th className="px-6 py-4 text-center">Votes</th>
                                    </tr>
                                )}
                            </thead>
                            <tbody className="divide-y divide-border">
                                {activeTab === 'investors' ? (
                                    filteredInvestors.map(inv => (
                                        <tr key={inv.id} className="hover:bg-primary/5 transition-colors">
                                            <td className="px-6 py-4">
                                                <p className="font-bold text-text-primary">{inv.name}</p>
                                                <p className="text-xs text-text-secondary">{inv.company}</p>
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <span className="inline-flex items-center justify-center bg-primary/10 text-primary font-bold rounded-full w-8 h-8">
                                                    {inv.meetingRequestsCount}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                {inv.hasVoted ? <CheckCircle className="w-5 h-5 text-green-600 mx-auto" /> : <X className="w-5 h-5 text-text-secondary/30 mx-auto" />}
                                            </td>
                                            <td className="px-6 py-4 text-right text-xs text-text-secondary">
                                                {formatDate(inv.lastActive)}
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    filteredStartups.map(s => (
                                        <tr key={s.id} className="hover:bg-primary/5 transition-colors">
                                            <td className="px-6 py-4 font-bold text-text-primary">{s.name}</td>
                                            <td className="px-6 py-4 text-center">
                                                <span className="font-bold text-primary">{s.bookings}</span>
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <span className="font-bold text-green-600">{s.votes}</span>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    {(activeTab === 'investors' ? filteredInvestors : filteredStartups).length === 0 && (
                        <div className="py-12 text-center text-text-secondary italic">No records found matching your search.</div>
                    )}
                </div>
            </div>
            <BottomNav />
        </div>
    );
};

export default AdminDashboard;
