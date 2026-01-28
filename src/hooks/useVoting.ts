import { useState, useEffect } from 'react';
import {
    collection,
    doc,
    setDoc,
    getDoc,
    query,
    onSnapshot,
    serverTimestamp,
} from 'firebase/firestore';
import { db } from '@/config/firebase';
import { Vote, LeaderboardEntry, Startup } from '@/types';
import { useAuth } from '@/contexts/AuthContext';

const IS_MOCK_MODE = false;
const MOCK_VOTE_KEY = 'mock_user_vote';
const MOCK_LEADERBOARD_KEY = 'mock_leaderboard_votes';

export const useVoting = () => {
    const { user } = useAuth();
    const [userVote, setUserVote] = useState<Vote | null>(null);
    const [hasVoted, setHasVoted] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user) {
            setUserVote(null);
            setHasVoted(false);
            setLoading(false);
            return;
        }

        if (IS_MOCK_MODE) {
            const storedVote = localStorage.getItem(MOCK_VOTE_KEY);
            if (storedVote) {
                setUserVote(JSON.parse(storedVote));
                setHasVoted(true);
            }
            setLoading(false);
            return;
        }

        const fetchUserVote = async () => {
            const voteDoc = await getDoc(doc(db, 'votes', user.id));
            if (voteDoc.exists()) {
                const data = voteDoc.data();
                setUserVote({
                    userId: user.id,
                    startupId: data.startupId,
                    createdAt: data.createdAt?.toDate() || new Date(),
                });
                setHasVoted(true);
            }
            setLoading(false);
        };

        fetchUserVote();
    }, [user]);

    const submitVote = async (startupId: string): Promise<void> => {
        if (!user) throw new Error('Must be logged in to vote');
        if (hasVoted) throw new Error('Already voted');

        if (IS_MOCK_MODE) {
            const vote: Vote = {
                userId: user.id,
                startupId,
                createdAt: new Date(),
            };

            // Save user vote
            localStorage.setItem(MOCK_VOTE_KEY, JSON.stringify(vote));
            setUserVote(vote);
            setHasVoted(true);

            // Update global leaderboard storage for mock mode
            const storedVotes = localStorage.getItem(MOCK_LEADERBOARD_KEY);
            const allVotes = storedVotes ? JSON.parse(storedVotes) : {};
            allVotes[startupId] = (allVotes[startupId] || 0) + 1;
            localStorage.setItem(MOCK_LEADERBOARD_KEY, JSON.stringify(allVotes));

            return;
        }

        try {
            await setDoc(doc(db, 'votes', user.id), {
                userId: user.id,
                startupId,
                createdAt: serverTimestamp(),
            });

            setUserVote({
                userId: user.id,
                startupId,
                createdAt: new Date(),
            });
            setHasVoted(true);
        } catch (error) {
            console.error('Error submitting vote:', error);
            throw error;
        }
    };

    return {
        userVote,
        hasVoted,
        loading,
        submitVote,
    };
};

export const useLeaderboard = (startups: Startup[]) => {
    const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (startups.length === 0) {
            setLoading(false);
            return;
        }

        if (IS_MOCK_MODE) {
            const updateMockLeaderboard = () => {
                const storedVotes = localStorage.getItem(MOCK_LEADERBOARD_KEY);
                const voteCounts = storedVotes ? JSON.parse(storedVotes) : {};

                // Add some random fake votes if empty, just for demo visual
                if (Object.keys(voteCounts).length === 0) {
                    startups.forEach(s => {
                        voteCounts[s.id] = Math.floor(Math.random() * 50) + 5;
                    });
                    localStorage.setItem(MOCK_LEADERBOARD_KEY, JSON.stringify(voteCounts));
                }

                const entries: LeaderboardEntry[] = startups.map(startup => ({
                    startup,
                    voteCount: voteCounts[startup.id] || 0,
                    rank: 0,
                }));

                entries.sort((a, b) => b.voteCount - a.voteCount);
                entries.forEach((entry, index) => {
                    entry.rank = index + 1;
                });

                setLeaderboard(entries);
                setLoading(false);
            };

            updateMockLeaderboard();
            // Poll for updates in mock mode
            const interval = setInterval(updateMockLeaderboard, 2000);
            return () => clearInterval(interval);
        }

        const votesQuery = query(collection(db, 'votes'));

        const unsubscribe = onSnapshot(votesQuery, (snapshot) => {
            // Count votes for each startup
            const voteCounts = new Map<string, number>();
            snapshot.docs.forEach(doc => {
                const data = doc.data();
                const startupId = data.startupId;
                voteCounts.set(startupId, (voteCounts.get(startupId) || 0) + 1);
            });

            // Create leaderboard entries
            const entries: LeaderboardEntry[] = startups.map(startup => ({
                startup,
                voteCount: voteCounts.get(startup.id) || 0,
                rank: 0, // Will be set after sorting
            }));

            // Sort by vote count (descending) and assign ranks
            entries.sort((a, b) => b.voteCount - a.voteCount);
            entries.forEach((entry, index) => {
                entry.rank = index + 1;
            });

            setLeaderboard(entries);
            setLoading(false);
        });

        return () => unsubscribe();
    }, [startups]);

    return { leaderboard, loading };
};
