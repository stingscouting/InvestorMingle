import React, { createContext, useContext, useEffect, useState } from 'react';
import {
    User as FirebaseUser,
    signInWithEmailLink,
    sendSignInLinkToEmail,
    isSignInWithEmailLink,
    onAuthStateChanged,
} from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc, serverTimestamp, collection, query, where, getDocs } from 'firebase/firestore';
import { auth, db } from '@/config/firebase';
import { User } from '@/types';
import { MOCK_USER } from '@/data/mockData';

const IS_MOCK_MODE = false;

interface AuthContextType {
    user: User | null;
    firebaseUser: FirebaseUser | null;
    loading: boolean;
    sendLoginLink: (email: string, name?: string, company?: string) => Promise<void>;
    completeSignIn: () => Promise<void>;
    logout: () => Promise<void>;
    loginAsMockUser: () => void;
    getUserByEmail: (email: string) => Promise<User | null>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (IS_MOCK_MODE) {
            // Check if mock user is 'logged in' via local storage
            const isMockLoggedIn = localStorage.getItem('mock_logged_in') === 'true';
            if (isMockLoggedIn) {
                setUser(MOCK_USER);
            }
            setLoading(false);
            return;
        }

        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
            setFirebaseUser(firebaseUser);

            if (firebaseUser) {
                // Fetch user data from Firestore
                const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
                if (userDoc.exists()) {
                    const userData = userDoc.data() as User;
                    setUser({
                        ...userData,
                        id: firebaseUser.uid,
                        createdAt: userData.createdAt instanceof Date ? userData.createdAt : new Date(userData.createdAt),
                        lastActive: new Date(),
                    });

                    // Update last active timestamp
                    await updateDoc(doc(db, 'users', firebaseUser.uid), {
                        lastActive: serverTimestamp(),
                    });
                }
            } else {
                setUser(null);
            }

            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const getUserByEmail = async (email: string): Promise<User | null> => {
        if (IS_MOCK_MODE) {
            return email === MOCK_USER.email ? MOCK_USER : null;
        }

        try {
            // Priority 1: Check if email is used as Document ID (Optimized for Path 1)
            const userDoc = await getDoc(doc(db, 'users', email));
            if (userDoc.exists()) {
                return { id: userDoc.id, ...userDoc.data() } as User;
            }

            // Priority 2: Fallback to query (if they registered via Path 2 previously)
            const usersRef = collection(db, 'users');
            const q = query(usersRef, where('email', '==', email.toLowerCase()));
            const querySnapshot = await getDocs(q);

            if (!querySnapshot.empty) {
                const doc = querySnapshot.docs[0];
                return {
                    id: doc.id,
                    ...doc.data()
                } as User;
            }
            return null;
        } catch (error) {
            // Silently return null on permission error to trigger Path 2 registration
            return null;
        }
    };

    const loginAsMockUser = () => {
        setUser(MOCK_USER);
        localStorage.setItem('mock_logged_in', 'true');
    };

    const sendLoginLink = async (email: string, name?: string, company?: string) => {
        if (IS_MOCK_MODE) {
            console.log('Mock link sent to:', email);
            if (name) window.localStorage.setItem('userName', name);
            if (company) window.localStorage.setItem('userCompany', company);
            return;
        }

        const actionCodeSettings = {
            url: window.location.origin + `/complete-signin?email=${encodeURIComponent(email)}`,
            handleCodeInApp: true,
        };

        await sendSignInLinkToEmail(auth, email, actionCodeSettings);

        // Store user info for registration - only override if provided
        window.localStorage.setItem('emailForSignIn', email);
        if (name) window.localStorage.setItem('userName', name);
        if (company) window.localStorage.setItem('userCompany', company);
    };

    const completeSignIn = async () => {
        if (IS_MOCK_MODE) return;

        if (!isSignInWithEmailLink(auth, window.location.href)) {
            throw new Error('Invalid sign-in link');
        }

        const urlParams = new URLSearchParams(window.location.search);
        let email = urlParams.get('email') || window.localStorage.getItem('emailForSignIn');

        if (!email) {
            throw new Error('Email is required to complete sign-in. Please ensure you use the same browser or provide your email.');
        }

        const result = await signInWithEmailLink(auth, email, window.location.href);
        const userId = result.user.uid;

        // Check if user exists
        const userDoc = await getDoc(doc(db, 'users', userId));

        if (!userDoc.exists()) {
            // Check if we have their info in local storage (Path 2) or if they existed by email (Path 1)
            let name = window.localStorage.getItem('userName');
            let company = window.localStorage.getItem('userCompany');

            // If not in storage, check if there's a pre-registered user with this email
            if (!name || !company) {
                const preRegistered = await getUserByEmail(email);
                if (preRegistered) {
                    name = preRegistered.name;
                    company = preRegistered.company;

                    // Cleanup pre-registration record after claiming it
                    try {
                        const { deleteDoc, doc } = await import('firebase/firestore');
                        await deleteDoc(doc(db, 'users', preRegistered.id));
                    } catch (cleanupErr) {
                        console.warn('Failed to cleanup pre-reg record:', cleanupErr);
                    }
                }
            }

            // Create new user record
            const newUser: Omit<User, 'id'> = {
                name: name || 'New Investor',
                company: company || 'Indepedent',
                email: email,
                createdAt: new Date(),
                lastActive: new Date(),
            };

            await setDoc(doc(db, 'users', userId), {
                ...newUser,
                createdAt: serverTimestamp(),
                lastActive: serverTimestamp(),
            });
        }

        // Clean up local storage
        window.localStorage.removeItem('emailForSignIn');
        window.localStorage.removeItem('userName');
        window.localStorage.removeItem('userCompany');
    };

    const logout = async () => {
        if (IS_MOCK_MODE) {
            setUser(null);
            localStorage.removeItem('mock_logged_in');
            return;
        }
        await auth.signOut();
        setUser(null);
        setFirebaseUser(null);
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                firebaseUser,
                loading,
                sendLoginLink,
                completeSignIn,
                logout,
                loginAsMockUser,
                getUserByEmail
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
