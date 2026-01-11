import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { X, CheckCircle, AlertCircle, Info, Bell } from 'lucide-react';

const ToastContext = createContext(null);

export const useToast = () => {
    const context = useContext(ToastContext);
    if (!context) {
        throw new Error('useToast must be used within a ToastProvider');
    }
    return context;
};

const ToastItem = ({ id, type = 'info', title, message, onClose, duration = 5000 }) => {
    useEffect(() => {
        if (duration && duration > 0) {
            const timer = setTimeout(() => {
                onClose(id);
            }, duration);
            return () => clearTimeout(timer);
        }
    }, [duration, id, onClose]);

    const icons = {
        success: <CheckCircle size={20} className="text-green-500" />,
        error: <AlertCircle size={20} className="text-red-500" />,
        info: <Info size={20} className="text-blue-500" />,
        message: <Bell size={20} className="text-primary" />
    };

    const backgrounds = {
        success: 'bg-green-50 border-green-100',
        error: 'bg-red-50 border-red-100',
        info: 'bg-blue-50 border-blue-100',
        message: 'bg-white border-primary/20 shadow-lg shadow-primary/10'
    };

    return (
        <div className={`flex items-start gap-3 p-4 rounded-xl border shadow-sm w-80 animate-in slide-in-from-right-full duration-300 relative ${backgrounds[type] || backgrounds.info}`}>
            <div className="flex-shrink-0 mt-0.5">
                {icons[type] || icons.info}
            </div>
            <div className="flex-1">
                {title && <h4 className="font-bold text-gray-900 text-sm mb-0.5">{title}</h4>}
                <p className="text-xs font-medium text-gray-600 leading-relaxed">{message}</p>
            </div>
            <button
                onClick={() => onClose(id)}
                className="absolute top-2 right-2 p-1 text-gray-400 hover:text-gray-600 rounded-full hover:bg-black/5"
            >
                <X size={14} />
            </button>
        </div>
    );
};

export const ToastProvider = ({ children }) => {
    const [toasts, setToasts] = useState([]);

    const addToast = useCallback((type, title, message, duration = 5000) => {
        const id = Date.now() + Math.random();
        console.log('🍞 Adding toast:', { type, title, message, duration });
        setToasts((prev) => [...prev, { id, type, title, message, duration }]);
    }, []);

    const removeToast = useCallback((id) => {
        console.log('🗑️ Removing toast:', id);
        setToasts((prev) => prev.filter((t) => t.id !== id));
    }, []);

    const value = useMemo(() => ({
        success: (message, title = 'Success', duration = 8000) => addToast('success', title, message, duration),
        error: (message, title = 'Error', duration = 8000) => addToast('error', title, message, duration),
        info: (message, title = 'Info', duration = 8000) => addToast('info', title, message, duration),
        message: (message, title = 'New Message', duration = 8000) => {
            console.log('📨 Toast.message called with:', { message, title, duration });
            addToast('message', title, message, duration);
        },
        custom: (type, title, message, duration) => addToast(type, title, message, duration)
    }), [addToast]);

    return (
        <ToastContext.Provider value={value}>
            {children}
            <div className="fixed bottom-6 right-6 z-[9999] flex flex-col gap-3 pointer-events-none">
                {toasts.map((toast) => (
                    <div key={toast.id} className="pointer-events-auto">
                        <ToastItem {...toast} onClose={removeToast} />
                    </div>
                ))}
            </div>
        </ToastContext.Provider>
    );
};

export default ToastItem;
