import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import {
    LayoutDashboard, FolderKanban, CheckSquare, KanbanSquare,
    Calendar, Clock, Files, Users, Settings, ChevronLeft, ChevronRight, LayoutTemplate, MessageCircle
} from 'lucide-react';
import { toggleSidebar } from '@/store/slices/uiSlice';
import { clsx } from 'clsx';
import { AnimatePresence, motion } from 'framer-motion';
import WorkspaceSwitcher from './WorkspaceSwitcher';

const menuItems = [
    { name: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
    { name: 'Projects', icon: FolderKanban, path: '/projects' },
    { name: 'Tasks', icon: CheckSquare, path: '/tasks' },
    { name: 'Messages', icon: MessageCircle, path: '/messages' },
    { name: 'Workspace', icon: Settings, path: '/settings/workspace' },
];

const Sidebar = () => {
    const { sidebarOpen } = useSelector((state) => state.ui);
    const { user } = useSelector((state) => state.auth);
    const dispatch = useDispatch();
    const location = useLocation();

    return (
        <>
            {/* Mobile Overlay */}
            <AnimatePresence>
                {sidebarOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => dispatch(toggleSidebar())}
                        className="fixed inset-0 bg-black/50 z-20 md:hidden backdrop-blur-sm"
                    />
                )}
            </AnimatePresence>

            <motion.aside
                initial={false}
                animate={{
                    width: window.innerWidth >= 768 ? (sidebarOpen ? 240 : 80) : (sidebarOpen ? 280 : 0),
                    x: window.innerWidth < 768 && !sidebarOpen ? -280 : 0
                }}
                transition={{ duration: 0.3, type: "spring", bounce: 0, damping: 15 }}
                className={`h-screen bg-sidebar text-white flex flex-col fixed left-0 top-0 z-30 border-r border-gray-800 ${
                    // On mobile, if not open, we want it hidden from layout flow/clicks (handled by x translate and width)
                    // But we might need explicit handling for resizing events
                    ''
                    }`}
            >
                {/* Header */}
                <div className={`h-20 flex items-center ${sidebarOpen ? 'justify-between px-6' : 'justify-center'} border-b border-gray-800/30 min-w-[240px] md:min-w-[auto]`}>
                    <div className="flex items-center gap-3">
                        <img src="/logo.png" alt="Fluxo" className="w-[36px] h-[36px] object-contain" />
                        {(sidebarOpen || window.innerWidth < 768) && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="font-bold text-[36px] tracking-tighter leading-none"
                            >
                                Flux<span className="text-orange-500">o</span>
                            </motion.div>
                        )}
                    </div>
                </div>

                {/* Workspace Switcher */}
                <div className={`px-3 pt-4 ${(!sidebarOpen && window.innerWidth >= 768) && 'hidden'}`}>
                    <WorkspaceSwitcher />
                </div>

                {/* Menu */}
                <nav className="flex-1 overflow-y-auto py-4 flex flex-col scrollbar-thin scrollbar-thumb-gray-800">
                    <ul className="space-y-1 px-2">
                        {menuItems.map((item) => {
                            const Icon = item.icon;
                            // const isActive = location.pathname === item.path;

                            return (
                                <li key={item.path}>
                                    <NavLink
                                        to={item.path}
                                        onClick={() => window.innerWidth < 768 && dispatch(toggleSidebar())} // Close on mobile click
                                        className={({ isActive }) => clsx(
                                            "flex items-center px-4 py-3 rounded-lg transition-all duration-200 group relative overflow-hidden whitespace-nowrap",
                                            !sidebarOpen && window.innerWidth >= 768 ? "justify-center px-2" : "",
                                            isActive ? "bg-primary text-white shadow-lg" : "text-gray-400 hover:bg-gray-800 hover:text-white"
                                        )}
                                        title={!sidebarOpen && window.innerWidth >= 768 ? item.name : ''}
                                    >
                                        <Icon size={20} className="min-w-[20px]" />
                                        {(sidebarOpen || window.innerWidth < 768) && (
                                            <motion.span
                                                initial={{ opacity: 0, x: -10 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{ delay: 0.1 }}
                                                className="ml-3 font-medium"
                                            >
                                                {item.name}
                                            </motion.span>
                                        )}
                                    </NavLink>
                                </li>
                            );
                        })}

                        {/* Admin Link (Owner Only) */}
                        {user?.role === 'Owner' && (
                            <li>
                                <NavLink
                                    to="/admin"
                                    onClick={() => window.innerWidth < 768 && dispatch(toggleSidebar())}
                                    className={({ isActive }) => clsx(
                                        "flex items-center px-4 py-3 rounded-lg transition-all duration-200 group relative overflow-hidden whitespace-nowrap",
                                        !sidebarOpen && window.innerWidth >= 768 ? "justify-center px-2" : "",
                                        isActive ? "bg-primary text-white shadow-lg" : "text-gray-400 hover:bg-gray-800 hover:text-white"
                                    )}
                                    title={!sidebarOpen && window.innerWidth >= 768 ? 'Admin' : ''}
                                >
                                    <Users size={20} className="min-w-[20px]" />
                                    {(sidebarOpen || window.innerWidth < 768) && (
                                        <motion.span
                                            initial={{ opacity: 0, x: -10 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: 0.1 }}
                                            className="ml-3 font-medium"
                                        >
                                            Admin
                                        </motion.span>
                                    )}
                                </NavLink>
                            </li>
                        )}
                    </ul>

                    {/* Bottom Section - Account Settings & Support */}
                    <div className="mt-auto px-2 pb-4 space-y-2">
                        {(sidebarOpen || window.innerWidth < 768) && (
                            <div className="px-4 py-2 text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                                Account
                            </div>
                        )}

                        <NavLink
                            to="/settings"
                            onClick={() => window.innerWidth < 768 && dispatch(toggleSidebar())}
                            className={({ isActive }) => clsx(
                                "flex items-center px-4 py-3 rounded-lg transition-all duration-200 group relative overflow-hidden whitespace-nowrap",
                                !sidebarOpen && window.innerWidth >= 768 ? "justify-center px-2" : "",
                                isActive ? "bg-primary text-white shadow-lg" : "text-gray-400 hover:bg-gray-800 hover:text-white"
                            )}
                            title={!sidebarOpen && window.innerWidth >= 768 ? 'Settings' : ''}
                        >
                            <Settings size={20} className="min-w-[20px]" />
                            {(sidebarOpen || window.innerWidth < 768) && (
                                <motion.span
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.1 }}
                                    className="ml-3 font-medium"
                                >
                                    Settings
                                </motion.span>
                            )}
                        </NavLink>

                        <NavLink
                            to="/help"
                            onClick={() => window.innerWidth < 768 && dispatch(toggleSidebar())}
                            className={({ isActive }) => clsx(
                                "flex items-center px-4 py-3 rounded-lg transition-all duration-200 group relative overflow-hidden whitespace-nowrap",
                                !sidebarOpen && window.innerWidth >= 768 ? "justify-center px-2" : "",
                                isActive ? "bg-primary text-white shadow-lg" : "text-gray-400 hover:bg-gray-800 hover:text-white"
                            )}
                            title={!sidebarOpen && window.innerWidth >= 768 ? 'Help & Support' : ''}
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="min-w-[20px]">
                                <circle cx="12" cy="12" r="10" />
                                <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
                                <path d="M12 17h.01" />
                            </svg>
                            {(sidebarOpen || window.innerWidth < 768) && (
                                <motion.span
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.1 }}
                                    className="ml-3 font-medium"
                                >
                                    Help & Support
                                </motion.span>
                            )}
                        </NavLink>

                        {(sidebarOpen || window.innerWidth < 768) && (
                            <button
                                onClick={() => dispatch(toggleSidebar())}
                                className="w-full flex items-center px-4 py-2.5 rounded-lg text-gray-400 hover:bg-gray-800 hover:text-white transition-all duration-200"
                            >
                                <ChevronLeft size={18} className="min-w-[18px]" />
                                <span className="ml-3 font-medium text-sm">Hide</span>
                            </button>
                        )}
                    </div>

                    {/* Unhide Button - Bottom of Collapsed Sidebar (Desktop Only) */}
                    {!sidebarOpen && window.innerWidth >= 768 && (
                        <div className="px-2 pb-4">
                            <button
                                onClick={() => dispatch(toggleSidebar())}
                                className="w-full py-3 px-2 bg-primary/10 hover:bg-primary/20 rounded-lg text-primary hover:text-primary transition-all duration-200 flex items-center justify-center group border border-primary/20"
                                title="Show Sidebar"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="group-hover:translate-x-0.5 transition-transform">
                                    <polyline points="9 18 15 12 9 6" />
                                    <polyline points="15 18 21 12 15 6" />
                                </svg>
                            </button>
                        </div>
                    )}
                </nav>
            </motion.aside>
        </>
    );
};

export default Sidebar;
