import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { User as UserIcon, LogOut } from 'lucide-react';
import { cn } from '@/utils/helpers';

interface UserBadgeProps {
    className?: string;
}

const UserBadge: React.FC<UserBadgeProps> = ({ className }) => {
    const { user, logout } = useAuth();

    if (!user) return null;

    const initials = user.name
        .split(' ')
        .map(n => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);

    return (
        <div className={cn("flex items-center gap-3 bg-white/60 backdrop-blur-md border border-primary/20 rounded-full pl-1 pr-4 py-1 animate-fade-in shadow-sm", className)}>
            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white text-xs font-bold shadow-sm">
                {initials || <UserIcon className="w-4 h-4" />}
            </div>
            <div className="flex flex-col">
                <span className="text-[10px] uppercase tracking-widest font-bold text-text-secondary/60 leading-none">Logged in as</span>
                <span className="text-sm font-bold text-text-primary leading-tight truncate max-w-[120px]">{user.name}</span>
            </div>
            <button
                onClick={() => logout()}
                className="ml-2 p-1.5 rounded-full hover:bg-white/10 text-white/60 hover:text-white transition-colors"
                title="Logout"
            >
                <LogOut className="w-3.5 h-3.5" />
            </button>
        </div>
    );
};

export default UserBadge;
