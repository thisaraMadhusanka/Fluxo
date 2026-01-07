import React, { useState, useEffect } from 'react';
import emailjs from '@emailjs/browser';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Users, UserPlus, Trash2, Copy, Check, Mail, AlertTriangle, Lock, Settings as SettingsIcon, Save } from 'lucide-react';
import ConfirmModal from '@/components/ConfirmModal';
import api from '@/services/api';
import { useToast } from '@/components/Toast';
import { fetchWorkspaces, inviteMember } from '@/store/slices/workspaceSlice';

const WorkspaceSettings = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { currentWorkspace } = useSelector((state) => state.workspaces);
    const { user } = useSelector((state) => state.auth);
    const toast = useToast();
    const [members, setMembers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [inviteEmail, setInviteEmail] = useState('');
    const [inviteLoading, setInviteLoading] = useState(false);
    const [copied, setCopied] = useState(false);
    const [workspaceDetails, setWorkspaceDetails] = useState(null);

    // Edit Form State
    const [editFormData, setEditFormData] = useState({ name: '', description: '' });
    const [editLoading, setEditLoading] = useState(false);

    // Modal states
    const [confirmModal, setConfirmModal] = useState({ isOpen: false, title: '', message: '', onConfirm: null, type: 'warning' });
    const [deleteNameInput, setDeleteNameInput] = useState('');

    useEffect(() => {
        if (currentWorkspace) {
            fetchWorkspaceDetails();
            setEditFormData({
                name: currentWorkspace.name,
                description: currentWorkspace.description || ''
            });
        }
    }, [currentWorkspace?._id]);

    const fetchWorkspaceDetails = async () => {
        setLoading(true);
        try {
            const { data } = await api.get(`/workspaces/${currentWorkspace._id}`);
            setWorkspaceDetails(data);
            setMembers(data.members || []);
            setEditFormData({
                name: data.name,
                description: data.description || ''
            });
        } catch (error) {
            console.error("Failed to fetch workspace details", error);
            toast.error("Failed to load members");
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateWorkspace = async (e) => {
        e.preventDefault();
        setEditLoading(true);
        try {
            const { data } = await api.put(`/workspaces/${currentWorkspace._id}`, editFormData);
            setWorkspaceDetails({ ...workspaceDetails, ...data });
            dispatch(fetchWorkspaces()); // Update global state
            toast.success("Workspace updated successfully");
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to update workspace");
        } finally {
            setEditLoading(false);
        }
    };

    const handleInvite = async (e) => {
        e.preventDefault();
        if (!inviteEmail.trim()) return;

        setInviteLoading(true);
        try {
            // 1. Create Invite on Server
            const result = await dispatch(inviteMember({
                email: inviteEmail,
                workspaceId: currentWorkspace._id
            })).unwrap();

            // 2. Send Email via EmailJS (Client-Side)
            if (result.invitationLink) {
                try {
                    await emailjs.send(
                        "service_2xvzpo8", // Service ID
                        "template_konurxh", // Template ID
                        {
                            to_email: inviteEmail,
                            workspace_name: currentWorkspace.name,
                            invite_link: result.invitationLink,
                            inviter_name: user?.name || "A Fluxo User"
                        },
                        "CzO1CtVscsgKy6YGK" // Public Key
                    );
                    toast.success(`Invitation sent to ${inviteEmail}`);
                } catch (emailError) {
                    console.error("EmailJS Error:", emailError);
                    toast.warning("Invitation created but email failed to send. Please try again.");
                }
            } else {
                toast.success(result.message);
            }

            setInviteEmail('');
            // Cleanly refresh the list
            fetchWorkspaceDetails();
        } catch (error) {
            toast.error(typeof error === 'string' ? error : "Failed to invite user");
        } finally {
            setInviteLoading(false);
        }
    };

    const handleRemoveMember = async (memberId) => {
        const member = members.find(m => m._id === memberId);

        setConfirmModal({
            isOpen: true,
            title: 'Remove Member',
            message: `Are you sure you want to remove ${member?.user?.name || 'this member'} from the workspace?`,
            type: 'warning',
            onConfirm: async () => {
                try {
                    await api.delete(`/workspaces/${currentWorkspace._id}/members/${memberId}`);
                    toast.success("Member removed successfully");
                    setMembers(members.filter(m => m._id !== memberId));
                } catch (error) {
                    toast.error(error.response?.data?.message || "Failed to remove member");
                }
            }
        });
    };

    const handleUpdateRole = async (memberId, newRole) => {
        try {
            await api.put(`/workspaces/${currentWorkspace._id}/members/${memberId}/role`, { role: newRole });
            toast.success("Role updated successfully");
            setMembers(members.map(m => m._id === memberId ? { ...m, role: { ...m.role, name: newRole } } : m));
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to update role");
        }
    };

    const copyInviteCode = () => {
        if (workspaceDetails?.inviteCode) {
            navigator.clipboard.writeText(workspaceDetails.inviteCode);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
            toast.success("Invite code copied!");
        }
    };

    const handleDeleteWorkspace = async () => {
        setDeleteNameInput('');
        setConfirmModal({
            isOpen: true,
            title: 'Delete Workspace',
            message: `Are you sure you want to delete "${currentWorkspace.name}"? This action cannot be undone and will delete all projects and tasks inside it.`,
            type: 'danger',
            action: 'DELETE_WORKSPACE'
        });
    };

    // Actual execution function
    const executeDeleteWorkspace = async () => {
        if (deleteNameInput !== currentWorkspace.name) {
            toast.error("Workspace name does not match.");
            return;
        }

        try {
            await dispatch(deleteWorkspace(currentWorkspace._id)).unwrap();
            toast.success("Workspace deleted successfully");
            navigate('/');
        } catch (error) {
            toast.error(error || "Failed to delete workspace");
        }
    };

    if (!currentWorkspace) return <div className="p-6">Select a workspace to view settings.</div>;
    if (loading) return <div className="p-6">Loading workspace details...</div>;

    // Robust owner check - handles owner being object or string, and _id vs id
    const getIdString = (obj) => {
        if (!obj) return null;
        if (typeof obj === 'string') return obj;
        return obj._id?.toString() || obj.id?.toString() || obj.toString();
    };

    const ownerId = getIdString(workspaceDetails?.owner || currentWorkspace?.owner);
    const userId = getIdString(user);
    const isOwner = ownerId && userId && ownerId === userId;

    return (
        <div className="max-w-4xl mx-auto p-6 space-y-8">
            <div className="flex items-center space-x-4 mb-8">
                <div className="p-3 bg-primary/10 rounded-xl text-primary">
                    <Users size={32} />
                </div>
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Workspace Settings</h1>
                    <p className="text-gray-500">Manage your team and workspace preferences</p>
                </div>
            </div>

            {/* General Settings */}
            {isOwner && (
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                    <h2 className="text-lg font-bold mb-4 flex items-center">
                        <SettingsIcon size={20} className="mr-2 text-gray-500" />
                        General Information
                    </h2>
                    <form onSubmit={handleUpdateWorkspace} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Workspace Name</label>
                                <input
                                    type="text"
                                    value={editFormData.name}
                                    onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                                <input
                                    type="text"
                                    value={editFormData.description}
                                    onChange={(e) => setEditFormData({ ...editFormData, description: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                                    placeholder="Optional description"
                                />
                            </div>
                        </div>
                        <div className="flex justify-end">
                            <button
                                type="submit"
                                disabled={editLoading}
                                className="px-4 py-2 bg-gray-800 text-white rounded-lg font-medium hover:bg-gray-700 transition-colors flex items-center disabled:opacity-50"
                            >
                                <Save size={16} className="mr-2" />
                                {editLoading ? 'Saving...' : 'Save Changes'}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Invite Section */}
            {workspaceDetails?.isPrivate ? (
                <div className="bg-orange-50 border border-orange-100 rounded-2xl p-6 mb-8 flex items-start">
                    <div className="p-3 bg-orange-100 text-orange-600 rounded-xl mr-4">
                        <Lock size={24} />
                    </div>
                    <div>
                        <h2 className="text-lg font-bold text-gray-800 mb-1">Private Workspace</h2>
                        <p className="text-gray-600">
                            This is your personal workspace. It is private to you and cannot have other members.
                            To collaborate with others, create a new Shared Workspace.
                        </p>
                    </div>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                        <h2 className="text-lg font-bold mb-4 flex items-center">
                            <UserPlus size={20} className="mr-2 text-primary" />
                            Invite by Email
                        </h2>
                        <form onSubmit={handleInvite} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                    <input
                                        type="email"
                                        required
                                        value={inviteEmail}
                                        onChange={(e) => setInviteEmail(e.target.value)}
                                        placeholder="colleague@example.com"
                                        className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                                    />
                                </div>
                            </div>
                            <button
                                type="submit"
                                disabled={inviteLoading}
                                className="w-full py-2 bg-primary text-white rounded-lg font-medium hover:bg-primary/90 transition-colors disabled:opacity-50"
                            >
                                {inviteLoading ? 'Sending...' : 'Send Invite'}
                            </button>
                        </form>
                    </div>

                    <div className="bg-gradient-to-br from-indigo-50 to-blue-50 p-6 rounded-2xl border border-indigo-100">
                        <h2 className="text-lg font-bold mb-4 text-indigo-900">Invite Code</h2>
                        <p className="text-sm text-indigo-700 mb-6">
                            Share this code with your team members to let them join this workspace instantly.
                        </p>
                        <div className="flex items-center space-x-3 bg-white p-3 rounded-lg border border-indigo-100 shadow-sm">
                            <code className="flex-1 text-center font-mono text-2xl font-bold tracking-wider text-indigo-600">
                                {workspaceDetails?.inviteCode}
                            </code>
                            <button
                                onClick={copyInviteCode}
                                className="p-2 hover:bg-gray-100 rounded-lg text-gray-500 transition-colors"
                                title="Copy Code"
                            >
                                {copied ? <Check size={20} className="text-green-500" /> : <Copy size={20} />}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Members List */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-gray-100">
                    <h2 className="text-lg font-bold">Team Members ({members.length})</h2>
                </div>
                <div className="divide-y divide-gray-100">
                    {members.map((member) => (
                        <div key={member._id} className="flex items-center justify-between p-4 hover:bg-gray-50 transition-colors">
                            <div className="flex items-center space-x-4">
                                {member.user?.avatar ? (
                                    <img src={member.user.avatar} alt={member.user.name} className="w-10 h-10 rounded-full object-cover" />
                                ) : (
                                    <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 font-bold">
                                        {member.user?.name?.[0]?.toUpperCase() || 'U'}
                                    </div>
                                )}
                                <div>
                                    <h3 className="font-medium text-gray-800">{member.user?.name || 'Unknown User'}</h3>
                                    <p className="text-sm text-gray-500">{member.user?.email}</p>
                                </div>
                                {isOwner && member.role?.name !== 'Owner' ? (
                                    <select
                                        value={member.role?.name || 'Member'}
                                        onChange={(e) => handleUpdateRole(member._id, e.target.value)}
                                        className="text-xs font-medium bg-gray-100 text-gray-800 rounded-full px-2 py-0.5 border-none focus:ring-2 focus:ring-primary/20 cursor-pointer"
                                    >
                                        <option value="Admin">Admin</option>
                                        <option value="Member">Member</option>
                                        <option value="Viewer">Viewer</option>
                                    </select>
                                ) : (
                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                        {member.role?.name || 'Member'}
                                    </span>
                                )}
                            </div>

                            {/* Make verification safer: Don't allow removing self or owner if not allowed */}
                            {isOwner && member.user?._id !== currentWorkspace.owner && (
                                <button
                                    onClick={() => handleRemoveMember(member._id)}
                                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                    title="Remove Member"
                                >
                                    <Trash2 size={18} />
                                </button>
                            )}
                        </div>
                    ))}
                    {members.length === 0 && (
                        <div className="p-8 text-center text-gray-500">No members found</div>
                    )}
                </div>
            </div>
            {/* Danger Zone */}
            {isOwner && (
                <div className="bg-red-50 rounded-2xl border border-red-100 overflow-hidden">
                    <div className="p-6">
                        <div className="flex items-start">
                            <div className="p-3 bg-red-100 text-red-600 rounded-xl mr-4">
                                <AlertTriangle size={24} />
                            </div>
                            <div className="flex-1">
                                <h3 className="text-lg font-bold text-red-900 mb-1">Danger Zone</h3>
                                <p className="text-sm text-red-700 mb-4">
                                    Deleting this workspace will permanently remove all associated projects, tasks, and member associations. This action cannot be undone.
                                </p>
                                <button
                                    onClick={handleDeleteWorkspace}
                                    className="px-4 py-2 bg-white text-red-600 border border-red-200 rounded-lg font-medium hover:bg-red-50 hover:border-red-300 transition-colors shadow-sm"
                                >
                                    Delete Workspace
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Confirm Modal */}
            <ConfirmModal
                isOpen={confirmModal.isOpen}
                onClose={() => setConfirmModal({ ...confirmModal, isOpen: false })}
                onConfirm={confirmModal.action === 'DELETE_WORKSPACE' ? executeDeleteWorkspace : confirmModal.onConfirm}
                title={confirmModal.title}
                message={confirmModal.message}
                type={confirmModal.type}
                confirmText={confirmModal.action === 'DELETE_WORKSPACE' ? 'Delete Forever' : 'Confirm'}
            >
                {confirmModal.action === 'DELETE_WORKSPACE' && (
                    <div className="mt-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Type <span className="font-bold select-none">{currentWorkspace.name}</span> to confirm:
                        </label>
                        <input
                            type="text"
                            value={deleteNameInput}
                            onChange={(e) => setDeleteNameInput(e.target.value)}
                            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-red-500 focus:ring-4 focus:ring-red-500/10 outline-none transition-all font-medium text-gray-900 placeholder-gray-300"
                            placeholder={currentWorkspace.name}
                            autoFocus
                        />
                    </div>
                )}
            </ConfirmModal>
        </div >
    );
};

export default WorkspaceSettings;
