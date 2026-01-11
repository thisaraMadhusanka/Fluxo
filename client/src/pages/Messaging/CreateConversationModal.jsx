import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { X, Search, User } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '@/services/api';
import { useToast } from '@/components/Toast';

const CreateConversationModal = ({ isOpen, onClose, onConversationCreated }) => {
    const toast = useToast();
    const { user } = useSelector((state) => state.auth);
    const [loading, setLoading] = useState(false);
    const [workspaceUsers, setWorkspaceUsers] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedUser, setSelectedUser] = useState(null);

    // Load workspace users
    useEffect(() => {
        if (isOpen) {
            loadWorkspaceUsers();
        }
    }, [isOpen]);

    const loadWorkspaceUsers = async () => {
        try {
            setLoading(true);
            const { data } = await api.get('/users'); // Get all workspace users
            // Filter out current user
            const others = data.filter(u => u._id !== user.id);
            setWorkspaceUsers(others);
        } catch (error) {
            console.error('Error loading users:', error);
            toast.error('Failed to load users');
        } finally {
            setLoading(false);
        }
    };

    // Filter users based on search
    const filteredUsers = workspaceUsers.filter(u =>
        u.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.email?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // Create conversation
    const handleCreateConversation = async (userId) => {
        try {
            const { data } = await api.post('/conversations', {
                type: 'direct',
                participants: [userId]
            });

            toast.success('Conversation started!');
            onConversationCreated(data);
            onClose();
        } catch (error) {
            console.error('Error creating conversation:', error);
            toast.error(error.response?.data?.message || 'Failed to create conversation');
        }
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                {/* Backdrop */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                    onClick={onClose}
                />

                {/* Modal */}
                <motion.div
                    initial={{ scale: 0.95, opacity: 0, y: 10 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0.95, opacity: 0, y: 10 }}
                    className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden"
                >
                    {/* Header */}
                    <div className="p-6 border-b border-gray-200">
                        <div className="flex items-center justify-between">
                            <h2 className="text-xl font-black text-gray-900">New Message</h2>
                            <button
                                onClick={onClose}
                                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        {/* Search */}
                        <div className="relative mt-4">
                            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search users..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm"
                                autoFocus
                            />
                        </div>
                    </div>

                    {/* Users List */}
                    <div className="max-h-96 overflow-y-auto">
                        {loading ? (
                            <div className="flex items-center justify-center py-12">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                            </div>
                        ) : filteredUsers.length > 0 ? (
                            <div className="divide-y divide-gray-100">
                                {filteredUsers.map((u) => (
                                    <button
                                        key={u._id}
                                        onClick={() => handleCreateConversation(u._id)}
                                        className="w-full p-4 flex items-center gap-3 hover:bg-gray-50 transition-colors text-left"
                                    >
                                        {u.avatar ? (
                                            <img
                                                src={u.avatar}
                                                alt={u.name}
                                                className="w-12 h-12 rounded-lg object-cover flex-shrink-0"
                                            />
                                        ) : (
                                            <div className="w-12 h-12 bg-gradient-to-br from-primary to-orange-600 rounded-lg flex items-center justify-center flex-shrink-0">
                                                <span className="text-white font-bold text-lg">
                                                    {u.name?.charAt(0).toUpperCase() || '?'}
                                                </span>
                                            </div>
                                        )}
                                        <div className="flex-1 min-w-0">
                                            <div className="font-bold text-gray-900 truncate">{u.name}</div>
                                            <div className="text-sm text-gray-500 truncate">{u.email}</div>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center py-12 text-gray-400">
                                <User size={48} className="mb-3 opacity-50" />
                                <p className="text-sm font-medium">
                                    {searchQuery ? 'No users found' : 'No users in workspace'}
                                </p>
                            </div>
                        )}
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};

export default CreateConversationModal;
