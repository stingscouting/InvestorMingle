# Climate Race Investor Platform - Setup Guide

## Prerequisites

Before you begin, ensure you have:
- Node.js (v18 or higher)
- npm or yarn
- A Firebase project

## 1. Install Dependencies

```bash
cd "/Users/evelynsantiago/Desktop/Mingle Investor"
npm install
```

## 2. Firebase Setup

### Create a Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project called "Sting Climate Race"
3. Enable Email/Password authentication
   - Go to Authentication → Sign-in method
   - Enable "Email/Password"
   - Enable "Email link (passwordless sign-in)"
4. Create a Firestore database
   - Go to Firestore Database → Create database
   - Start in production mode
5. Enable Firebase Storage
   - Go to Storage → Get started

### Get Firebase Configuration

1. Go to Project Settings → General
2. Scroll to "Your apps" section
3. Click "Add app" → Web (</>) icon
4. Register your app
5. Copy the `firebaseConfig` object

### Configure Environment Variables

1. Create a `.env` file in the project root:

```bash
cp .env.example .env
```

2. Fill in your Firebase configuration in `.env`:

```
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id

# Add admin email addresses (comma-separated)
VITE_ADMIN_EMAILS=admin@example.com,admin2@example.com
```

### Deploy Firestore Security Rules

1. Install Firebase CLI:
```bash
npm install -g firebase-tools
```

2. Login to Firebase:
```bash
firebase login
```

3. Initialize Firebase in your project:
```bash
firebase init
```
   - Select Firestore
   - Use `firestore.rules` as the rules file
   - Don't overwrite the existing file

4. Deploy the security rules:
```bash
firebase deploy --only firestore:rules
```

### Add Sample Startup Data

Add startup data to Firestore manually or using a script:

```javascript
// Example startup document in 'startups' collection
{
  name: "EcoTech Solutions",
  logo: "https://example.com/logo.png",
  description: "Revolutionizing carbon capture technology",
  fullDescription: "Full description here...",
  website: "https://ecotech.example.com",
  linkedin: "https://linkedin.com/company/ecotech",
  order: 1
}
```

## 3. Run Development Server

```bash
npm run dev
```

The app will be available at `http://localhost:3000`

## 4. Build for Production

```bash
npm run build
```

## 5. Deploy to Vercel

### Option 1: Vercel CLI

1. Install Vercel CLI:
```bash
npm install -g vercel
```

2. Deploy:
```bash
vercel
```

3. Add environment variables in Vercel dashboard:
   - Go to your project → Settings → Environment Variables
   - Add all `VITE_*` variables from your `.env` file

### Option 2: Vercel Dashboard

1. Go to [Vercel](https://vercel.com)
2. Import your Git repository
3. Add environment variables
4. Deploy

## Admin Access

To grant admin access, add email addresses to the `VITE_ADMIN_EMAILS` environment variable.

Admin users can access the dashboard at `/admin`

## Testing

Test the following flows:

1. **Registration**: New user signs up with email link
2. **Browsing**: View all startups
3. **Meeting Requests**: Toggle meeting requests
4. **Voting**: Submit a vote
5. **Leaderboard**: View live results
6. **Admin**: Access admin dashboard (admin users only)
