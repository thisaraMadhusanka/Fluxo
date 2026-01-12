import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchAllSystemUsers, updateUserRole, approveUser, deleteUser } from '@/store/slices/userSlice';
import { Trash2, Shield, CheckCircle, XCircle, UserCheck, Mail, CheckSquare, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import ConfirmDialog from '@/components/ConfirmDialog';
import api from '@/services/api';
import { useToast } from '@/components/Toast';

const AdminDashboard = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    // Use adminUsers instead of scoped users
    const { adminUsers: users, loading } = useSelector((state) => state.users);
    const { user: currentUser } = useSelector((state) => state.auth);
    const [activeTab, setActiveTab] = useState('users'); // 'users' | 'access-requests'
    const [accessRequests, setAccessRequests] = useState([]);
    const [requestsLoading, setRequestsLoading] = useState(false);
    const { showToast } = useToast();

    const [confirmModal, setConfirmModal] = useState({
        isOpen: false,
        title: '',
        message: '',
        onConfirm: () => { },
        variant: 'primary',
        confirmText: 'Confirm'
    });

    useEffect(() => {
        if (currentUser?.role !== 'Owner') {
            navigate('/');
            return;
        }
        dispatch(fetchAllSystemUsers());
    }, [dispatch, currentUser, navigate]);

    useEffect(() => {
        if (activeTab === 'access-requests') {
            fetchAccessRequests();
        }
    }, [activeTab]);

    const fetchAccessRequests = async () => {
        setRequestsLoading(true);
        try {
            const { data } = await api.get('/access-requests');
            setAccessRequests(data);
        } catch (error) {
            showToast('Failed to fetch access requests', 'error');
        } finally {
            setRequestsLoading(false);
        }
    };

    const handleApproveRequest = async (requestId) => {
        try {
            await api.put(`/access-requests/${requestId}/approve`);
            showToast('Access request approved! User credentials have been sent via email.', 'success');
            fetchAccessRequests();
        } catch (error) {
            showToast(error.response?.data?.message || 'Failed to approve request', 'error');
        }
    };

    const handleRejectRequest = async (requestId) => {
        try {
            const reason = prompt('Reason for rejection (optional):');
            await api.put(`/access-requests/${requestId}/reject`, { reason });
            showToast('Access request rejected', 'success');
            fetchAccessRequests();
        } catch (error) {
            showToast('Failed to reject request', 'error');
        }
    };

    const closeConfirmModal = () => {
        setConfirmModal(prev => ({ ...prev, isOpen: false }));
    };

    const handleApprove = (id) => {
        setConfirmModal({
            isOpen: true,
            title: 'Approve User',
            message: 'Are you sure you want to approve this user? They will gain access to the platform.',
            variant: 'success',
            confirmText: 'Approve',
            onConfirm: () => dispatch(approveUser(id))
        });
    };

    const handleDelete = (id) => {
        setConfirmModal({
            isOpen: true,
            title: 'Delete User',
            message: 'Are you sure you want to delete this user? This action cannot be undone and all their data will be lost.',
            variant: 'danger',
            confirmText: 'Delete',
            onConfirm: () => dispatch(deleteUser(id))
        });
    };

    const handleRoleChange = (id, currentRole) => {
        const newRole = currentRole === 'Admin' ? 'Member' : 'Admin';
        setConfirmModal({
            isOpen: true,
            title: `Change Role to ${newRole}`,
            message: `Are you sure you want to change this user's role to ${newRole}?`,
            variant: 'primary',
            confirmText: 'Change Role',
            onConfirm: () => dispatch(updateUserRole({ id, role: newRole }))
        });
    };

    if (loading) return <div className="p-8 text-center text-gray-500">Loading users...</div>;

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Admin Dashboard</h1>
                    <p className="text-gray-500">Manage users, roles, and access requests</p>
                </div>
            </div>

            {/* Tabs */}
            <div className="mb-6 border-b border-gray-200">
                <div className="flex gap-8">
                    <button
                        onClick={() => setActiveTab('users')}
                        className={`pb-4 px-1 text-sm font-semibold transition-colors border-b-2 ${activeTab === 'users'
                            ? 'border-gray-900 text-gray-900'
                            : 'border-transparent text-gray-500 hover:text-gray-700'
                            }`}
                    >
                        Users ({users.length})
                    </button>
                    <button
                        onClick={() => setActiveTab('access-requests')}
                        className={`pb-4 px-1 text-sm font-semibold transition-colors border-b-2 ${activeTab === 'access-requests'
                            ? 'border-gray-900 text-gray-900'
                            : 'border-transparent text-gray-500 hover:text-gray-700'
                            }`}
                    >
                        Access Requests ({accessRequests.filter(r => r.status === 'pending').length})
                    </button>
                </div>
            </div>

            {/* Users Table */}
            {activeTab === 'users' && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-gray-50 text-gray-600 text-xs uppercase font-semibold">
                            <tr>
                                <th className="px-6 py-4">User</th>
                                <th className="px-6 py-4">Role</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {users.map((user) => (
                                <tr key={user._id} className="hover:bg-gray-50/50 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center">
                                            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold mr-3 overflow-hidden">
                                                {user.avatar ? (
                                                    <img src={user.avatar} alt={user.name} className="h-full w-full object-cover" />
                                                ) : (
                                                    user.name.charAt(0)
                                                )}
                                            </div>
                                            <div>
                                                <div className="font-medium text-gray-800">{user.name}</div>
                                                <div className="text-sm text-gray-500">{user.email}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${user.role === 'Owner' ? 'bg-purple-100 text-purple-800' :
                                            user.role === 'Admin' ? 'bg-blue-100 text-blue-800' :
                                                'bg-gray-100 text-gray-800'
                                            }`}>
                                            {user.role}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        {user.isApproved ? (
                                            <span className="inline-flex items-center text-green-600 text-sm font-medium">
                                                <CheckCircle size={16} className="mr-1.5" /> Approved
                                            </span>
                                        ) : (
                                            <span className="inline-flex items-center text-amber-600 text-sm font-medium">
                                                <XCircle size={16} className="mr-1.5" /> Pending
                                            </span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4">
                                        {user.role !== 'Owner' && (
                                            <div className="flex items-center space-x-2">
                                                {!user.isApproved && (
                                                    <button
                                                        onClick={() => handleApprove(user._id)}
                                                        className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                                                        title="Approve User"
                                                    >
                                                        <UserCheck size={18} />
                                                    </button>
                                                )}

                                                <button
                                                    onClick={() => handleRoleChange(user._id, user.role)}
                                                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                    title="Change Role"
                                                >
                                                    <Shield size={18} />
                                                </button>

                                                <button
                                                    onClick={() => handleDelete(user._id)}
                                                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                    title="Delete User"
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                            </div>
                                        )}
                                    </td>
                                </tr>
                            ))}
                            {users.length === 0 && (
                                <tr>
                                    <td colSpan="4" className="px-6 py-8 text-center text-gray-500">
                                        No users found
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Access Requests Table */}
            {activeTab === 'access-requests' && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                    {requestsLoading ? (
                        <div className="p-8 text-center text-gray-500">Loading access requests...</div>
                    ) : (
                        <table className="w-full text-left border-collapse">
                            <thead className="bg-gray-50 text-gray-600 text-xs uppercase font-semibold">
                                <tr>
                                    <th className="px-6 py-4">Requester</th>
                                    <th className="px-6 py-4">Company</th>
                                    <th className="px-6 py-4">Message</th>
                                    <th className="px-6 py-4">Date</th>
                                    <th className="px-6 py-4">Status</th>
                                    <th className="px-6 py-4">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {accessRequests.map((request) => (
                                    <tr key={request._id} className="hover:bg-gray-50/50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="font-medium text-gray-800">{request.name}</div>
                                            <div className="text-sm text-gray-500">{request.email}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-sm text-gray-600">{request.company || '-'}</span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-sm text-gray-600 line-clamp-2">{request.message || '-'}</span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-sm text-gray-600">
                                                {new Date(request.createdAt).toLocaleDateString()}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${request.status === 'pending' ? 'bg-amber-100 text-amber-800' :
                                                request.status === 'approved' ? 'bg-green-100 text-green-800' :
                                                    'bg-red-100 text-red-800'
                                                }`}>
                                                {request.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            {request.status === 'pending' && (
                                                <div className="flex items-center space-x-2">
                                                    <button
                                                        onClick={() => handleApproveRequest(request._id)}
                                                        className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                                                        title="Approve Request"
                                                    >
                                                        <CheckSquare size={18} />
                                                    </button>
                                                    <button
                                                        onClick={() => handleRejectRequest(request._id)}
                                                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                        title="Reject Request"
                                                    >
                                                        <X size={18} />
                                                    </button>
                                                </div>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                                {accessRequests.length === 0 && (
                                    <tr>
                                        <td colSpan="6" className="px-6 py-8 text-center text-gray-500">
                                            No access requests found
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    )}
                </div>
            )}

            <ConfirmDialog
                isOpen={confirmModal.isOpen}
                onClose={closeConfirmModal}
                title={confirmModal.title}
                message={confirmModal.message}
                variant={confirmModal.variant}
                confirmText={confirmModal.confirmText}
                onConfirm={confirmModal.onConfirm}
            />
        </div>
    );
};

export default AdminDashboard;
