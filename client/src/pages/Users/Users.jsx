import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Plus, Search, Mail, Shield, Trash2, Edit } from 'lucide-react';
import { fetchUsers, deleteUser } from '@/store/slices/userSlice';
import AddUserModal from './AddUserModal';
import { format } from 'date-fns';

const Users = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const dispatch = useDispatch();
    const { users, loading } = useSelector((state) => state.users);
    const { user: currentUser } = useSelector((state) => state.auth);

    useEffect(() => {
        dispatch(fetchUsers());
    }, [dispatch]);

    const handleDeleteUser = async (userId) => {
        if (window.confirm('Are you sure you want to delete this user?')) {
            await dispatch(deleteUser(userId));
        }
    };

    const filteredUsers = (Array.isArray(users) ? users : []).filter(user =>
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const getRoleColor = (role) => {
        const colors = {
            Owner: 'bg-purple-100 text-purple-700',
            Admin: 'bg-red-100 text-red-700',
            Member: 'bg-blue-100 text-blue-700',
            Viewer: 'bg-gray-100 text-gray-700',
        };
        return colors[role] || colors.Member;
    };

    const getInitials = (name) => {
        if (!name) return 'U';
        const names = name.split(' ');
        if (names.length >= 2) {
            return `${names[0][0]}${names[1][0]}`.toUpperCase();
        }
        return name.substring(0, 2).toUpperCase();
    };

    return (
        <div>
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-2xl font-bold">Team Members</h1>
                    <p className="text-gray-500 text-sm">Manage workspace users and permissions</p>
                </div>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="flex items-center px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors shadow-lg shadow-primary/30"
                >
                    <Plus size={16} className="mr-2" /> Invite User
                </button>
            </div>

            {/* Search */}
            <div className="mb-6">
                <div className="relative max-w-md">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                    <input
                        type="text"
                        placeholder="Search users by name or email..."
                        className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-sm"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            {/* Users List */}
            {loading ? (
                <div className="text-center py-20 text-gray-500">Loading users...</div>
            ) : filteredUsers.length === 0 ? (
                <div className="text-center py-20">
                    <Shield className="mx-auto mb-4 text-gray-300" size={64} />
                    <h3 className="text-lg font-semibold text-gray-600 mb-2">No Users Found</h3>
                    <p className="text-gray-500 text-sm">
                        {searchTerm ? 'Try adjusting your search terms' : 'Invite your first team member to get started'}
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                    {filteredUsers.map((user) => (
                        <div
                            key={user._id}
                            className="bg-white p-5 rounded-2xl border border-gray-100 hover:shadow-md transition-all"
                        >
                            <div className="flex items-start justify-between mb-4">
                                <div className="flex items-center">
                                    {user.avatar ? (
                                        <img
                                            src={user.avatar}
                                            alt={user.name}
                                            className="w-12 h-12 rounded-full object-cover border-2 border-gray-100"
                                        />
                                    ) : (
                                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white font-bold border-2 border-gray-100">
                                            {getInitials(user.name)}
                                        </div>
                                    )}
                                    <div className="ml-3">
                                        <h3 className="font-semibold text-gray-800">{user.name}</h3>
                                        <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${getRoleColor(user.role)} mt-1`}>
                                            {user.role}
                                        </span>
                                    </div>
                                </div>
                                {currentUser?._id !== user._id && (
                                    <button
                                        onClick={() => handleDeleteUser(user._id)}
                                        className="text-gray-400 hover:text-red-500 transition-colors p-1"
                                        title="Delete user"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                )}
                            </div>

                            <div className="space-y-2">
                                <div className="flex items-center text-sm text-gray-600">
                                    <Mail size={14} className="mr-2 text-gray-400" />
                                    <span className="truncate">{user.email}</span>
                                </div>
                                {user.createdAt && (
                                    <div className="text-xs text-gray-400">
                                        Joined {format(new Date(user.createdAt), 'MMM d, yyyy')}
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Add User Modal */}
            <AddUserModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
            />
        </div>
    );
};

export default Users;
