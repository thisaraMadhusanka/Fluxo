import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { MoreVertical, Users, Hash, Trash2, Eraser, ArrowLeft } from 'lucide-react';
import UserProfileModal from '@/components/UserProfileModal';
import ConfirmationModal from '@/components/ConfirmationModal';
import api from '@/services/api';
import { removeConversation } from '@/store/slices/messagesSlice';

const ConversationHeader = ({ conversation }) => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { user } = useSelector((state) => state.auth);
    const { onlineUsers } = useSelector((state) => state.messages);

    // Helper to finding other user safely
    const getOtherUser = () => {
        if (!conversation || !conversation.participants) return null;
        const currentUserId = user?._id || user?.id;

        const other = conversation.participants.find(p => {
            const pId = (p.user?._id || p.user)?.toString();
            return pId && pId !== currentUserId?.toString();
        });

        return other?.user;
    };

    // Get conversation display name
    const getConversationName = () => {
        if (conversation.name) return conversation.name;
        if (conversation.type === 'direct') {
            const otherUser = getOtherUser();
            return otherUser?.name || 'Unknown User';
        }
        return 'Conversation';
    };

    // Get conversation info (subtitle)
    const getConversationInfo = () => {
        if (conversation.type === 'channel' || conversation.type === 'group') {
            return `${conversation.participants.length} members`;
        }

        const otherUser = getOtherUser();
        const otherUserId = otherUser?._id;
        const isOnline = otherUserId && onlineUsers.includes(otherUserId);
        return isOnline ? 'Online' : 'Offline';
    };

    // Get conversation avatar/icon
    const getConversationIcon = () => {
        if (conversation.type === 'channel') {
            return (
                <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center shadow-sm">
                    <Hash size={20} className="text-primary stroke-[2.5]" />
                </div>
            );
        }

        if (conversation.type === 'group') {
            return (
                <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center shadow-sm">
                    <Users size={20} className="text-blue-600 stroke-[2.5]" />
                </div>
            );
        }

        const otherUser = getOtherUser();
        const otherUserId = otherUser?._id;
        const isOnline = otherUserId && onlineUsers.includes(otherUserId);

        return (
            <div className="relative">
                {otherUser?.avatar ? (
                    <img
                        src={otherUser.avatar}
                        alt={otherUser.name}
                        className="w-10 h-10 rounded-lg object-cover"
                    />
                ) : (
                    <div className="w-10 h-10 bg-gradient-to-br from-primary to-orange-600 rounded-lg flex items-center justify-center">
                        <span className="text-white font-bold">
                            {otherUser?.name?.charAt(0).toUpperCase() || '?'}
                        </span>
                    </div>
                )}
                {isOnline && (
                    <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
                )}
            </div>
        );
    };

    const [showMenu, setShowMenu] = React.useState(false);
    const [showProfileModal, setShowProfileModal] = React.useState(false);
    const [modalConfig, setModalConfig] = React.useState({
        isOpen: false,
        type: null,
        title: '',
        message: '',
        confirmText: '',
        isDangerous: false
    });
    const menuRef = React.useRef(null);

    const otherParticipant = conversation.type === 'direct' ? getOtherUser() : null;

    const handleViewProfile = () => {
        setShowMenu(false);
        setShowProfileModal(true);
    };

    const confirmClearChat = () => {
        setShowMenu(false);
        setModalConfig({
            isOpen: true,
            type: 'clear',
            title: 'Clear Messages?',
            message: 'This will remove all messages from this conversation. This action cannot be undone.',
            confirmText: 'Clear Messages',
            isDangerous: true
        });
    };

    const confirmDeleteConversation = () => {
        setShowMenu(false);
        setModalConfig({
            isOpen: true,
            type: 'delete',
            title: 'Delete Conversation?',
            message: 'This will permanently delete this conversation and all messages. This action cannot be undone.',
            confirmText: 'Delete Conversation',
            isDangerous: true
        });
    };

    const handleConfirmAction = async () => {
        try {
            if (modalConfig.type === 'clear') {
                await api.delete(`/conversations/${conversation._id}/messages`);
                // Reload the conversation to reflect cleared messages
                window.location.reload(); // Force full reload to ensure state updates
            } else if (modalConfig.type === 'delete') {
                await api.delete(`/conversations/${conversation._id}`);
                // Immediately remove from Redux state for instant UI update
                dispatch(removeConversation(conversation._id));
                navigate('/messages');
            }
        } catch (error) {
            console.error('Action failed:', error);
            // Use a better error notification instead of alert
            if (error.response?.data?.message) {
                console.error(error.response.data.message);
            }
        }
    };

    const handleCloseModal = () => {
        setModalConfig(prev => ({ ...prev, isOpen: false }));
    };

    React.useEffect(() => {
        const handleClickOutside = (event) => {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                setShowMenu(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <>
            <ConfirmationModal
                isOpen={modalConfig.isOpen}
                onClose={handleCloseModal}
                onConfirm={handleConfirmAction}
                title={modalConfig.title}
                message={modalConfig.message}
                confirmText={modalConfig.confirmText}
                isDangerous={modalConfig.isDangerous}
            />

            <div className="h-20 border-b border-gray-100 bg-white/90 backdrop-blur-md sticky top-0 z-20 px-4 md:px-8 flex items-center justify-between">
                <div className="flex items-center gap-3 md:gap-4 group cursor-pointer">
                    {/* Mobile Back Button */}
                    <button
                        onClick={() => navigate('/messages')}
                        className="md:hidden p-2 hover:bg-gray-100 rounded-lg text-gray-600 transition-colors -ml-2"
                        aria-label="Back to conversations"
                    >
                        <ArrowLeft size={20} />
                    </button>

                    <div className="transition-all duration-300 group-hover:scale-105 active:scale-95">
                        {getConversationIcon()}
                    </div>
                    <div>
                        <h2 className="font-bold text-gray-900 leading-none mb-1.5 tracking-tight text-[16px]">{getConversationName()}</h2>
                        <div className="flex items-center gap-2">
                            <p className={`text-[11px] font-bold tracking-wide ${getConversationInfo() === 'Online' ? 'text-green-500' : 'text-gray-400'}`}>
                                {getConversationInfo()}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-1">
                    <div className="relative" ref={menuRef}>
                        <button
                            onClick={() => setShowMenu(!showMenu)}
                            className={`p-2.5 rounded-xl transition-all duration-200 ${showMenu ? 'bg-gray-100 text-gray-900' : 'text-gray-400 hover:text-gray-600 hover:bg-gray-50'}`}
                            title="More Options"
                        >
                            <MoreVertical size={22} className="stroke-[2]" />
                        </button>

                        {showMenu && (
                            <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-[0_15px_40px_rgba(0,0,0,0.12)] border border-gray-100 py-2 z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                                <div className="px-5 py-2 border-b border-gray-50 mb-1">
                                    <span className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">Options</span>
                                </div>
                                <button
                                    onClick={handleViewProfile}
                                    className="w-full text-left px-5 py-3 text-[14px] text-gray-700 hover:bg-gray-50 font-bold transition-colors flex items-center gap-3"
                                >
                                    <Users size={17} className="text-gray-400" />
                                    View Profile
                                </button>
                                <button
                                    onClick={confirmClearChat}
                                    className="w-full text-left px-5 py-3 text-[14px] text-orange-600 hover:bg-orange-50 font-bold transition-colors flex items-center gap-3"
                                >
                                    <Eraser size={17} />
                                    Clear Messages
                                </button>
                                <button
                                    onClick={confirmDeleteConversation}
                                    className="w-full text-left px-5 py-3 text-[14px] text-red-600 hover:bg-red-50 font-bold transition-colors flex items-center gap-3"
                                >
                                    <Trash2 size={17} />
                                    Delete Conversation
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                <UserProfileModal
                    isOpen={showProfileModal}
                    onClose={() => setShowProfileModal(false)}
                    user={otherParticipant}
                />
            </div>
        </>
    );
};

export default ConversationHeader;
