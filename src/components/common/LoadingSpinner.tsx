import React from 'react';
import { cn } from '@/utils/helpers';

interface LoadingSpinnerProps {
    size?: 'sm' | 'md' | 'lg';
    className?: string;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ size = 'md', className }) => {
    const sizeClasses = {
        sm: 'w-6 h-6 border-2',
        md: 'w-12 h-12 border-4',
        lg: 'w-16 h-16 border-4',
    };

    return (
        <div
            className={cn(
                'border-primary border-t-transparent rounded-full animate-spin',
                sizeClasses[size],
                className
            )}
        />
    );
};

export default LoadingSpinner;
