import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
    Camera, User, Mail, Lock, Trash2, AlertTriangle, Save,
    Briefcase, Award, FolderOpen, Layout, LogOut, ChevronRight,
    Trophy, Star, Zap, Activity
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

    const [formData, setFormData] = useState({
        name: user?.name || '',
        email: user?.email || '',
        position: user?.position || 'Team Member',
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

    const handleLeaveProject = async (projectId) => {
        try {
            await api.post(`/users/leave-project/${projectId}`);
            toast.success('Left project');
            // Refresh stats
            const { data } = await api.get('/users/stats');
            setStats(data);
        } catch (error) {
            toast.error('Failed to leave project');
        }
    };

    const handleLeaveWorkspace = async (workspaceId) => {
        try {
            await api.post(`/users/leave-workspace/${workspaceId}`);
            toast.success('Left workspace');
            // Refresh stats
            const { data } = await api.get('/users/stats');
            setStats(data);
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to leave workspace');
        }
    };

    const handleDeleteAccount = async () => {
        try {
            setLoading(true);
            await api.delete('/users/account');
            toast.success('Account deleted');
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = '/login';
        } catch (error) {
            toast.error('Failed to delete account');
            setLoading(false);
        }
    };

    const getRankColor = (rank) => {
        switch (rank) {
            case 'Diamond': return 'text-blue-600 bg-blue-50 border-blue-100 shadow-[0_0_15px_rgba(37,99,235,0.1)]';
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
                                                    <img src={user.avatar} className="w-full h-full object-cover" />
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
                                            <p className="text-primary font-black text-xs uppercase tracking-widest mt-1">{formData.position}</p>
                                            <p className="text-gray-500 mt-3 text-sm leading-relaxed max-w-md italic">
                                                {formData.bio || "No bio added yet. Tell us a bit about yourself!"}
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
                                    className="space-y-8"
                                >
                                    {/* Stats Grid */}
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                        <div className="bg-white p-6 rounded-[32px] shadow-sm border border-gray-100 flex items-center gap-4">
                                            <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center">
                                                <FolderOpen size={24} />
                                            </div>
                                            <div>
                                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1">Projects</p>
                                                <h4 className="text-2xl font-black text-gray-900">{stats?.stats?.totalProjects || 0}</h4>
                                            </div>
                                        </div>
                                        <div className="bg-white p-6 rounded-[32px] shadow-sm border border-gray-100 flex items-center gap-4">
                                            <div className="w-12 h-12 bg-green-50 text-green-600 rounded-2xl flex items-center justify-center">
                                                <Activity size={24} />
                                            </div>
                                            <div>
                                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1">Tasks Done</p>
                                                <h4 className="text-2xl font-black text-gray-900">{stats?.stats?.completedTasks || 0}</h4>
                                            </div>
                                        </div>
                                        <div className="bg-white p-6 rounded-[32px] shadow-sm border border-gray-100 flex items-center gap-4">
                                            <div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-2xl flex items-center justify-center">
                                                <Layout size={24} />
                                            </div>
                                            <div>
                                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1">Workspaces</p>
                                                <h4 className="text-2xl font-black text-gray-900">{stats?.stats?.workspacesCount || 0}</h4>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Projects & Workspaces */}
                                    <div className="space-y-6">
                                        <div className="bg-white rounded-[32px] p-8 shadow-sm border border-gray-100">
                                            <h3 className="text-lg font-black text-gray-900 mb-6 flex items-center gap-2">
                                                <FolderOpen className="text-primary" size={20} />
                                                My Projects
                                            </h3>
                                            <div className="space-y-4">
                                                {stats?.joinedProjects?.length > 0 ? (
                                                    stats.joinedProjects.map(project => (
                                                        <div key={project._id} className="flex items-center justify-between p-4 bg-gray-50/50 rounded-2xl hover:bg-gray-50 transition-colors border border-transparent hover:border-gray-200 group">
                                                            <div className="flex items-center gap-4">
                                                                <div
                                                                    className="w-3 h-3 rounded-full"
                                                                    style={{ backgroundColor: project.color || 'var(--primary)' }}
                                                                ></div>
                                                                <div>
                                                                    <h5 className="font-bold text-gray-900 text-sm">{project.title}</h5>
                                                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-0.5">{project.workspaceName}</p>
                                                                </div>
                                                            </div>
                                                            <div className="flex items-center gap-4">
                                                                <span className={`px-2 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest ${project.status === 'Completed' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'
                                                                    }`}>
                                                                    {project.status}
                                                                </span>
                                                                <button
                                                                    onClick={() => handleLeaveProject(project._id)}
                                                                    className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all opacity-0 group-hover:opacity-100"
                                                                    title="Leave Project"
                                                                >
                                                                    <LogOut size={16} />
                                                                </button>
                                                            </div>
                                                        </div>
                                                    ))
                                                ) : (
                                                    <p className="text-center py-6 text-gray-400 font-bold text-sm">No joined projects yet.</p>
                                                )}
                                            </div>
                                        </div>

                                        <div className="bg-white rounded-[32px] p-8 shadow-sm border border-gray-100">
                                            <h3 className="text-lg font-black text-gray-900 mb-6 flex items-center gap-2">
                                                <Layout className="text-primary" size={20} />
                                                Active Workspaces
                                            </h3>
                                            <div className="space-y-4">
                                                {stats?.joinedWorkspaces?.length > 0 ? (
                                                    stats.joinedWorkspaces.map(ws => (
                                                        <div key={ws._id} className="flex items-center justify-between p-4 bg-gray-50/50 rounded-2xl hover:bg-gray-50 transition-colors border border-transparent hover:border-gray-200 group">
                                                            <div className="flex items-center gap-4">
                                                                <div className="w-10 h-10 bg-white shadow-sm rounded-xl flex items-center justify-center text-primary font-black">
                                                                    {ws.name[0]}
                                                                </div>
                                                                <div>
                                                                    <h5 className="font-bold text-gray-900 text-sm">{ws.name}</h5>
                                                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-0.5">{ws.role}</p>
                                                                </div>
                                                            </div>
                                                            <button
                                                                onClick={() => handleLeaveWorkspace(ws._id)}
                                                                disabled={ws.role === 'Owner'}
                                                                className="px-4 py-2 bg-white text-gray-600 rounded-xl text-[10px] font-black uppercase tracking-widest border border-gray-100 hover:border-red-200 hover:text-red-500 transition-all shadow-sm disabled:opacity-30 disabled:hover:text-gray-600 disabled:hover:border-gray-100"
                                                            >
                                                                {ws.role === 'Owner' ? 'Owner' : 'Leave Workpace'}
                                                            </button>
                                                        </div>
                                                    ))
                                                ) : (
                                                    <p className="text-center py-6 text-gray-400 font-bold text-sm">No joined workspaces yet.</p>
                                                )}
                                            </div>
                                        </div>
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
                                    <div className="bg-white rounded-[32px] p-8 shadow-sm border border-gray-100">
                                        <h3 className="text-lg font-black text-gray-900 mb-8 flex items-center gap-2">
                                            <Lock className="text-primary" size={20} />
                                            Update Password
                                        </h3>
                                        <form onSubmit={handlePasswordUpdate} className="space-y-6">
                                            <div className="grid grid-cols-1 gap-6">
                                                <div className="space-y-2">
                                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Current Password</label>
                                                    <input
                                                        type="password"
                                                        name="currentPassword"
                                                        value={formData.currentPassword}
                                                        onChange={handleChange}
                                                        className="w-full px-5 py-4 bg-gray-50 rounded-2xl border border-transparent focus:bg-white focus:border-primary/20 outline-none transition-all font-bold text-sm"
                                                        placeholder="••••••••••••"
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
                                                        placeholder="••••••••••••"
                                                    />
                                                </div>
                                            </div>
                                            <div className="pt-2">
                                                <button
                                                    type="submit"
                                                    disabled={loading}
                                                    className="px-8 py-4 bg-gray-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-gray-200 hover:bg-black transition-all disabled:opacity-50"
                                                >
                                                    {loading ? 'Updating...' : 'Update Account Password'}
                                                </button>
                                            </div>
                                        </form>
                                    </div>
                                </motion.div>
                            )}

                            {activeTab === 'account' && (
                                <motion.div
                                    key="account"
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                >
                                    <div className="bg-red-50 rounded-[32px] p-10 border border-red-100 relative overflow-hidden">
                                        <div className="absolute top-0 right-0 w-64 h-64 bg-red-100/50 rounded-full -mr-20 -mt-20 blur-3xl"></div>
                                        <div className="relative z-10 flex flex-col md:flex-row items-start gap-8">
                                            <div className="w-16 h-16 bg-white rounded-[24px] shadow-sm flex items-center justify-center text-red-500 shrink-0">
                                                <AlertTriangle size={32} />
                                            </div>
                                            <div className="flex-1">
                                                <h3 className="text-2xl font-black text-red-900 mb-3">Delete Account Permanently</h3>
                                                <p className="text-red-700/70 font-medium leading-relaxed max-w-lg mb-8">
                                                    This action is irreversible. All your project data, task history, and workspace memberships will be permanently deleted from Fluxo's servers.
                                                </p>
                                                <button
                                                    onClick={() => setIsDeleteDialogOpen(true)}
                                                    className="px-8 py-4 bg-white text-red-600 rounded-2xl font-black text-xs uppercase tracking-widest border border-red-100 hover:bg-red-50 hover:border-red-200 transition-all shadow-md shadow-red-900/5 flex items-center gap-3"
                                                >
                                                    <Trash2 size={16} />
                                                    I want to delete my account
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </div>

            {/* Account Deletion Confirmation */}
            <ConfirmDialog
                isOpen={isDeleteDialogOpen}
                onClose={() => setIsDeleteDialogOpen(false)}
                onConfirm={handleDeleteAccount}
                title="Delete your account?"
                message="We're sad to see you go. Are you absolutely sure you want to delete your account? This will permanently erase everything you've worked on."
                danger={true}
                confirmText="Yes, Delete Permanently"
            />
        </div>
    );
};

export default ProfileSettings;
