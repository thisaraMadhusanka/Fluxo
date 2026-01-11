import React from 'react';
import { X, Mail, Briefcase, Calendar } from 'lucide-react';
import { format } from 'date-fns';

const UserProfileModal = ({ isOpen, onClose, user }) => {
    if (!isOpen || !user) return null;

    // Get initials for avatar fallback
    const getInitials = (name) => {
        return name
            ?.split(' ')
            .map(word => word.charAt(0).toUpperCase())
            .join('')
            .slice(0, 2) || '?';
    };

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden animate-in fade-in zoom-in-95 duration-300">
                {/* Header with gradient background */}
                <div className="h-32 bg-gradient-to-br from-primary via-orange-500 to-orange-600 relative">
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 p-2 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-full text-white transition-all"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Profile content */}
                <div className="px-8 pb-8 -mt-16">
                    {/* Avatar */}
                    <div className="flex justify-center mb-6">
                        <div className="relative">
                            {user.avatar ? (
                                <img
                                    src={user.avatar}
                                    alt={user.name}
                                    className="w-32 h-32 rounded-full border-4 border-white shadow-xl object-cover"
                                />
                            ) : (
                                <div className="w-32 h-32 rounded-full border-4 border-white shadow-xl bg-gradient-to-br from-primary to-orange-600 flex items-center justify-center">
                                    <span className="text-white font-black text-5xl">
                                        {getInitials(user.name)}
                                    </span>
                                </div>
                            )}
                            {/* Online status indicator (if needed) */}
                            <div className="absolute bottom-2 right-2 w-6 h-6 bg-green-500 rounded-full border-4 border-white shadow-md"></div>
                        </div>
                    </div>

                    {/* User info */}
                    <div className="text-center mb-6">
                        <h2 className="text-3xl font-black text-gray-900 mb-2">{user.name}</h2>
                        <p className="text-sm font-black text-primary uppercase tracking-widest mb-3">
                            {user.role || 'MEMBER'}
                        </p>
                        <p className="text-gray-600 text-sm leading-relaxed italic">
                            {user.bio || 'Fluxo project management team member'}
                        </p>
                    </div>

                    {/* Details */}
                    <div className="space-y-3 bg-gray-50 rounded-2xl p-5">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-primary/10 rounded-lg">
                                <Mail size={18} className="text-primary" />
                            </div>
                            <div className="flex-1">
                                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Email</p>
                                <p className="text-sm font-bold text-gray-700">{user.email}</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-primary/10 rounded-lg">
                                <Briefcase size={18} className="text-primary" />
                            </div>
                            <div className="flex-1">
                                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Position</p>
                                <p className="text-sm font-bold text-gray-700">{user.position || 'Team Member'}</p>
                            </div>
                        </div>

                        {user.createdAt && (
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-primary/10 rounded-lg">
                                    <Calendar size={18} className="text-primary" />
                                </div>
                                <div className="flex-1">
                                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Member Since</p>
                                    <p className="text-sm font-bold text-gray-700">
                                        {format(new Date(user.createdAt), 'MMMM d, yyyy')}
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Action buttons */}
                    <div className="mt-6 flex gap-3">
                        <button
                            onClick={onClose}
                            className="flex-1 px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl transition-colors"
                        >
                            Close
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UserProfileModal;
