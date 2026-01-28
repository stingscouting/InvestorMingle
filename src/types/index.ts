export interface User {
    id: string;
    name: string;
    company: string;
    email: string;
    createdAt: Date;
    lastActive: Date;
}

export interface Startup {
    id: string;
    name: string;
    logo: string;
    description: string;
    fullDescription?: string;
    website: string;
    linkedin: string;
    industry?: string;
    stage?: string;
    order: number;
}

export interface MeetingRequest {
    id: string;
    userId: string;
    startupId: string;
    createdAt: Date;
}

export interface Vote {
    userId: string;
    startupId: string;
    createdAt: Date;
}

export interface StartupStats {
    startupId: string;
    meetingRequestCount: number;
    voteCount: number;
}

export interface LeaderboardEntry {
    startup: Startup;
    voteCount: number;
    rank: number;
}
