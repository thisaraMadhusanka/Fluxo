import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
    Camera, User, Mail, Lock, Trash2, AlertTriangle, Save,
    Briefcase, Award, FolderOpen, Layout, Trophy, Star, Zap, Activity
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '@/services/api';
import { setUser } from '@/store/slices/authSlice';
import { useToast } from '@/components/Toast';
import ConfirmDialog from '@/components/ConfirmDialog';

const ProfileSettings = () => {
    const dispatch = useDispatch();
    const toast = useToast();
    const { user } = useSelector((state) => state.auth);
    const [activeTab, setActiveTab] = useState('profile');
    const [loading, setLoading] = useState(false);
    const [stats, setStats] = useState(null);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [leaveProjectDialog, setLeaveProjectDialog] = useState({ isOpen: false, project: null });

    const [formData, setFormData] = useState({
        name: user?.name || '',
        email: user?.email || '',
        position: user?.position || '',
        bio: user?.bio || '',
        currentPassword: '',
        newPassword: ''
    });

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const { data } = await api.get('/users/stats');
                setStats(data);
            } catch (error) {
                console.error('Failed to fetch stats', error);
            }
        };
        fetchStats();
    }, []);

    useEffect(() => {
        if (user) {
            setFormData(prev => ({
                ...prev,
                name: user.name || '',
                email: user.email || '',
                position: user.position || '',
                bio: user.bio || ''
            }));
        }
    }, [user]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleAvatarUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        if (file.size > 2 * 1024 * 1024) {
            toast.error('Image size must be less than 2MB');
            return;
        }

        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = async () => {
            try {
                setLoading(true);
                const { data } = await api.post('/users/avatar', { avatar: reader.result });
                dispatch(setUser({ ...user, avatar: data.avatar }));
                toast.success('Profile photo updated successfully!');
            } catch (error) {
                toast.error(error.response?.data?.message || 'Failed to upload avatar');
            } finally {
                setLoading(false);
            }
        };
    };

    const handleSaveProfile = async (e) => {
        e.preventDefault();
        try {
            setLoading(true);
            const { data } = await api.put('/users/profile', {
                name: formData.name,
                position: formData.position,
                bio: formData.bio
            });
            dispatch(setUser({ ...user, ...data }));
            toast.success('Profile updated successfully!');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to update profile');
        } finally {
            setLoading(false);
        }
    };

    const handlePasswordUpdate = async (e) => {
        e.preventDefault();
        if (!formData.currentPassword || !formData.newPassword) {
            toast.error('Please fill in both password fields');
            return;
        }
        try {
            setLoading(true);
            await api.put('/users/password', {
                currentPassword: formData.currentPassword,
                newPassword: formData.newPassword
            });
            setFormData({ ...formData, currentPassword: '', newPassword: '' });
            toast.success('Password updated successfully!');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to update password');
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteAccount = async () => {
        try {
            await api.delete('/users/account');
            toast.success('Account deleted successfully');
            window.location.href = '/login';
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to delete account');
        }
    };

    const handleLeaveProject = async () => {
        try {
            // TODO: Implement leave project API call
            // await api.post(`/projects/${leaveProjectDialog.project._id}/leave`);
            toast.info('Leave project feature coming soon');
            setLeaveProjectDialog({ isOpen: false, project: null });
            // Refresh stats after leaving
            const { data } = await api.get('/users/stats');
            setStats(data);
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to leave project');
        }
    };

    const getRankColor = (rank) => {
        switch (rank) {
            case 'Diamond': return 'text-blue-600 bg-blue-50 border-blue-100';
            case 'Gold': return 'text-amber-600 bg-amber-50 border-amber-100';
            case 'Bronze': return 'text-orange-600 bg-orange-50 border-orange-100';
            default: return 'text-gray-600 bg-gray-50 border-gray-100';
        }
    };

    const getRankIcon = (rank) => {
        switch (rank) {
            case 'Diamond': return <Zap className="w-5 h-5" />;
            case 'Gold': return <Trophy className="w-5 h-5" />;
            case 'Bronze': return <Star className="w-5 h-5" />;
            default: return <Award className="w-5 h-5" />;
        }
    };

    const TABS = [
        { id: 'profile', label: 'My Profile', icon: User },
        { id: 'activity', label: 'Activity & Rank', icon: Trophy },
        { id: 'security', label: 'Security', icon: Lock },
        { id: 'account', label: 'Management', icon: AlertTriangle }
    ];

    return (
        <div className="min-h-screen bg-[#FDFCFB] p-4 md:p-10">
            <div className="max-w-6xl mx-auto">
                <header className="mb-10">
                    <h1 className="text-3xl font-black text-gray-900 tracking-tight flex items-center gap-3">
                        Account Settings
                        {stats?.ranking && (
                            <span className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-widest flex items-center gap-1.5 border ${getRankColor(stats.ranking)}`}>
                                {getRankIcon(stats.ranking)}
                                {stats.ranking} Rank
                            </span>
                        )}
                    </h1>
                    <p className="text-gray-500 mt-1 font-medium italic">Customize your presence and track your journey at Fluxo.</p>
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                    {/* Navigation Sidebar */}
                    <div className="lg:col-span-1 space-y-2">
                        {TABS.map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`w-full flex items-center space-x-3 px-5 py-4 rounded-2xl transition-all duration-300 group ${activeTab === tab.id
                                    ? 'bg-primary text-white shadow-xl shadow-primary/20 scale-[1.02]'
                                    : 'bg-white text-gray-500 hover:bg-gray-50 border border-gray-100'
                                    }`}
                            >
                                <tab.icon size={20} className={activeTab === tab.id ? 'text-white' : 'text-gray-400 group-hover:text-primary transition-colors'} />
                                <span className="font-black text-xs uppercase tracking-widest">{tab.label}</span>
                            </button>
                        ))}
                    </div>

                    {/* Main Content Area */}
                    <div className="lg:col-span-3">
                        <AnimatePresence mode="wait">
                            {activeTab === 'profile' && (
                                <motion.div
                                    key="profile"
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    className="space-y-6"
                                >
                                    <div className="bg-white rounded-[32px] p-8 shadow-sm border border-gray-100 flex flex-col md:flex-row items-center gap-8">
                                        <div className="relative group shrink-0">
                                            <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-white shadow-2xl relative">
                                                {user?.avatar ? (
                                                    <img src={user.avatar} className="w-full h-full object-cover" alt={user.name} />
                                                ) : (
                                                    <div className="w-full h-full bg-gray-100 flex items-center justify-center text-gray-300">
                                                        <User size={48} />
                                                    </div>
                                                )}
                                                <label className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer backdrop-blur-[2px]">
                                                    <Camera className="text-white" />
                                                    <input type="file" className="hidden" onChange={handleAvatarUpload} accept="image/*" />
                                                </label>
                                            </div>
                                        </div>
                                        <div className="flex-1 text-center md:text-left">
                                            <h2 className="text-2xl font-black text-gray-900">{user?.name}</h2>
                                            <p className="text-primary font-black text-xs uppercase tracking-widest mt-1">{user?.role || 'Member'}</p>
                                            <p className="text-gray-500 mt-3 text-sm leading-relaxed max-w-md italic">
                                                {formData.bio || "Owner of the application"}
                                            </p>
                                        </div>
                                    </div>

                                    <form onSubmit={handleSaveProfile} className="bg-white rounded-[32px] p-8 shadow-sm border border-gray-100 space-y-6">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Full Name</label>
                                                <input
                                                    name="name"
                                                    value={formData.name}
                                                    onChange={handleChange}
                                                    className="w-full px-5 py-4 bg-gray-50 rounded-2xl border border-transparent focus:bg-white focus:border-primary/20 outline-none transition-all font-bold text-sm"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Position / Job Title</label>
                                                <input
                                                    name="position"
                                                    value={formData.position}
                                                    onChange={handleChange}
                                                    placeholder="e.g. Senior Designer, Frontend Developer"
                                                    className="w-full px-5 py-4 bg-gray-50 rounded-2xl border border-transparent focus:bg-white focus:border-primary/20 outline-none transition-all font-bold text-sm"
                                                />
                                            </div>
                                            <div className="md:col-span-2 space-y-2">
                                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Email Address</label>
                                                <input
                                                    value={formData.email}
                                                    disabled
                                                    className="w-full px-5 py-4 bg-gray-100 text-gray-400 rounded-2xl border border-transparent cursor-not-allowed font-bold text-sm"
                                                />
                                            </div>
                                            <div className="md:col-span-2 space-y-2">
                                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Bio</label>
                                                <textarea
                                                    name="bio"
                                                    value={formData.bio}
                                                    onChange={handleChange}
                                                    rows={4}
                                                    className="w-full px-5 py-4 bg-gray-50 rounded-2xl border border-transparent focus:bg-white focus:border-primary/20 outline-none transition-all font-bold text-sm resize-none"
                                                    placeholder="Write a few lines about what you do..."
                                                />
                                            </div>
                                        </div>
                                        <div className="pt-2">
                                            <button
                                                type="submit"
                                                disabled={loading}
                                                className="px-8 py-4 bg-primary text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50"
                                            >
                                                {loading ? 'Saving Changes...' : 'Save Profile Details'}
                                            </button>
                                        </div>
                                    </form>
                                </motion.div>
                            )}

                            {activeTab === 'activity' && (
                                <motion.div
                                    key="activity"
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    className="space-y-6"
                                >
                                    {/* Stats Cards - Compact */}
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                                            <div className="flex items-center gap-2 mb-2">
                                                <FolderOpen className="text-blue-600" size={16} />
                                                <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Projects</div>
                                            </div>
                                            <div className="text-3xl font-black text-gray-900">{stats?.stats?.totalProjects || 0}</div>
                                        </div>
                                        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                                            <div className="flex items-center gap-2 mb-2">
                                                <Activity className="text-green-600" size={16} />
                                                <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Tasks Done</div>
                                            </div>
                                            <div className="text-3xl font-black text-gray-900">{stats?.stats?.completedTasks || 0}</div>
                                        </div>
                                        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                                            <div className="flex items-center gap-2 mb-2">
                                                <Layout className="text-purple-600" size={16} />
                                                <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Workspaces</div>
                                            </div>
                                            <div className="text-3xl font-black text-gray-900">{stats?.stats?.workspacesCount || 0}</div>
                                        </div>
                                    </div>

                                    {/* My Projects - Compact */}
                                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                                        <div className="flex items-center gap-2 mb-4">
                                            <FolderOpen className="text-primary" size={18} />
                                            <h2 className="text-lg font-black text-gray-900">My Projects</h2>
                                        </div>
                                        {stats?.joinedProjects && stats.joinedProjects.length > 0 ? (
                                            <div className="space-y-2">
                                                {stats.joinedProjects.map((project) => (
                                                    <div key={project._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                                                        <div className="flex items-center gap-2">
                                                            <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center text-lg shadow-sm flex-shrink-0">
                                                                {project.emoji || '📁'}
                                                            </div>
                                                            <div>
                                                                <div className="font-bold text-gray-900 text-sm">{project.title || project.name}</div>
                                                                <div className="text-[10px] font-bold text-gray-400 uppercase">{project.workspaceName || 'Workspace'}</div>
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase ${project.status === 'Active' ? 'bg-blue-100 text-blue-700' :
                                                                project.status === 'Completed' ? 'bg-green-100 text-green-700' :
                                                                    'bg-gray-100 text-gray-600'
                                                                }`}>
                                                                {project.status || 'Active'}
                                                            </span>
                                                            <button
                                                                onClick={() => setLeaveProjectDialog({ isOpen: true, project })}
                                                                className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                                                                title="Leave Project"
                                                            >
                                                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                                    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                                                                    <polyline points="16 17 21 12 16 7" />
                                                                    <line x1="21" y1="12" x2="9" y2="12" />
                                                                </svg>
                                                            </button>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="text-center py-6 text-gray-400">
                                                <FolderOpen size={36} className="mx-auto mb-2 opacity-50" />
                                                <p className="text-sm font-medium">No projects yet</p>
                                            </div>
                                        )}
                                    </div>

                                    {/* Active Workspaces - Compact */}
                                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                                        <div className="flex items-center gap-2 mb-4">
                                            <Layout className="text-primary" size={18} />
                                            <h2 className="text-lg font-black text-gray-900">Active Workspaces</h2>
                                        </div>
                                        {stats?.joinedWorkspaces && stats.joinedWorkspaces.length > 0 ? (
                                            <div className="space-y-2">
                                                {stats.joinedWorkspaces.map((workspace, index) => (
                                                    <div key={workspace._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                                        <div className="flex items-center gap-2">
                                                            <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center font-black text-primary text-sm flex-shrink-0">
                                                                {index + 1}
                                                            </div>
                                                            <div>
                                                                <div className="font-bold text-gray-900 text-sm">{workspace.name}</div>
                                                                <div className="text-[10px] font-bold text-primary uppercase">{workspace.role || 'Member'}</div>
                                                            </div>
                                                        </div>
                                                        <div className="text-[10px] font-bold text-primary uppercase">{workspace.role || 'Member'}</div>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="text-center py-6 text-gray-400">
                                                <Layout size={36} className="mx-auto mb-2 opacity-50" />
                                                <p className="text-sm font-medium">No workspaces yet</p>
                                            </div>
                                        )}
                                    </div>
                                </motion.div>
                            )}

                            {activeTab === 'security' && (
                                <motion.div
                                    key="security"
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                >
                                    <form onSubmit={handlePasswordUpdate} className="bg-white rounded-[32px] p-8 shadow-sm border border-gray-100 space-y-6">
                                        <h2 className="text-2xl font-black text-gray-900">Update Password</h2>
                                        <div className="space-y-4">
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Current Password</label>
                                                <input
                                                    type="password"
                                                    name="currentPassword"
                                                    value={formData.currentPassword}
                                                    onChange={handleChange}
                                                    className="w-full px-5 py-4 bg-gray-50 rounded-2xl border border-transparent focus:bg-white focus:border-primary/20 outline-none transition-all font-bold text-sm"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">New Password</label>
                                                <input
                                                    type="password"
                                                    name="newPassword"
                                                    value={formData.newPassword}
                                                    onChange={handleChange}
                                                    className="w-full px-5 py-4 bg-gray-50 rounded-2xl border border-transparent focus:bg-white focus:border-primary/20 outline-none transition-all font-bold text-sm"
                                                />
                                            </div>
                                        </div>
                                        <button
                                            type="submit"
                                            disabled={loading}
                                            className="px-8 py-4 bg-primary text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50"
                                        >
                                            {loading ? 'Updating...' : 'Update Password'}
                                        </button>
                                    </form>
                                </motion.div>
                            )}

                            {activeTab === 'account' && (
                                <motion.div
                                    key="account"
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    className="bg-white rounded-[32px] p-8 shadow-sm border border-gray-100"
                                >
                                    <h2 className="text-2xl font-black text-gray-900 mb-6">Account Management</h2>
                                    <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-6">
                                        <div className="flex items-start gap-4">
                                            <AlertTriangle className="text-red-600 flex-shrink-0" size={24} />
                                            <div>
                                                <h3 className="font-black text-red-900 mb-2">Danger Zone</h3>
                                                <p className="text-sm text-red-700 mb-4">
                                                    Deleting your account will permanently erase all your data. This action cannot be undone.
                                                </p>
                                                <button
                                                    onClick={() => setIsDeleteDialogOpen(true)}
                                                    className="px-6 py-3 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700 transition-colors flex items-center gap-2"
                                                >
                                                    <Trash2 size={18} />
                                                    Delete Account
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>

                <ConfirmDialog
                    isOpen={isDeleteDialogOpen}
                    onClose={() => setIsDeleteDialogOpen(false)}
                    onConfirm={handleDeleteAccount}
                    title="Delete your account?"
                    message="We're sad to see you go. Are you absolutely sure you want to delete your account? This will permanently erase everything you've worked on."
                    confirmText="Yes, Delete Permanently"
                    danger={true}
                />

                <ConfirmDialog
                    isOpen={leaveProjectDialog.isOpen}
                    onClose={() => setLeaveProjectDialog({ isOpen: false, project: null })}
                    onConfirm={handleLeaveProject}
                    title="Leave Project?"
                    message={`Are you sure you want to leave "${leaveProjectDialog.project?.title || leaveProjectDialog.project?.name}"? You'll need to be invited again to rejoin.`}
                    confirmText="Yes, Leave Project"
                    danger={true}
                />
            </div>
        </div>
    );
};

export default ProfileSettings;
