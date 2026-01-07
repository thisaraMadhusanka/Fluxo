import React, { useState, useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Search, Bell, Calendar as CalendarIcon, Folder, CheckSquare } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import ProfileDropdown from './ProfileDropdown';
import NotificationDropdown from './NotificationDropdown';
import { fetchNotifications, markAsRead, deleteNotification, markAllAsRead, clearAllNotifications } from '@/store/slices/notificationSlice';

const Topbar = () => {
    const { user } = useSelector((state) => state.auth);
    const { notifications, unreadCount } = useSelector((state) => state.notifications);
    const { tasks } = useSelector((state) => state.tasks);
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const [isNotificationOpen, setIsNotificationOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState({ tasks: [], projects: [] });
    const [showSearchResults, setShowSearchResults] = useState(false);
    const searchRef = useRef(null);

    useEffect(() => {
        dispatch(fetchNotifications({ limit: 10 }));

        // Setup polling for notifications
        const interval = setInterval(() => {
            dispatch(fetchNotifications({ limit: 10, unreadOnly: false }));
        }, 60000); // Poll every minute

        return () => clearInterval(interval);
    }, [dispatch]);

    // Close search results when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (searchRef.current && !searchRef.current.contains(event.target)) {
                setShowSearchResults(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Search functionality
    useEffect(() => {
        if (searchQuery.trim() === '') {
            setSearchResults({ tasks: [], projects: [] });
            setShowSearchResults(false);
            return;
        }

        const query = searchQuery.toLowerCase();
        const filteredTasks = (tasks || []).filter(
            (task) =>
                task.title?.toLowerCase().includes(query) ||
                task.description?.toLowerCase().includes(query)
        ).slice(0, 5);

        setSearchResults({ tasks: filteredTasks, projects: [] });
        setShowSearchResults(true);
    }, [searchQuery, tasks]);

    const handleMarkRead = (id) => {
        dispatch(markAsRead(id));
    };

    const handleDismiss = (id) => {
        dispatch(deleteNotification(id));
    };

    const handleClearAll = () => {
        dispatch(clearAllNotifications());
    };

    const handleSearchResultClick = (task) => {
        setSearchQuery('');
        setShowSearchResults(false);
        navigate(`/ tasks`);
    };

    return (
        <div className="h-16 bg-white border-b border-gray-100 flex items-center justify-between px-8 sticky top-0 z-20">
            {/* Search Bar */}
            <div className="flex-1 max-w-xl relative" ref={searchRef}>
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <input
                    type="text"
                    placeholder="Search tasks, projects..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onFocus={() => searchQuery && setShowSearchResults(true)}
                    className="w-full pl-10 pr-4 py-2 bg-gray-50 border-none rounded-xl text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all font-medium"
                />

                {/* Search Results Dropdown */}
                <AnimatePresence>
                    {showSearchResults && (searchResults.tasks.length > 0) && (
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-2xl border border-gray-100 overflow-hidden z-[9999]"
                        >
                            {searchResults.tasks.length > 0 && (
                                <div>
                                    <div className="px-4 py-2 bg-gray-50 border-b border-gray-100">
                                        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Tasks</h3>
                                    </div>
                                    <div className="max-h-64 overflow-y-auto">
                                        {searchResults.tasks.map((task) => (
                                            <button
                                                key={task._id}
                                                onClick={() => handleSearchResultClick(task)}
                                                className="w-full px-4 py-3 hover:bg-gray-50 transition-colors flex items-start gap-3 text-left border-b border-gray-50 last:border-0"
                                            >
                                                <CheckSquare size={16} className="text-primary mt-0.5 flex-shrink-0" />
                                                <div className="flex-1 min-w-0">
                                                    <p className="font-medium text-gray-900 truncate">{task.title}</p>
                                                    {task.description && (
                                                        <p className="text-xs text-gray-500 truncate mt-0.5">{task.description}</p>
                                                    )}
                                                </div>
                                                <span className="text-xs text-gray-400 flex-shrink-0">{task.status}</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {searchResults.tasks.length === 0 && searchQuery && (
                                <div className="px-4 py-8 text-center text-gray-500">
                                    <Search size={32} className="mx-auto mb-2 text-gray-300" />
                                    <p className="text-sm">No results found for "{searchQuery}"</p>
                                </div>
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Right Actions */}
            <div className="flex items-center space-x-4 ml-4">
                {/* Date Range Filter Dummy */}
                <button className="flex items-center space-x-2 text-sm text-gray-600 hover:bg-gray-100 px-3 py-2 rounded-lg transition-colors">
                    <CalendarIcon size={16} />
                    <span>This Month</span>
                </button>

                {/* Notifications */}
                <div className="relative">
                    <button
                        onClick={() => setIsNotificationOpen(!isNotificationOpen)}
                        className={`relative p - 2 rounded - full transition - colors ${isNotificationOpen ? 'bg-primary/10 text-primary' : 'text-gray-500 hover:bg-gray-100'} ${unreadCount > 0 ? 'bell-shake' : ''} `}
                    >
                        <Bell size={20} />
                        {unreadCount > 0 && (
                            <span className="absolute top-1 right-1 w-2 h-2 bg-danger rounded-full border-2 border-white animate-pulse"></span>
                        )}
                        <style jsx>{`
@keyframes bell - shake {
    0 % { transform: rotate(0); }
    15 % { transform: rotate(5deg); }
    30 % { transform: rotate(-5deg); }
    45 % { transform: rotate(4deg); }
    60 % { transform: rotate(-4deg); }
    75 % { transform: rotate(2deg); }
    85 % { transform: rotate(-2deg); }
    100 % { transform: rotate(0); }
}
                            .bell - shake {
    animation: bell - shake 2s infinite;
    transform - origin: top center;
}
`}</style>
                    </button>
                    <AnimatePresence>
                        {isNotificationOpen && (
                            <NotificationDropdown
                                isOpen={isNotificationOpen}
                                onClose={() => setIsNotificationOpen(false)}
                                notifications={notifications}
                                unreadCount={unreadCount}
                                onMarkRead={handleMarkRead}
                                onDismiss={handleDismiss}
                                onClearAll={handleClearAll}
                            />
                        )}
                    </AnimatePresence>
                </div>

                {/* Profile Dropdown */}
                <ProfileDropdown />
            </div>
        </div>
    );
};

export default Topbar;
