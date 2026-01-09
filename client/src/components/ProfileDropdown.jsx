import React, { useState, useRef, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { User as UserIcon, Settings, LogOut, ChevronDown, Briefcase } from 'lucide-react';
import { logout } from '@/store/slices/authSlice';

const ProfileDropdown = () => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { user } = useSelector((state) => state.auth);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOpen]);

    const handleLogout = () => {
        dispatch(logout());
        navigate('/login');
    };

    // Generate initials from name
    const getInitials = (name) => {
        if (!name) return 'U';
        const names = name.split(' ');
        if (names.length >= 2) {
            return `${names[0][0]}${names[1][0]}`.toUpperCase();
        }
        return name.substring(0, 2).toUpperCase();
    };

    const menuItems = [
        { icon: UserIcon, label: 'Profile', action: () => navigate('/settings') },
        { icon: Settings, label: 'Settings', action: () => navigate('/settings') },
        { icon: Briefcase, label: 'Workspace Settings', action: () => navigate('/settings/workspace') },
        { icon: LogOut, label: 'Logout', action: handleLogout, danger: true },
    ];

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center space-x-2 p-1 rounded-full border border-gray-200 hover:ring-2 hover:ring-primary/20 transition-all"
            >
                {user?.avatar ? (
                    <img
                        src={user.avatar}
                        alt={user.name}
                        className="w-8 h-8 rounded-full object-cover"
                    />
                ) : (
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm">
                        {getInitials(user?.name)}
                    </div>
                )}
                <ChevronDown
                    size={16}
                    className={`text-gray-500 transition-transform ${isOpen ? 'rotate-180' : ''}`}
                />
            </button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: -10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: -10 }}
                        transition={{ duration: 0.15 }}
                        className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-xl border border-gray-100 py-2 z-50"
                    >
                        {/* User Info */}
                        <div className="px-4 py-3 border-b border-gray-100">
                            <p className="font-semibold text-gray-800">{user?.name || 'User'}</p>
                            <p className="text-sm text-gray-500 truncate">{user?.email || 'user@example.com'}</p>
                            <div className="mt-1">
                                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-primary/10 text-primary">
                                    {user?.position || 'Team Member'}
                                </span>
                            </div>
                        </div>

                        {/* Menu Items */}
                        <div className="py-1">
                            {menuItems.map((item, index) => (
                                <button
                                    key={index}
                                    onClick={() => {
                                        item.action();
                                        setIsOpen(false);
                                    }}
                                    className={`w-full flex items-center px-4 py-2.5 text-sm transition-colors ${item.danger
                                        ? 'text-red-600 hover:bg-red-50'
                                        : 'text-gray-700 hover:bg-gray-50'
                                        }`}
                                >
                                    <item.icon size={16} className="mr-3" />
                                    {item.label}
                                </button>
                            ))}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default ProfileDropdown;
