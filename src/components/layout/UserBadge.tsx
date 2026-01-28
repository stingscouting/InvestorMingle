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
        <div className={cn("flex items-center gap-2 bg-white/60 backdrop-blur-md border border-primary/20 rounded-full pl-0.5 pr-3 py-0.5 animate-fade-in shadow-sm", className)}>
            <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center text-white text-[10px] font-bold shadow-sm">
                {initials || <UserIcon className="w-3 h-3" />}
            </div>
            <div className="flex flex-col">
                <span className="text-[8px] uppercase tracking-widest font-bold text-text-secondary/60 leading-none">Logged in as</span>
                <span className="text-xs font-bold text-text-primary leading-tight truncate max-w-[100px]">{user.name}</span>
            </div>
            <button
                onClick={() => logout()}
                className="ml-1 p-1 rounded-full hover:bg-black/5 text-text-secondary/40 hover:text-primary transition-colors"
                title="Logout"
            >
                <LogOut className="w-3 h-3" />
            </button>
        </div>
    );
};

export default UserBadge;
