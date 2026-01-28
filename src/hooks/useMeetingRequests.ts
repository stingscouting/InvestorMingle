import { useState, useEffect } from 'react';
import {
    collection,
    query,
    where,
    onSnapshot,
    addDoc,
    deleteDoc,
    doc,
    serverTimestamp,
} from 'firebase/firestore';
import { db } from '@/config/firebase';
import { MeetingRequest } from '@/types';
import { useAuth } from '@/contexts/AuthContext';

const IS_MOCK_MODE = false;
const MOCK_STORAGE_KEY = 'mock_meeting_requests';

export const useMeetingRequests = () => {
    const { user } = useAuth();
    const [meetingRequests, setMeetingRequests] = useState<MeetingRequest[]>([]);
    const [loading, setLoading] = useState(true);

    // Load requests
    useEffect(() => {
        if (!user) {
            setMeetingRequests([]);
            setLoading(false);
            return;
        }

        if (IS_MOCK_MODE) {
            const stored = localStorage.getItem(MOCK_STORAGE_KEY);
            if (stored) {
                const parsed = JSON.parse(stored);
                setMeetingRequests(parsed);
            } else {
                setMeetingRequests([]);
            }
            setLoading(false);
            return;
        }

        const meetingRequestsQuery = query(
            collection(db, 'meetingRequests'),
            where('userId', '==', user.id)
        );

        const unsubscribe = onSnapshot(meetingRequestsQuery, (snapshot) => {
            const requests = snapshot.docs.map(doc => {
                const data = doc.data();
                return {
                    id: doc.id,
                    userId: data.userId,
                    startupId: data.startupId,
                    createdAt: data.createdAt?.toDate() || new Date(),
                } as MeetingRequest;
            });
            setMeetingRequests(requests);
            setLoading(false);
        });

        return () => unsubscribe();
    }, [user]);

    const toggleMeetingRequest = async (startupId: string): Promise<boolean> => {
        if (!user) return false;

        if (IS_MOCK_MODE) {
            const existingRequest = meetingRequests.find(req => req.startupId === startupId);

            let newRequests;
            let wasAdded;

            if (existingRequest) {
                newRequests = meetingRequests.filter(req => req.startupId !== startupId);
                wasAdded = false;
            } else {
                const newRequest: MeetingRequest = {
                    id: Math.random().toString(36).substr(2, 9),
                    userId: user.id,
                    startupId,
                    createdAt: new Date()
                };
                newRequests = [...meetingRequests, newRequest];
                wasAdded = true;
            }

            setMeetingRequests(newRequests);
            localStorage.setItem(MOCK_STORAGE_KEY, JSON.stringify(newRequests));
            return wasAdded;
        }

        try {
            const existingRequest = meetingRequests.find(
                req => req.startupId === startupId
            );

            if (existingRequest) {
                await deleteDoc(doc(db, 'meetingRequests', existingRequest.id));
                return false;
            } else {
                await addDoc(collection(db, 'meetingRequests'), {
                    userId: user.id,
                    startupId,
                    createdAt: serverTimestamp(),
                });
                return true;
            }
        } catch (error) {
            console.error('Error toggling meeting request:', error);
            throw error;
        }
    };

    const isMeetingRequested = (startupId: string): boolean => {
        return meetingRequests.some(req => req.startupId === startupId);
    };

    return {
        meetingRequests,
        loading,
        toggleMeetingRequest,
        isMeetingRequested,
    };
};
