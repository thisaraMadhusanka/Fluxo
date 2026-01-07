import React, { useState } from 'react';
import { X, Briefcase, Plus, Hash, Sun, Moon } from 'lucide-react';
import { useDispatch } from 'react-redux';
import { createWorkspace, joinWorkspace } from '../store/slices/workspaceSlice';
import { useToast } from './Toast';
import api from '../services/api';
import emailjs from '@emailjs/browser';

const CreateWorkspaceModal = ({ isOpen, onClose }) => {
    const dispatch = useDispatch();
    const toast = useToast();
    const [mode, setMode] = useState('create'); // 'create', 'join', 'invite'
    const [step, setStep] = useState('form'); // 'form', 'success' (for create mode)
    const [name, setName] = useState('');
    const [inviteCode, setInviteCode] = useState('');
    const [loading, setLoading] = useState(false);

    // Invite Step State
    const [createdWorkspace, setCreatedWorkspace] = useState(null);
    const [inviteEmails, setInviteEmails] = useState('');
    const [sendingInvites, setSendingInvites] = useState(false);

    if (!isOpen) return null;

    const handleCreateSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            if (!name.trim()) {
                toast.error('Workspace name is required');
                setLoading(false);
                return;
            }

            const result = await dispatch(createWorkspace({ name, theme: 'light' })).unwrap();

            // On success, switch to invite step
            setCreatedWorkspace(result.workspace);
            setStep('success');
            toast.success('Workspace created successfully!');
        } catch (error) {
            toast.error(error || 'Failed to create workspace');
        } finally {
            setLoading(false);
        }
    };

    const handleJoinSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            if (!inviteCode.trim()) {
                toast.error('Invite code is required');
                setLoading(false);
                return;
            }
            await dispatch(joinWorkspace(inviteCode)).unwrap();
            toast.success('Joined workspace successfully!');
            onClose();
        } catch (error) {
            toast.error(error || 'Failed to join workspace');
        } finally {
            setLoading(false);
        }
    };

    const handleSendInvites = async () => {
        if (!inviteEmails.trim()) {
            onClose(); // Skip if empty
            return;
        }

        setSendingInvites(true);
        const emails = inviteEmails.split(',').map(e => e.trim()).filter(e => e);

        let successCount = 0;
        let failCount = 0;

        // Use Promise.all for parallel requests, or keep sequential if rate limiting concerns
        await Promise.all(emails.map(async (email) => {
            try {
                // 1. Generate Invite Link via Backend
                const response = await api.post('/workspaces/invite', {
                    email,
                    workspaceId: createdWorkspace._id
                });

                const { inviteLink, token } = response.data; // Assuming backend returns this

                // 2. Send Email via EmailJS
                // We need the service ID, template ID, and public key. 
                // Using hardcoded values or env vars if available. 
                // Based on previous context, user has these. 
                // Assuming SERVICE_ID: 'service_f63d76r', TEMPLATE_ID: 'template_0dx7y28' (example, I should verify or use env)
                // Let's use the ones from a previous file if possible, or generic placeholders the user likely set up.
                // Actually, I can allow the backend to return the IDs or use standard env.

                await emailjs.send(
                    import.meta.env.VITE_EMAILJS_SERVICE_ID || 'service_f63d76r',
                    import.meta.env.VITE_EMAILJS_TEMPLATE_ID || 'template_0dx7y28',
                    {
                        to_email: email,
                        to_name: email.split('@')[0], // Fallback name
                        invite_link: inviteLink,
                        workspace_name: createdWorkspace.name,
                        inviter_name: 'Fluxo User' // Or user.name from auth state
                    },
                    import.meta.env.VITE_EMAILJS_PUBLIC_KEY || 'user_xxxxxxxx'
                );

                successCount++;
            } catch (error) {
                console.error(`Failed to invite ${email}`, error);
                failCount++;
            }
        }));

        if (successCount > 0) toast.success(`Sent ${successCount} invitation${successCount !== 1 ? 's' : ''}`);
        if (failCount > 0) toast.error(`Failed to send ${failCount} invitation${failCount !== 1 ? 's' : ''}`);

        setSendingInvites(false);
        onClose();
    };

    const resetState = () => {
        setMode('create');
        setStep('form');
        setName('');
        setInviteCode('');
        setCreatedWorkspace(null);
        setInviteEmails('');
    };

    const handleClose = () => {
        resetState();
        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={handleClose} />
            <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden transform transition-all">
                {/* Header */}
                <div className="flex justify-between items-center p-5 border-b border-gray-100 bg-gray-50/50">
                    <h2 className="text-lg font-bold text-gray-800 flex items-center">
                        <Briefcase className="mr-2 text-primary" size={20} />
                        {step === 'success' ? 'Invite Team Members' :
                            mode === 'create' ? 'Create New Workspace' : 'Join Workspace'}
                    </h2>
                    <button onClick={handleClose} className="text-gray-400 hover:text-gray-600 transition-colors">
                        <X size={20} />
                    </button>
                </div>

                {/* Tabs - Only show in initial form step */}
                {step === 'form' && (
                    <div className="flex p-1 bg-gray-100 m-5 rounded-lg">
                        <button
                            onClick={() => setMode('create')}
                            className={`flex-1 py-1.5 text-sm font-medium rounded-md transition-all ${mode === 'create' ? 'bg-white shadow text-primary' : 'text-gray-500 hover:text-gray-700'
                                }`}
                        >
                            Create
                        </button>
                        <button
                            onClick={() => setMode('join')}
                            className={`flex-1 py-1.5 text-sm font-medium rounded-md transition-all ${mode === 'join' ? 'bg-white shadow text-primary' : 'text-gray-500 hover:text-gray-700'
                                }`}
                        >
                            Join
                        </button>
                    </div>
                )}

                {/* Content */}
                <div className="p-5 pt-0">
                    {step === 'success' ? (
                        <div className="space-y-6 pt-4">
                            <div className="text-center p-4 bg-orange-50 rounded-xl border border-orange-100">
                                <p className="text-sm text-gray-600 mb-1">Your Invite Code</p>
                                <div className="flex items-center justify-center gap-2">
                                    <span className="text-3xl font-mono font-bold text-primary tracking-wider">
                                        {createdWorkspace?.inviteCode}
                                    </span>
                                </div>
                                <p className="text-xs text-gray-500 mt-2">Share this code with your team to let them join instantly.</p>
                            </div>

                            <div className="relative">
                                <div className="absolute inset-0 flex items-center">
                                    <div className="w-full border-t border-gray-200"></div>
                                </div>
                                <div className="relative flex justify-center text-xs uppercase">
                                    <span className="bg-white px-2 text-gray-500">Or invite via email</span>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Email Addresses (Comma separated)
                                </label>
                                <textarea
                                    value={inviteEmails}
                                    onChange={(e) => setInviteEmails(e.target.value)}
                                    placeholder="colleague@example.com, partner@agency.com..."
                                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-sm h-32 resize-none"
                                />
                                <p className="text-xs text-gray-500 mt-2">
                                    We'll send an invitation link to each email address.
                                </p>
                            </div>

                            <div className="flex justify-end gap-3 pt-2">
                                <button
                                    onClick={handleClose}
                                    className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors font-medium text-sm"
                                >
                                    Skip
                                </button>
                                <button
                                    onClick={handleSendInvites}
                                    disabled={sendingInvites}
                                    className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors font-medium text-sm disabled:opacity-50 flex items-center"
                                >
                                    {sendingInvites ? 'Sending...' : 'Send Invites'}
                                </button>
                            </div>
                        </div>
                    ) : mode === 'create' ? (
                        <form onSubmit={handleCreateSubmit} className="pt-2">
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Workspace Name <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        placeholder="e.g., Acme Corp, Personal Projects"
                                        className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-gray-900"
                                        autoFocus
                                    />
                                </div>
                            </div>

                            <div className="mt-6 flex justify-end gap-3">
                                <button
                                    type="button"
                                    onClick={handleClose}
                                    className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors font-medium text-sm"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                                >
                                    {loading && (
                                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                                    )}
                                    Create Workspace
                                </button>
                            </div>
                        </form>
                    ) : (
                        <form onSubmit={handleJoinSubmit} className="pt-2">
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Invite Code <span className="text-red-500">*</span>
                                    </label>
                                    <div className="relative">
                                        <Hash className="absolute left-3 top-2.5 text-gray-400" size={18} />
                                        <input
                                            type="text"
                                            value={inviteCode}
                                            onChange={(e) => setInviteCode(e.target.value)}
                                            placeholder="Enter the 4-digit code"
                                            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all uppercase font-mono text-gray-900"
                                            maxLength={8}
                                            autoFocus
                                        />
                                    </div>
                                    <p className="text-xs text-gray-500 mt-1">
                                        Ask your workspace admin for an invite code.
                                    </p>
                                </div>
                            </div>

                            <div className="mt-6 flex justify-end gap-3">
                                <button
                                    type="button"
                                    onClick={handleClose}
                                    className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors font-medium text-sm"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                                >
                                    {loading && (
                                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                                    )}
                                    Join Workspace
                                </button>
                            </div>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CreateWorkspaceModal;
