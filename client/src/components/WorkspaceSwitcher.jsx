import React, { useRef, useState, useEffect } from 'react';
import { ChevronDown, Briefcase, Plus, Check, Settings, Lock, LogIn } from 'lucide-react';
import { useSelector, useDispatch } from 'react-redux';
import { setCurrentWorkspace, joinWorkspace } from '../store/slices/workspaceSlice';
import CreateWorkspaceModal from './CreateWorkspaceModal';
import { useNavigate } from 'react-router-dom';

const WorkspaceSwitcher = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { workspaces, currentWorkspace } = useSelector((state) => state.workspaces);
    const [isOpen, setIsOpen] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [inviteCode, setInviteCode] = useState('');
    const [joining, setJoining] = useState(false);
    const dropdownRef = useRef(null);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleSwitch = (workspaceId) => {
        dispatch(setCurrentWorkspace(workspaceId));
        setIsOpen(false);
        // Navigate to dashboard to trigger data refetch for new workspace
        navigate('/');
    };

    const handleJoinWorkspace = async (e) => {
        e.preventDefault();
        if (!inviteCode.trim()) return;

        setJoining(true);
        try {
            await dispatch(joinWorkspace(inviteCode.trim())).unwrap();
            setInviteCode('');
            setIsOpen(false);
        } catch (error) {
            // Error handled by toast in slice
        } finally {
            setJoining(false);
        }
    };

    if (!currentWorkspace) {
        return (
            <>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="w-full flex items-center p-3 text-sm text-gray-600 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors border border-dashed border-gray-300"
                >
                    <Plus size={16} className="mr-2" />
                    Create Workspace
                </button>
                <CreateWorkspaceModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
            </>
        );
    }

    return (
        <div className="relative mb-6" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex items-center justify-between p-3 bg-white border border-gray-200 rounded-xl hover:border-primary/50 hover:shadow-sm transition-all group"
            >
                <div className="flex items-center min-w-0">
                    <div className="w-8 h-8 bg-gradient-to-br from-primary to-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-sm mr-3 shadow-sm group-hover:shadow group-hover:scale-105 transition-all">
                        {currentWorkspace.name.substring(0, 1).toUpperCase()}
                    </div>
                    <div className="flex flex-col items-start min-w-0">
                        <span className="text-sm font-bold text-gray-800 truncate w-full text-left">
                            {currentWorkspace.name}
                        </span>
                        <span className="textxs text-gray-500 truncate text-[10px]">
                            {currentWorkspace.role?.name || 'Member'}
                        </span>
                    </div>
                </div>
                <ChevronDown
                    size={16}
                    className={`text-gray-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
                />
            </button>

            {isOpen && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-xl border border-gray-100 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                    {/* Private Workspace Section */}
                    {workspaces.some(ws => ws.isPrivate) && (
                        <div className="mb-2">
                            <div className="px-3 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wider flex items-center">
                                <Lock size={12} className="mr-1" /> My Workspace
                            </div>
                            {workspaces.filter(ws => ws.isPrivate).map((ws) => (
                                <button
                                    key={ws._id}
                                    onClick={() => handleSwitch(ws._id)}
                                    className={`w-full flex items-center px-4 py-2.5 text-sm transition-colors hover:bg-gray-50 ${currentWorkspace._id === ws._id ? 'text-orange-600 bg-orange-50' : 'text-gray-700'
                                        }`}
                                >
                                    <div className={`w-6 h-6 rounded flex items-center justify-center text-xs font-bold mr-3 ${currentWorkspace._id === ws._id ? 'bg-orange-200 text-orange-700' : 'bg-gray-100 text-gray-600'}`}>
                                        {ws.name.substring(0, 1).toUpperCase()}
                                    </div>
                                    <span className="flex-1 text-left truncate font-medium">{ws.name}</span>
                                    {currentWorkspace._id === ws._id && <Check size={14} />}
                                </button>
                            ))}
                        </div>
                    )}

                    {/* Shared Workspaces Section */}
                    {workspaces.some(ws => !ws.isPrivate) && (
                        <div>
                            <div className="px-3 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wider border-t border-gray-100 mt-1 pt-2">
                                Shared Workspaces
                            </div>
                            <div className="max-h-60 overflow-y-auto">
                                {workspaces.filter(ws => !ws.isPrivate).map((ws) => (
                                    <button
                                        key={ws._id}
                                        onClick={() => handleSwitch(ws._id)}
                                        className={`w-full flex items-center px-4 py-2.5 text-sm transition-colors hover:bg-gray-50 ${currentWorkspace._id === ws._id ? 'text-primary bg-primary/5' : 'text-gray-700'
                                            }`}
                                    >
                                        <div className="w-6 h-6 rounded bg-gray-100 flex items-center justify-center text-xs font-bold mr-3 text-gray-600">
                                            {ws.name.substring(0, 1).toUpperCase()}
                                        </div>
                                        <span className="flex-1 text-left truncate">{ws.name}</span>
                                        {currentWorkspace._id === ws._id && <Check size={14} />}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    <div className="my-1 border-t border-gray-100" />

                    <div className="px-2 space-y-2">
                        <button
                            onClick={() => {
                                setIsModalOpen(true);
                                setIsOpen(false);
                            }}
                            className="w-full flex items-center px-2 py-2 text-sm text-gray-600 hover:text-primary hover:bg-gray-50 rounded-lg transition-colors"
                        >
                            <Plus size={16} className="mr-2" />
                            New Workspace
                        </button>

                        <form onSubmit={handleJoinWorkspace} className="pt-2 border-t border-gray-100">
                            <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider px-2 mb-2">Join Workspace</label>
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    value={inviteCode}
                                    onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
                                    placeholder="Enter Code"
                                    maxLength={8}
                                    className="flex-1 px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary uppercase font-mono"
                                />
                                <button
                                    type="submit"
                                    disabled={joining || !inviteCode.trim()}
                                    className="px-3 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                    title="Join Workspace"
                                >
                                    <LogIn size={16} />
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <CreateWorkspaceModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
        </div>
    );
};

export default WorkspaceSwitcher;
