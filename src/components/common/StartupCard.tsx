import React, { useState } from 'react';
import { Globe, Linkedin } from 'lucide-react';
import { Startup } from '@/types';
import { cn } from '@/utils/helpers';

import { useIntersectionObserver } from '@/hooks/useIntersectionObserver';

interface StartupCardProps {
    startup: Startup;
    isRequested: boolean;
    onToggleMeeting: () => void;
    loading?: boolean;
    index: number;
}

const StartupCard: React.FC<StartupCardProps> = ({
    startup,
    isRequested,
    onToggleMeeting,
    loading = false,
    index,
}) => {
    const [expanded, setExpanded] = useState(false);
    const [cardRef, isIntersecting] = useIntersectionObserver({ threshold: 0.1 });

    // Map to equally intense pastel gradient backgrounds using index for perfect distribution
    const getBgGradient = () => {
        const gradients = [
            'linear-gradient(180deg, #F5F5F5 0%, #ECECEC 100%)', // gray
            'linear-gradient(180deg, #FAF8F6 0%, #F0EBE7 100%)', // beige
            'linear-gradient(180deg, #EFF6F5 0%, #E0EDE9 100%)', // teal
        ];
        return gradients[index % gradients.length];
    };

    // Get simple icon/emoji for startup
    const getStartupIcon = (name: string) => {
        const icons: Record<string, string> = {
            'CarbonCapture': 'CO₂',
            'Ocean': '≋',
            'Green': '🌲',
            'Solar': '☀',
        };

        for (const [key, icon] of Object.entries(icons)) {
            if (name.includes(key)) return icon;
        }
        return name.charAt(0);
    };

    return (
        <div
            ref={cardRef}
            className={cn(
                "card-premium mb-12 opacity-0 translate-y-8 transition-all duration-700 ease-out",
                isIntersecting && "opacity-100 translate-y-0"
            )}
            style={{ backgroundImage: getBgGradient() }}
        >
            {/* Logo or Icon */}
            <div className="h-24 mb-6 flex items-center justify-center overflow-hidden">
                {startup.logo ? (
                    <img
                        src={startup.logo}
                        alt={`${startup.name} logo`}
                        className="max-h-full max-w-full object-contain opacity-90 transition-opacity hover:opacity-100"
                        onError={(e) => {
                            // Fallback if image fails to load
                            (e.target as HTMLImageElement).style.display = 'none';
                            const fallback = (e.target as HTMLImageElement).parentElement?.querySelector('.fallback-icon');
                            if (fallback) (fallback as HTMLElement).style.display = 'block';
                        }}
                    />
                ) : null}
                <div
                    className={cn(
                        "text-5xl opacity-40 fallback-icon",
                        startup.logo ? "hidden" : "block"
                    )}
                >
                    {getStartupIcon(startup.name)}
                </div>
            </div>

            {/* Startup Name - Large Serif */}
            <h3 className="text-3xl font-serif text-text-primary mb-3 tracking-tight leading-tight px-4">
                {startup.name}
            </h3>

            {/* Description - Regular Text */}
            <p className="text-text-secondary text-base font-normal leading-relaxed mb-6 px-6 max-w-sm mx-auto">
                {startup.description}
            </p>

            {/* More Info Toggle */}
            {startup.fullDescription && (
                <button
                    onClick={() => setExpanded(!expanded)}
                    className="text-[10px] font-bold tracking-[0.2em] uppercase text-text-secondary/60 hover:text-primary-dark transition-all mb-8 pb-1 border-b border-transparent hover:border-primary-dark/20"
                >
                    {expanded ? "Show Less" : "More Information"}
                </button>
            )}

            {/* Expanded Description */}
            {expanded && startup.fullDescription && (
                <div className="mb-8 pt-6 border-t border-black/5 max-w-md text-sm leading-relaxed text-text-secondary px-6 animate-slide-up">
                    {startup.fullDescription}
                </div>
            )}

            {/* Primary CTA Button - Dark Navy, VISIBLE */}
            <button
                onClick={onToggleMeeting}
                disabled={loading}
                className={cn(
                    'w-full max-w-[240px] py-4 px-8 rounded-full font-bold text-[11px] tracking-[0.15em] uppercase transition-all duration-300 mb-8 shadow-sm hover:shadow-md active:scale-95',
                    isRequested
                        ? 'bg-white text-primary border-2 border-primary/20'
                        : 'bg-primary text-white hover:opacity-90'
                )}
            >
                {loading ? (
                    <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin mx-auto" />
                ) : (
                    isRequested ? '✓ Requested' : 'Meet Startup'
                )}
            </button>

            {/* Two Small Circular Icons Below Button */}
            <div className="flex gap-4 justify-center items-center">
                {startup.website && (
                    <a
                        href={startup.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-10 h-10 rounded-full bg-black/5 flex items-center justify-center text-text-secondary/60 hover:text-text-secondary hover:bg-black/10 transition-all"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <Globe className="w-5 h-5" strokeWidth={1.5} />
                    </a>
                )}
                {startup.linkedin && (
                    <a
                        href={startup.linkedin}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-10 h-10 rounded-full bg-black/5 flex items-center justify-center text-text-secondary/60 hover:text-text-secondary hover:bg-black/10 transition-all"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <Linkedin className="w-5 h-5" strokeWidth={1.5} />
                    </a>
                )}
            </div>
        </div>
    );
};

export default StartupCard;
