import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AnimatePresence, motion } from 'framer-motion';
import { User, Shield, Briefcase, Code, PenTool, Search, MoreHorizontal, UserMinus, X } from 'lucide-react';
import api from '@/services/api';
import { useToast } from '@/components/Toast';

import ConfirmDialog from '@/components/ConfirmDialog';

const ROLES = [
    { name: 'Leader', icon: Shield, color: 'text-purple-600 bg-purple-100' },
    { name: 'Developer', icon: Code, color: 'text-blue-600 bg-blue-100' },
    { name: 'Designer', icon: PenTool, color: 'text-pink-600 bg-pink-100' },
    { name: 'QA', icon: Search, color: 'text-orange-600 bg-orange-100' },
    { name: 'Member', icon: User, color: 'text-gray-600 bg-gray-100' },
    { name: 'Viewer', icon: User, color: 'text-gray-400 bg-gray-50' }
];

const ProjectTeam = ({ project, onUpdate }) => {
    const toast = useToast();
    const { users } = useSelector((state) => state.users); // All users to add
    const [searchTerm, setSearchTerm] = useState('');
    const [isAddOpen, setIsAddOpen] = useState(false);
    const [memberToRemove, setMemberToRemove] = useState(null);

    const handleAddMember = async (userId) => {
        try {
            const { data } = await api.post(`/projects/${project._id}/members`, { userId, role: 'Member' });
            toast.success('Member added');
            onUpdate(data);
            setIsAddOpen(false);
        } catch (error) {
            toast.error('Failed to add member');
        }
    };

    const handleRoleChange = async (userId, newRole) => {
        try {
            const { data } = await api.put(`/projects/${project._id}/members/${userId}/role`, { role: newRole });
            toast.success('Role updated');
            onUpdate(data);
        } catch (error) {
            toast.error('Failed to update role');
        }
    };

    const handleRemoveMember = async (userId) => {
        // ConfirmDialog handles confirmation
        try {
            const { data } = await api.delete(`/projects/${project._id}/members/${userId}`);
            toast.success('Member removed');
            onUpdate(data);
        } catch (error) {
            toast.error('Failed to remove member');
        }
    };

    const projectMembers = project.members || [];

    // Helper to get role icon
    const getRoleConfig = (roleName) => ROLES.find(r => r.name === roleName) || ROLES.find(r => r.name === 'Member');

    return (
        <div className="max-w-5xl mx-auto space-y-8 pb-10">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                    <div>
                        <h2 className="text-lg font-bold text-gray-800">Project Team</h2>
                        <p className="text-sm text-gray-500">Manage members and their specific roles in this project.</p>
                    </div>
                    <button
                        onClick={() => setIsAddOpen(true)}
                        className="px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary/90"
                    >
                        Add Member
                    </button>
                </div>

                <div className="divide-y divide-gray-100">
                    {projectMembers
                        .filter(member => {
                            // Filter out Unknown User and invalid users
                            const user = member.user || member;
                            return user && user.name && !user.name.includes('Unknown') && user.email && !user.email.includes('No email');
                        })
                        .map((member) => {
                            const user = member.user || member; // Handle populated/unpopulated
                            const role = member.role || 'Member';
                            const roleConfig = getRoleConfig(role);
                            const RoleIcon = roleConfig.icon;

                            return (
                                <div key={user._id || member._id || Math.random()} className="p-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
                                    <div className="flex items-center space-x-4">
                                        <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                                            {user.avatar ? (
                                                <img src={user.avatar} alt={user.name || 'Unknown'} className="w-full h-full object-cover" />
                                            ) : (
                                                <span className="font-semibold text-gray-500">{(user.name || '?')[0]}</span>
                                            )}
                                        </div>
                                        <div>
                                            <h3 className="font-medium text-gray-900">{user.name || 'Unknown User'}</h3>
                                            <p className="text-sm text-gray-500">{user.email || 'No email'}</p>
                                        </div>
                                    </div>

                                    <div className="flex items-center space-x-4">
                                        <div className="relative group">
                                            <select
                                                value={role}
                                                onChange={(e) => handleRoleChange(user._id, e.target.value)}
                                                className={`appearance-none pl-9 pr-8 py-1.5 rounded-full text-sm font-medium cursor-pointer focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-primary/30 ${roleConfig.color}`}
                                            >
                                                {ROLES.map(r => (
                                                    <option key={r.name} value={r.name}>{r.name}</option>
                                                ))}
                                            </select>
                                            <RoleIcon size={14} className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                                        </div>

                                        <button
                                            onClick={() => setMemberToRemove(user._id)}
                                            className="p-2 text-gray-400 hover:text-red-500 rounded-lg hover:bg-red-50 transition-colors"
                                        >
                                            <UserMinus size={18} />
                                        </button>
                                    </div>
                                </div>
                            );
                        })}

                </div>
            </div>

            {/* Add Member Modal */}
            <AnimatePresence>
                {isAddOpen && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-0">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsAddOpen(false)}
                            className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm"
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden relative z-10 flex flex-col max-h-[90vh] m-4"
                        >
                            {/* Modal Header */}
                            <div className="px-6 py-5 border-b border-gray-100 flex justify-between items-center bg-white sticky top-0">
                                <div>
                                    <h3 className="text-xl font-bold text-gray-800">Add Team Member</h3>
                                    <p className="text-xs text-gray-500 mt-1">Invite people to collaborate on this project</p>
                                </div>
                                <button
                                    onClick={() => setIsAddOpen(false)}
                                    className="p-2 hover:bg-gray-100 rounded-full text-gray-400 hover:text-gray-600 transition-colors"
                                >
                                    <X size={20} />
                                </button>
                            </div>

                            {/* Search Box */}
                            <div className="p-4 border-b border-gray-50 bg-gray-50/30">
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                                    <input
                                        type="text"
                                        placeholder="Search by name or email..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary/30 transition-all font-medium"
                                    />
                                </div>
                            </div>

                            {/* Users List */}
                            <div className="p-2 overflow-y-auto flex-1 min-h-[300px]">
                                {users
                                    .filter(u => {
                                        const isAlreadyMember = projectMembers.some(m => {
                                            const memberId = m.user?._id || m.user || m._id;
                                            return memberId.toString() === u._id.toString();
                                        });
                                        if (isAlreadyMember) return false;

                                        if (!searchTerm) return true;
                                        const searchLower = searchTerm.toLowerCase();
                                        return (
                                            u.name?.toLowerCase().includes(searchLower) ||
                                            u.email?.toLowerCase().includes(searchLower)
                                        );
                                    })
                                    .map(user => (
                                        <div
                                            key={user._id}
                                            onClick={() => handleAddMember(user._id)}
                                            className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-2xl cursor-pointer transition-colors group"
                                        >
                                            <div className="flex items-center space-x-3">
                                                <div className="w-10 h-10 rounded-full border-2 border-white shadow-sm bg-gray-100 flex items-center justify-center overflow-hidden shrink-0">
                                                    {user.avatar ? (
                                                        <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                                                    ) : (
                                                        <span className="text-sm font-bold text-gray-500">{user.name[0].toUpperCase()}</span>
                                                    )}
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="text-sm font-bold text-gray-800 truncate">{user.name}</p>
                                                    <p className="text-xs text-gray-500 truncate">{user.email}</p>
                                                </div>
                                            </div>
                                            <button className="px-3 py-1.5 bg-gray-50 group-hover:bg-primary group-hover:text-white rounded-xl text-xs font-bold text-gray-600 transition-all">
                                                Add
                                            </button>
                                        </div>
                                    ))}

                                {users.length === 0 && (
                                    <div className="flex flex-col items-center justify-center py-12 text-center px-6">
                                        <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4 text-gray-300">
                                            <User size={32} />
                                        </div>
                                        <h4 className="font-bold text-gray-800">No users found</h4>
                                        <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                                            Start by inviting users to your workspace in the workspace settings.
                                        </p>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Confirm Remove Member */}
            <ConfirmDialog
                isOpen={!!memberToRemove}
                onClose={() => setMemberToRemove(null)}
                onConfirm={() => memberToRemove && handleRemoveMember(memberToRemove)}
                title="Remove Member"
                message="Are you sure you want to remove this member from the project?"
                danger={true}
                confirmText="Remove"
            />
        </div >
    );
};

export default ProjectTeam;
