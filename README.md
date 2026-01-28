# Climate Race Investor Platform

A mobile-first investor engagement platform for the Sting Climate Race event where 100+ investors can view pitching startups, express meeting interest, and vote for the best pitch in real-time.

## Features

### For Investors
- 🔐 **Passwordless Authentication** - Quick email link sign-in
- 🚀 **Browse Startups** - View all participating climate startups
- 🤝 **Request Meetings** - Express interest in meeting startups
- 🗳️ **Vote** - Vote for the best pitch
- 🏆 **Leaderboard** - View live voting results with podium visualization
- 📱 **Mobile First** - Optimized for mobile devices

### For Admins
- 📊 **Analytics Dashboard** - View event statistics
- 👥 **Investor Management** - Track registrations and engagement
- 📥 **CSV Export** - Export investor and meeting request data
- 📈 **Real-time Updates** - Monitor event activity live

## Tech Stack

- **Frontend**: React 18 + TypeScript + Vite
- **Styling**: Tailwind CSS
- **Backend**: Firebase (Auth + Firestore + Storage)
- **Hosting**: Vercel
- **Icons**: Lucide React

## Quick Start

See [SETUP.md](./SETUP.md) for detailed setup instructions.

```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your Firebase configuration

# Run development server
npm run dev

# Build for production
npm run build
```

## Project Structure

```
src/
├── components/
│   ├── auth/          # Authentication components
│   ├── common/        # Reusable components
│   └── layout/        # Layout components
├── config/            # Firebase configuration
├── contexts/          # React contexts
├── hooks/             # Custom React hooks
├── pages/             # Page components
│   └── admin/         # Admin pages
├── types/             # TypeScript types
├── utils/             # Utility functions
├── App.tsx            # Main app component
├── main.tsx           # Entry point
└── index.css          # Global styles
```

## Key Features Implementation

### Authentication
- Firebase Email Link (passwordless) authentication
- Session persistence
- Auto-login for returning users

### Real-time Updates
- Firestore real-time listeners for:
  - Meeting requests
  - Vote counts
  - Leaderboard rankings
- Optimistic UI updates

### Security
- Firestore security rules
- Admin-only access control
- Data privacy protection

## Environment Variables

Required environment variables (see `.env.example`):

```
VITE_FIREBASE_API_KEY
VITE_FIREBASE_AUTH_DOMAIN
VITE_FIREBASE_PROJECT_ID
VITE_FIREBASE_STORAGE_BUCKET
VITE_FIREBASE_MESSAGING_SENDER_ID
VITE_FIREBASE_APP_ID
VITE_ADMIN_EMAILS
```

## Deployment

Deploy to Vercel:

```bash
vercel
```

Remember to add environment variables in the Vercel dashboard.

## License

This project is proprietary and confidential.
