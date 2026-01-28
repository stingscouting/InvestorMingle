import { initializeApp } from 'firebase/app';
import { getFirestore, collection, writeBatch, doc } from 'firebase/firestore';
import fs from 'fs';
import path from 'path';
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

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function seedStartups() {
    const csvPath = path.resolve(process.cwd(), 'startups.csv');
    const fileContent = fs.readFileSync(csvPath, 'utf8');

    // Basic CSV parser (handles quoted newlines)
    const rows: string[][] = [];
    let currentRow: string[] = [];
    let currentField = '';
    let inQuotes = false;

    for (let i = 0; i < fileContent.length; i++) {
        const char = fileContent[i];
        const nextChar = fileContent[i + 1];

        if (char === '"' && inQuotes && nextChar === '"') {
            currentField += '"';
            i++;
        } else if (char === '"') {
            inQuotes = !inQuotes;
        } else if (char === ',' && !inQuotes) {
            currentRow.push(currentField.trim());
            currentField = '';
        } else if ((char === '\r' || char === '\n') && !inQuotes) {
            if (currentField || currentRow.length > 0) {
                currentRow.push(currentField.trim());
                rows.push(currentRow);
            }
            currentRow = [];
            currentField = '';
            if (char === '\r' && nextChar === '\n') i++;
        } else {
            currentField += char;
        }
    }
    if (currentField || currentRow.length > 0) {
        currentRow.push(currentField.trim());
        rows.push(currentRow);
    }

    const [header, ...data] = rows;
    const batch = writeBatch(db);

    console.log(`Starting migration of ${data.length} startups...`);

    data.forEach((row, index) => {
        // Mapping based on header: id,name,logo,description,fullDescription,website,linkedin
        const startup = {
            name: row[1],
            logo: row[2],
            description: row[3],
            fullDescription: row[4],
            website: row[5],
            linkedin: row[6],
            order: parseInt(row[0]) || index + 1
        };

        const docRef = doc(db, 'startups', row[0] || `auto-${index}`);
        batch.set(docRef, startup);
    });

    await batch.commit();
    console.log('Successfully seeded startups to Firestore!');
}

seedStartups().catch(console.error);
