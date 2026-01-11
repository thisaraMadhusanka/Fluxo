import React, { useState, useEffect } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import Sidebar from '@/components/Sidebar'; // Removed TimeTracker
import ProfileDropdown from '@/components/ProfileDropdown';
import { Menu, Bell, Search } from 'lucide-react'; // Removed UserIcon
import { useDispatch, useSelector } from 'react-redux';
import { toggleSidebar } from '@/store/slices/uiSlice';
import { fetchWorkspaces } from '@/store/slices/workspaceSlice';
import NotificationDropdown from '@/components/NotificationDropdown';
import { fetchNotifications, markAsRead, markAllAsRead, deleteNotification, clearAllNotifications, addNotification } from '@/store/slices/notificationSlice';
import socketService from '@/services/socket';
import { useToast } from '@/components/Toast';

const DashboardLayout = ({ children }) => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { sidebarOpen } = useSelector((state) => state.ui);
    const { user } = useSelector((state) => state.auth);
    const toast = useToast();

    // Notification State
    const [isNotificationOpen, setIsNotificationOpen] = useState(false);
    const { notifications, unreadCount } = useSelector((state) => state.notifications);

    useEffect(() => {
        dispatch(fetchWorkspaces());
        // Initial fetch
        dispatch(fetchNotifications({ limit: 10 }));

        // Socket Listeners for Notifications
        // Wait for socket to be ready, then add listener
        const checkAndSetupListener = () => {
            if (socketService.socket) {
                console.log('📡 Setting up notification listener');

                socketService.socket.on('notification:new', (data) => {
                    console.log('🔔 New notification received:', data);

                    // Show toast (title, message format)
                    toast.message(`${data.title} ${data.message}`, 'New Message', 8000);

                    // Add to Redux store directly for immediate UI update
                    dispatch(addNotification({
                        _id: Date.now().toString(),
                        title: data.title,
                        message: data.message,
                        type: 'message',
                        isRead: false,
                        createdAt: new Date().toISOString(),
                        link: `/messages/${data.conversationId}`, // Ensure link works
                        ...data
                    }));

                    // Removed fetchNotifications to prevent overwriting with stale server data
                    // dispatch(fetchNotifications({ limit: 10 }));
                });
            } else {
                // Retry after delay
                console.log('⏳ Waiting for socket connection...');
                setTimeout(checkAndSetupListener, 500);
            }
        };

        // Start checking for socket
        checkAndSetupListener();

        // Polling every 60 seconds as backup
        const interval = setInterval(() => {
            dispatch(fetchNotifications({ limit: 10 }));
        }, 60000);

        return () => {
            clearInterval(interval);
            if (socketService.socket) {
                socketService.socket.off('notification:new');
            }
        };
    }, [dispatch, toast]);

    return (
        <div className="flex h-screen bg-gray-50 overflow-hidden">
            <Sidebar />

            <div
                className={`flex-1 flex flex-col overflow-hidden transition-all duration-300 ${sidebarOpen ? 'md:ml-[240px]' : 'md:ml-[80px]'} ml-0`}
            >
                {/* Header */}
                <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 flex-shrink-0 z-10">
                    <div className="flex items-center">
                        <button
                            onClick={() => dispatch(toggleSidebar())}
                            className="p-2 rounded-lg hover:bg-gray-100 text-gray-500 mr-4 lg:hidden"
                        >
                            <Menu size={20} />
                        </button>

                        <div className="relative hidden md:block">
                            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search tasks, projects..."
                                className="pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary w-64 transition-all"
                            />
                        </div>
                    </div>

                    <div className="flex items-center space-x-4 relative">
                        {/* Notification Bell */}
                        <div className="relative">
                            <button
                                onClick={() => setIsNotificationOpen(!isNotificationOpen)}
                                className="p-2 rounded-lg hover:bg-gray-100 text-gray-500 relative transition-colors"
                            >
                                <Bell size={20} />
                                {unreadCount > 0 && (
                                    <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
                                )}
                            </button>

                            <NotificationDropdown
                                isOpen={isNotificationOpen}
                                onClose={() => setIsNotificationOpen(false)}
                                notifications={notifications}
                                unreadCount={unreadCount}
                                onMarkRead={(id) => dispatch(markAsRead(id))}
                                onMarkAllRead={() => dispatch(markAllAsRead())}
                                onDismiss={(id) => dispatch(deleteNotification(id))}
                                onClearAll={() => dispatch(clearAllNotifications())}
                            />
                        </div>

                        <div className="pl-4 border-l border-gray-200">
                            <ProfileDropdown />
                        </div>
                    </div>
                </header>

                {/* Main Content */}
                <main className="flex-1 overflow-auto p-6">
                    {children || <Outlet />}
                </main>
            </div>
        </div>
    );
};

export default DashboardLayout;
