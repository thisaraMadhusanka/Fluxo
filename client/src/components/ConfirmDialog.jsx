import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, Info, CheckCircle, X } from 'lucide-react';

const ConfirmDialog = ({
    isOpen,
    onClose,
    onConfirm,
    title,
    message,
    variant = 'primary', // primary, danger, success
    confirmText = 'Confirm',
    cancelText = 'Cancel',
    danger = false // for backward compatibility
}) => {
    if (!isOpen) return null;

    // Map legacy danger prop to variant
    const activeVariant = danger ? 'danger' : variant;

    const getIcon = () => {
        switch (activeVariant) {
            case 'danger': return <AlertTriangle size={24} />;
            case 'success': return <CheckCircle size={24} />;
            default: return <Info size={24} />;
        }
    };

    const getColors = () => {
        switch (activeVariant) {
            case 'danger': return {
                iconBg: 'bg-red-100 text-red-600',
                btnBg: 'bg-red-600 hover:bg-red-700'
            };
            case 'success': return {
                iconBg: 'bg-green-100 text-green-600',
                btnBg: 'bg-green-600 hover:bg-green-700'
            };
            default: return {
                iconBg: 'bg-blue-100 text-blue-600',
                btnBg: 'bg-primary hover:bg-primary/90'
            };
        }
    };

    const colors = getColors();

    return (
        <AnimatePresence mode="wait">
            <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                    onClick={onClose}
                />
                <motion.div
                    initial={{ scale: 0.95, opacity: 0, y: 10 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0.95, opacity: 0, y: 10 }}
                    className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden"
                >
                    <div className="p-8 pb-6 text-center">
                        <div className="flex justify-center mb-5">
                            <div className={`p-4 rounded-full ${colors.iconBg}`}>
                                {getIcon()}
                            </div>
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">{title}</h3>
                        <p className="text-sm text-gray-500 leading-relaxed">{message}</p>
                    </div>

                    <div className="px-8 pb-8 flex space-x-3">
                        <button
                            onClick={onClose}
                            className="flex-1 px-4 py-3 bg-white border border-gray-200 rounded-xl text-gray-600 hover:bg-gray-50 font-bold text-sm transition-all"
                        >
                            {cancelText}
                        </button>
                        <button
                            onClick={() => { onConfirm(); onClose(); }}
                            className={`flex-1 px-4 py-3 rounded-xl text-white font-bold text-sm shadow-lg shadow-gray-200 transition-all active:scale-95 ${colors.btnBg}`}
                        >
                            {confirmText}
                        </button>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};

export default ConfirmDialog;
