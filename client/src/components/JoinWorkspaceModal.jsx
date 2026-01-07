import React, { useState } from 'react';
import { X, LogIn } from 'lucide-react';
import { useDispatch } from 'react-redux';
import { joinWorkspace, fetchWorkspaces } from '@/store/slices/workspaceSlice';
import { useToast } from './Toast';
import { useNavigate } from 'react-router-dom';

const JoinWorkspaceModal = ({ isOpen, onClose }) => {
    const dispatch = useDispatch();
    const toast = useToast();
    const navigate = useNavigate();
    const [inviteCode, setInviteCode] = useState('');
    const [joining, setJoining] = useState(false);

    const handleJoin = async (e) => {
        e.preventDefault();
        if (!inviteCode.trim()) {
            toast.error('Please enter an invite code');
            return;
        }

        setJoining(true);
        try {
            const result = await dispatch(joinWorkspace(inviteCode.trim())).unwrap();
            toast.success(`Successfully joined ${result.workspace.name}!`);

            // Refresh workspaces list
            await dispatch(fetchWorkspaces());

            // Close modal and redirect
            setInviteCode('');
            onClose();
            navigate('/dashboard');
        } catch (error) {
            toast.error(error || 'Failed to join workspace');
        } finally {
            setJoining(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 relative">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                >
                    <X size={20} />
                </button>

                <div className="flex items-center gap-3 mb-6">
                    <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center text-primary">
                        <LogIn size={24} />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-gray-900">Join Workspace</h2>
                        <p className="text-sm text-gray-500">Enter the invite code to join</p>
                    </div>
                </div>

                <form onSubmit={handleJoin} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Invite Code
                        </label>
                        <input
                            type="text"
                            value={inviteCode}
                            onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
                            placeholder="e.g., A1B2C3D4"
                            maxLength={8}
                            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary uppercase font-mono text-lg tracking-wider text-gray-900 placeholder-gray-400"
                            autoFocus
                        />
                        <p className="mt-2 text-xs text-gray-500">
                            Ask your team admin for the workspace invite code
                        </p>
                    </div>

                    <div className="flex gap-3 pt-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-4 py-3 border border-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={joining || !inviteCode.trim()}
                            className="flex-1 px-4 py-3 bg-primary text-white rounded-xl font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {joining ? (
                                <>
                                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                    Joining...
                                </>
                            ) : (
                                <>
                                    <LogIn size={18} />
                                    Join Workspace
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default JoinWorkspaceModal;
