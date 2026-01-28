import React, { useEffect } from 'react';
import { X, CheckCircle, AlertCircle, Info } from 'lucide-react';
import { cn } from '@/utils/helpers';

export type ToastType = 'success' | 'error' | 'info';

interface ToastProps {
    message: string;
    type?: ToastType;
    onClose: () => void;
    duration?: number;
}

const Toast: React.FC<ToastProps> = ({ message, type = 'info', onClose, duration = 3000 }) => {
    useEffect(() => {
        if (duration > 0) {
            const timer = setTimeout(onClose, duration);
            return () => clearTimeout(timer);
        }
    }, [duration, onClose]);

    const icons = {
        success: <CheckCircle className="w-5 h-5" />,
        error: <AlertCircle className="w-5 h-5" />,
        info: <Info className="w-5 h-5" />,
    };

    const styles = {
        success: 'bg-green-500 text-white',
        error: 'bg-red-500 text-white',
        info: 'bg-primary text-white',
    };

    return (
        <div
            className={cn(
                'fixed bottom-24 left-4 right-4 z-50 flex items-center gap-3 px-4 py-3 rounded-2xl shadow-elevated animate-slide-up',
                styles[type]
            )}
        >
            {icons[type]}
            <p className="flex-1 font-medium">{message}</p>
            <button
                onClick={onClose}
                className="p-1 hover:bg-white hover:bg-opacity-20 rounded-full transition-colors touch-target"
            >
                <X className="w-5 h-5" />
            </button>
        </div>
    );
};

export default Toast;
