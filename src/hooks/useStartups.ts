import { useState, useEffect } from 'react';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '@/config/firebase';
import { Startup } from '@/types';
import { MOCK_STARTUPS } from '@/data/mockData';

// Toggle this to switch between Mock and Firebase
const IS_MOCK_MODE = false;

export const useStartups = () => {
    const [startups, setStartups] = useState<Startup[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (IS_MOCK_MODE) {
            // Simulate network delay
            setTimeout(() => {
                setStartups(MOCK_STARTUPS);
                setLoading(false);
            }, 500);
            return;
        }

        const startupsQuery = query(
            collection(db, 'startups'),
            orderBy('order', 'asc')
        );

        const unsubscribe = onSnapshot(
            startupsQuery,
            (snapshot) => {
                const startupsData = snapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data(),
                } as Startup));
                setStartups(startupsData);
                setLoading(false);
            },
            (err) => {
                console.error('Error fetching startups:', err);
                setError('Failed to load startups');
                setLoading(false);
            }
        );

        return () => unsubscribe();
    }, []);

    return { startups, loading, error };
};
