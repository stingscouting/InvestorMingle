import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, deleteDoc, doc } from 'firebase/firestore';
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

async function clearCollection(collectionName: string) {
    console.log(`Clearing ${collectionName}...`);
    const snapshot = await getDocs(collection(db, collectionName));
    const deletePromises = snapshot.docs.map(document => deleteDoc(doc(db, collectionName, document.id)));
    await Promise.all(deletePromises);
    console.log(`Successfully cleared ${snapshot.size} documents from ${collectionName}.`);
}

async function clearTestData() {
    await clearCollection('votes');
    await clearCollection('meetingRequests');
    console.log('Finalized cleanup!');
}

clearTestData().catch(console.error);
