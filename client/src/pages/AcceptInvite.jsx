import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { CheckCircle, XCircle, Loader, Mail, Target } from 'lucide-react';
import api from '@/services/api';
import { fetchWorkspaces, setCurrentWorkspace } from '@/store/slices/workspaceSlice';

const AcceptInvite = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { user } = useSelector((state) => state.auth);
    const [status, setStatus] = useState('loading'); // loading, success, error, requireAuth
    const [message, setMessage] = useState('');
    const [workspaceName, setWorkspaceName] = useState('');

    useEffect(() => {
        const token = searchParams.get('token');

        if (!token) {
            setStatus('error');
            setMessage('Invalid invitation link. No token provided.');
            return;
        }

        // Check if user is authenticated
        if (!user) {
            setStatus('requireAuth');
            setMessage('Please sign in with Google to accept this invitation.');
            // Store token in localStorage to use after login
            localStorage.setItem('pendingInviteToken', token);
            return;
        }

        // Accept the invitation
        acceptInvitation(token);
    }, [user, searchParams]);

    const acceptInvitation = async (token) => {
        try {
            setStatus('loading');
            setMessage('Accepting invitation...');

            const { data } = await api.post(`/workspaces/accept/${token}`);

            setStatus('success');
            setMessage(data.message);
            setWorkspaceName(data.workspace?.name || 'the workspace');

            // Refresh workspaces list
            await dispatch(fetchWorkspaces());

            // Set the joined workspace as current
            if (data.workspace?._id) {
                dispatch(setCurrentWorkspace(data.workspace._id));
            }

            // Redirect to workspace after 2 seconds
            setTimeout(() => {
                navigate('/dashboard');
            }, 2000);

        } catch (error) {
            setStatus('error');
            const errorMsg = error.response?.data?.message || 'Failed to accept invitation';
            setMessage(errorMsg);

            // If auth error, show sign in option
            if (error.response?.status === 401) {
                setStatus('requireAuth');
                localStorage.setItem('pendingInviteToken', token);
            }
        }
    };

    const handleSignIn = () => {
        // Redirect to login page
        const token = searchParams.get('token');
        localStorage.setItem('pendingInviteToken', token);
        navigate('/login?redirect=/accept-invite');
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
            <div className="max-w-lg w-full">
                <div className="bg-white rounded-3xl shadow-2xl overflow-hidden border border-gray-200">

                    {/* Brand Header */}
                    <div className="bg-gradient-to-r from-[#0F0F0F] to-[#1a1a1a] px-8 py-10 text-center">
                        <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl mb-4 shadow-lg overflow-hidden">
                            <img src="/logo.png" alt="Fluxo Logo" className="w-full h-full object-cover" />
                        </div>
                        <h1 className="text-3xl font-bold text-white mb-2">Fluxo</h1>
                        <p className="text-gray-300 text-sm">Project Management Made Simple</p>
                    </div>

                    {/* Content */}
                    <div className="px-8 py-10">
                        <div className="text-center mb-6">
                            <h2 className="text-2xl font-bold text-gray-900 mb-2">
                                {status === 'requireAuth' ? 'Workspace Invitation' :
                                    status === 'success' ? '✨ Success!' :
                                        status === 'error' ? 'Oops!' :
                                            'Processing...'}
                            </h2>
                        </div>

                        {/* Loading State */}
                        {status === 'loading' && (
                            <div className="text-center space-y-6">
                                <p className="text-gray-600 text-lg">{message}</p>
                                <div className="flex justify-center">
                                    <div className="w-2 h-2 bg-[#F26B3A] rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                                    <div className="w-2 h-2 bg-[#F26B3A] rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                                    <div className="w-2 h-2 bg-[#F26B3A] rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                                </div>
                            </div>
                        )}

                        {/* Success State */}
                        {status === 'success' && (
                            <div className="text-center space-y-6">
                                <div>
                                    <p className="text-xl font-semibold text-gray-900 mb-2">{message}</p>
                                    <p className="text-gray-600">
                                        Redirecting to <span className="font-medium text-[#F26B3A]">{workspaceName}</span>...
                                    </p>
                                </div>
                            </div>
                        )}

                        {/* Error State */}
                        {status === 'error' && (
                            <div className="text-center space-y-6">
                                <div>
                                    <p className="text-xl font-semibold text-gray-900 mb-2">Unable to Accept Invitation</p>
                                    <p className="text-gray-600 mb-6">{message}</p>
                                    <button
                                        onClick={() => navigate('/dashboard')}
                                        className="px-8 py-3 bg-[#0F0F0F] text-white rounded-xl hover:bg-[#2a2a2a] transition-all shadow-md hover:shadow-lg font-medium"
                                    >
                                        Go to Dashboard
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Require Auth State */}
                        {status === 'requireAuth' && (
                            <div className="space-y-6">
                                <div className="text-center">
                                    <h3 className="text-xl font-semibold text-gray-900 mb-2">Sign In Required</h3>
                                    <p className="text-gray-600 mb-8 max-w-sm mx-auto">{message}</p>
                                </div>

                                {/* Sign In Button */}
                                <button
                                    onClick={handleSignIn}
                                    className="w-full group relative overflow-hidden px-6 py-4 bg-gradient-to-r from-[#F26B3A] to-[#d95a2b] text-white rounded-xl hover:shadow-xl transition-all duration-300 font-semibold text-lg flex items-center justify-center gap-3"
                                >
                                    <div className="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
                                    <svg className="w-6 h-6 relative z-10" viewBox="0 0 24 24">
                                        <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                        <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                        <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                                        <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                                    </svg>
                                    <span className="relative z-10">Sign in with Fluxo</span>
                                </button>

                                <p className="text-center text-xs text-gray-500">
                                    We use Google authentication to keep your account secure
                                </p>
                            </div>
                        )}
                    </div>
                </div>

                <p className="text-center text-gray-500 text-sm mt-8">
                    Having trouble? Contact your workspace administrator
                </p>
            </div>
        </div>
    );
};

export default AcceptInvite;
