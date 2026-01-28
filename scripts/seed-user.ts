import { initializeApp } from 'firebase/app';
import { getFirestore, doc, setDoc, serverTimestamp } from 'firebase/firestore';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const firebaseConfig = {
    apiKey: process.env.VITE_FIREBASE_API_KEY,
    authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.VITE_FIREBASE_APP_ID
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const usersToSeed = [
    {
        name: 'Evelyn Santiago Felizzola',
        email: 'evelyn.felizzola@sting.co',
        company: 'Sting'
    },
    {
        name: 'eve sanfeliz',
        email: 'eve.sanfeliz@gmail.com',
        company: 'Sting Guest'
    },
    {
        name: 'Kasia Mikoluk',
        email: 'kasia.mikoluk@sting.co',
        company: 'Sting'
    },
    {
        name: 'Mia de Bésche',
        email: 'mia.debesche@sting.co',
        company: 'Sting'
    },
    {
        name: 'Shanti Hsu',
        email: 'shanti.hsu@sting.co',
        company: 'Sting'
    }
];

async function seedUsers() {
    console.log(`Starting to seed ${usersToSeed.length} users...`);

    for (const user of usersToSeed) {
        const USER_ID = user.email.toLowerCase().trim();
        const userData = {
            name: user.name,
            company: user.company,
            email: user.email.toLowerCase().trim(),
            createdAt: serverTimestamp(),
            lastActive: serverTimestamp()
        };

        try {
            console.log(`Attempting to seed: ${userData.email}...`);
            await setDoc(doc(db, 'users', USER_ID), userData);
            console.log(`✅ Success: ${userData.email}`);
        } catch (err: any) {
            if (err.code === 'permission-denied') {
                console.log(`ℹ️ Skipping ${userData.email} (Likely already exists and needs authentication to update)`);
            } else {
                console.error(`❌ Error seeding ${userData.email}:`, err.message);
            }
        }
    }

    console.log('Finalized seeding process!');
}

seedUsers().catch(console.error);
