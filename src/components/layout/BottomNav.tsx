import React from 'react';
import { NavLink } from 'react-router-dom';
import {
    LayoutGrid,
    CheckSquare,
    Calendar,
    Trophy,
    Settings
} from 'lucide-react';
import { cn, isAdmin } from '@/utils/helpers';
import { useAuth } from '@/contexts/AuthContext';
import { ADMIN_EMAILS } from '@/config/firebase';

const BottomNav: React.FC = () => {
    const { user, firebaseUser } = useAuth();
    const isAdminUser = isAdmin(firebaseUser?.email || user?.email || '', ADMIN_EMAILS);

    const navItems = [
        { to: '/startups', label: 'STARTUPS', icon: LayoutGrid },
        { to: '/meetings', label: 'MY MEETINGS', icon: Calendar },
        { to: '/vote', label: 'VOTING', icon: CheckSquare },
        { to: '/leaderboard', label: 'LEADERBOARD', icon: Trophy },
    ];

    if (isAdminUser) {
        navItems.push({ to: '/admin', label: 'ADMIN', icon: Settings });
    }

    return (
        <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-black/[0.03] pb-safe z-50 shadow-[0_-4px_20px_rgba(0,0,0,0.02)]">
            <div className="max-w-xl mx-auto flex items-center justify-between px-8 py-4">
                {navItems.map((item) => (
                    <NavLink
                        key={item.to}
                        to={item.to}
                        className={({ isActive }) => cn(
                            "flex flex-col items-center gap-1.5 transition-all duration-300",
                            isActive ? "text-primary-dark opacity-100" : "text-text-secondary opacity-30 hover:opacity-50"
                        )}
                    >
                        <item.icon className="w-5 h-5" />
                        <span className="text-[8px] font-bold tracking-[0.15em] uppercase">{item.label}</span>
                    </NavLink>
                ))}
            </div>
        </nav>
    );
};

export default BottomNav;
