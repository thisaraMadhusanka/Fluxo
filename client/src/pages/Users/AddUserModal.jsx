import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { X, Mail, User as UserIcon, Shield, AlertCircle, CheckCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { inviteUser } from '@/store/slices/userSlice';
import { inviteMember } from '@/store/slices/workspaceSlice';

const AddUserModal = ({ isOpen, onClose }) => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        role: 'Member'
    });
    const [success, setSuccess] = useState(false);
    const dispatch = useDispatch();
    const { loading: userLoading, error: userError } = useSelector((state) => state.users);
    const { currentWorkspace, loading: workspaceLoading, error: workspaceError } = useSelector((state) => state.workspaces);

    const loading = userLoading || workspaceLoading;
    const error = userError || workspaceError;

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!currentWorkspace) {
            alert("No active workspace found");
            return;
        }

        const result = await dispatch(inviteMember({ ...formData, workspaceId: currentWorkspace._id }));
        if (!result.error) {
            setSuccess(true);
            setTimeout(() => {
                setFormData({ name: '', email: '', role: 'Member' });
                setSuccess(false);
                onClose();
            }, 2000);
        }
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleClose = () => {
        setFormData({ name: '', email: '', role: 'Member' });
        setSuccess(false);
        onClose();
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/50 z-50"
                        onClick={handleClose}
                    />

                    {/* Modal */}
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-xl font-bold text-gray-800">Invite Team Member</h2>
                                <button
                                    onClick={handleClose}
                                    className="text-gray-400 hover:text-gray-600 transition-colors"
                                >
                                    <X size={20} />
                                </button>
                            </div>

                            {success ? (
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="text-center py-8"
                                >
                                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <CheckCircle className="text-green-600" size={32} />
                                    </div>
                                    <h3 className="text-lg font-semibold text-gray-800 mb-2">Invitation Sent!</h3>
                                    <p className="text-gray-600 text-sm">
                                        An email with login credentials has been sent to the user.
                                    </p>
                                </motion.div>
                            ) : (
                                <form onSubmit={handleSubmit} className="space-y-4">
                                    {error && (
                                        <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-start">
                                            <AlertCircle className="text-red-500 mr-2 flex-shrink-0 mt-0.5" size={18} />
                                            <p className="text-sm text-red-700">{error}</p>
                                        </div>
                                    )}

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Full Name
                                        </label>
                                        <div className="relative">
                                            <UserIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                                            <input
                                                type="text"
                                                name="name"
                                                value={formData.name}
                                                onChange={handleChange}
                                                required
                                                className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-200 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                                                placeholder="John Doe"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Email Address
                                        </label>
                                        <div className="relative">
                                            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                                            <input
                                                type="email"
                                                name="email"
                                                value={formData.email}
                                                onChange={handleChange}
                                                required
                                                className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-200 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                                                placeholder="john@example.com"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Role
                                        </label>
                                        <div className="relative">
                                            <Shield className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                                            <select
                                                name="role"
                                                value={formData.role}
                                                onChange={handleChange}
                                                className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-200 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all appearance-none bg-white"
                                            >
                                                <option value="Viewer">Viewer - Can only view</option>
                                                <option value="Member">Member - Can edit tasks</option>
                                                <option value="Admin">Admin - Full access</option>
                                                <option value="Owner">Owner - Ultimate control</option>
                                            </select>
                                        </div>
                                        <p className="text-xs text-gray-500 mt-1">
                                            The user will receive an email with login credentials
                                        </p>
                                    </div>

                                    <div className="flex justify-end pt-4 space-x-3">
                                        <button
                                            type="button"
                                            onClick={handleClose}
                                            className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg font-medium transition-colors"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            type="submit"
                                            disabled={loading}
                                            className="px-6 py-2 bg-primary text-white rounded-lg font-medium hover:bg-primary/90 transition-colors shadow-lg shadow-primary/30 disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            {loading ? 'Sending...' : 'Send Invitation'}
                                        </button>
                                    </div>
                                </form>
                            )}
                        </motion.div>
                    </div>
                </>
            )}
        </AnimatePresence>
    );
};

export default AddUserModal;
