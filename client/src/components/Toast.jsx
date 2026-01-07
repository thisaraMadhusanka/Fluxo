import React, { createContext, useContext, useState } from 'react';
import { X, CheckCircle, AlertCircle, Info } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '@/services/api';

const ToastContext = createContext();

export const useToast = () => {
    const context = useContext(ToastContext);
    if (!context) {
        throw new Error('useToast must be used within ToastProvider');
    }
    return context;
};

export const ToastProvider = ({ children }) => {
    const [toasts, setToasts] = useState([]);

    const addToast = (message, type = 'info', duration = 3000) => {
        const id = Date.now();
        // Convert message to string to handle Error objects and other non-string types
        const messageStr = typeof message === 'string' ? message :
            message instanceof Error ? message.message :
                String(message);
        setToasts(prev => [...prev, { id, message: messageStr, type }]);

        // Play sound - Disabled due to browser autoplay policies
        // Browser security prevents auto-playing audio without user interaction
        /*
        try {
            const audio = new Audio('https://assets.mixkit.co/sfx/preview/mixkit-software-interface-start-2574.mp3');
            audio.volume = 0.5;
            audio.play().catch(e => console.warn('Audio playback failed (interaction required or invalid source)', e));
        } catch (e) {
            console.warn('Audio initialization failed', e);
        }
        */

        if (duration > 0) {
            setTimeout(() => {
                removeToast(id);
            }, duration);
        }

        // Persist to notifications if it's a success/important status
        // Temporarily disabled until server properly restarted with new routes
        /*
        if (type === 'success' || type === 'error') {
            try {
                // Fire and forget
                api.post('/notifications', {
                    title: type === 'success' ? 'Success' : 'Error',
                    message,
                    type: type
                }).catch(err => console.error('Failed to persist notification', err));
            } catch (e) {
                // Ignore API errors for toast side effects
            }
        }
        */
    };

    const removeToast = (id) => {
        setToasts(prev => prev.filter(toast => toast.id !== id));
    };

    const toast = {
        success: (message, duration) => addToast(message, 'success', duration),
        error: (message, duration) => addToast(message, 'error', duration),
        info: (message, duration) => addToast(message, 'info', duration),
    };

    return (
        <ToastContext.Provider value={toast}>
            {children}
            <ToastContainer toasts={toasts} onRemove={removeToast} />
        </ToastContext.Provider>
    );
};

const ToastContainer = ({ toasts, onRemove }) => {
    return (
        <div className="fixed bottom-4 right-4 z-[9999] space-y-2 pointer-events-none flex flex-col-reverse">
            <AnimatePresence>
                {toasts.map(toast => (
                    <Toast key={toast.id} toast={toast} onClose={() => onRemove(toast.id)} />
                ))}
            </AnimatePresence>
        </div>
    );
};

const Toast = ({ toast, onClose }) => {
    const icons = {
        success: <CheckCircle className="text-green-600" size={20} />,
        error: <AlertCircle className="text-red-600" size={20} />,
        info: <Info className="text-blue-600" size={20} />,
    };

    const styles = {
        success: 'bg-green-50 border-green-200 text-green-800',
        error: 'bg-red-50 border-red-200 text-red-800',
        info: 'bg-blue-50 border-blue-200 text-blue-800',
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, x: 100, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className={`flex items-center space-x-3 px-4 py-3 rounded-lg border shadow-lg pointer-events-auto ${styles[toast.type]}`}
        >
            {icons[toast.type]}
            <span className="font-medium text-sm">{toast.message}</span>
            <button
                onClick={onClose}
                className="ml-2 p-1 hover:bg-black/5 rounded transition-colors"
            >
                <X size={16} />
            </button>
        </motion.div>
    );
};

export default ToastProvider;
