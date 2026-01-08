import React, { useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Check, Trash2, Bell, Clock, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import clsx from 'clsx';

const NotificationDropdown = ({ isOpen, onClose, notifications, unreadCount, onMarkRead, onDismiss, onClearAll }) => {
    const dropdownRef = useRef(null);
    const navigate = useNavigate();

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                onClose();
            }
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOpen, onClose]);

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    ref={dropdownRef}
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                    className="absolute right-0 top-full mt-2 w-96 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden z-[9999]"
                    style={{ maxHeight: '500px' }}
                >
                    {/* Header */}
                    <div className="p-4 px-5 border-b border-gray-100 flex justify-between items-center bg-white/80 backdrop-blur-md sticky top-0 z-10">
                        <div className="flex items-center gap-2.5">
                            <div className="relative p-1.5 bg-gray-50 rounded-lg">
                                <Bell size={16} className="text-gray-900" />
                                {unreadCount > 0 && (
                                    <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-rose-500 rounded-full border-2 border-white shadow-sm"></span>
                                )}
                            </div>
                            <div>
                                <h3 className="font-bold text-gray-900 text-sm leading-tight">Notifications</h3>
                                <p className="text-[10px] font-medium text-gray-400 uppercase tracking-wider">
                                    {unreadCount} Unread
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-1.5 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                            <X size={18} />
                        </button>
                    </div>

                    {/* Content */}
                    <div className="overflow-y-auto custom-scrollbar flex-1 bg-white">
                        {notifications.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-[300px] text-gray-400">
                                <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center mb-4">
                                    <Bell size={24} className="text-gray-300" />
                                </div>
                                <p className="text-sm font-bold text-gray-900">All caught up!</p>
                                <p className="text-xs mt-1.5 text-gray-500">No new notifications for now.</p>
                            </div>
                        ) : (
                            <div className="divide-y divide-gray-50">
                                {notifications.map((notification) => (
                                    <motion.div
                                        layout
                                        key={notification._id}
                                        className={clsx(
                                            "p-4 px-5 relative group transition-all duration-200 cursor-default",
                                            !notification.isRead ? "bg-blue-50/30" : "hover:bg-gray-50"
                                        )}
                                    >
                                        <div className="flex gap-4">
                                            {/* Icon/Avatar Placeholder */}
                                            <div className={clsx(
                                                "mt-1 w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm border border-black/5 overflow-hidden",
                                                notification.type === 'task_assigned' ? 'bg-indigo-50 text-indigo-600' :
                                                    notification.type === 'system' ? 'bg-white p-1' :
                                                        notification.type === 'task_updated' ? 'bg-amber-50 text-amber-600' :
                                                            'bg-gray-100 text-gray-500'
                                            )}>
                                                {notification.type === 'system' ? (
                                                    <img src="/logo.png" alt="Fluxo" className="w-full h-full object-contain" />
                                                ) : (
                                                    <Bell size={18} />
                                                )}
                                            </div>

                                            <div className="flex-1 min-w-0">
                                                <div className="flex justify-between items-start gap-2 mb-0.5">
                                                    <h4 className={clsx(
                                                        "text-sm font-bold truncate pr-6",
                                                        !notification.isRead ? "text-gray-900" : "text-gray-600"
                                                    )}>
                                                        {notification.title}
                                                    </h4>
                                                    {!notification.isRead && (
                                                        <span className="w-2 h-2 rounded-full bg-blue-500 flex-shrink-0 mt-1.5 ring-4 ring-blue-500/10"></span>
                                                    )}
                                                </div>
                                                <p className="text-sm text-gray-500 leading-snug mb-2.5 line-clamp-2 font-medium">
                                                    {notification.message}
                                                </p>
                                                <div className="flex items-center gap-3">
                                                    <span className="flex items-center gap-1 text-[10px] font-bold text-gray-400 uppercase tracking-wide">
                                                        <Clock size={10} />
                                                        {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                                                    </span>
                                                </div>

                                                {/* Action Link (if any) */}
                                                {notification.link && (
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            if (!notification.isRead) {
                                                                onMarkRead(notification._id);
                                                            }
                                                            navigate(notification.link);
                                                            onClose();
                                                        }}
                                                        className="mt-3 w-full py-2 bg-gray-900 hover:bg-black text-white text-xs font-bold rounded-lg transition-all shadow-md shadow-gray-200 flex items-center justify-center gap-1 group/btn"
                                                    >
                                                        View Details <ChevronRight size={12} className="group-hover/btn:translate-x-0.5 transition-transform" />
                                                    </button>
                                                )}
                                            </div>

                                            {/* Hover Actions */}
                                            <div className="absolute right-2 top-2 flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-all scale-95 group-hover:scale-100">
                                                {!notification.isRead && (
                                                    <button
                                                        onClick={(e) => { e.stopPropagation(); onMarkRead(notification._id); }}
                                                        className="p-1.5 bg-white text-gray-400 hover:text-emerald-500 rounded-lg shadow-sm border border-gray-100 hover:border-emerald-200 transition-colors"
                                                        title="Mark as read"
                                                    >
                                                        <Check size={14} strokeWidth={3} />
                                                    </button>
                                                )}
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); onDismiss(notification._id); }}
                                                    className="p-1.5 bg-white text-gray-400 hover:text-rose-500 rounded-lg shadow-sm border border-gray-100 hover:border-rose-200 transition-colors"
                                                    title="Dismiss"
                                                >
                                                    <Trash2 size={14} />
                                                </button>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    <div className="p-3 bg-gray-50 border-t border-gray-100 text-center sticky bottom-0 z-10">
                        {notifications.length > 0 && (
                            <button
                                onClick={onClearAll}
                                className="text-[10px] font-black text-gray-400 hover:text-rose-500 uppercase tracking-[2px] transition-colors w-full py-1"
                            >
                                Clear All
                            </button>
                        )}
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};
export default NotificationDropdown;
