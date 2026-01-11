import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { Search, Plus, MessageCircle, Users, Hash } from 'lucide-react';
import { formatDistanceToNow, format } from 'date-fns';

const ConversationList = ({ onCreateClick }) => {
    const navigate = useNavigate();
    const { conversations, activeConversation, onlineUsers, unreadCounts } = useSelector((state) => state.messages);
    const { user } = useSelector((state) => state.auth);
    const currentUserId = user?._id || user?.id;
    const [searchQuery, setSearchQuery] = useState('');
    const [activeTab, setActiveTab] = useState('members'); // members, all, channels

    // Filter conversations based on search and tab
    const filteredConversations = conversations.filter(conv => {
        // Search filter
        const matchesSearch = conv.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            conv.participants.some(p => p.user?.name?.toLowerCase().includes(searchQuery.toLowerCase()));

        // Tab filter
        let matchesTab = true;
        if (activeTab === 'members') {
            matchesTab = conv.type === 'direct' || conv.type === 'group';
        } else if (activeTab === 'channels') {
            matchesTab = conv.type === 'channel';
        }

        return matchesSearch && matchesTab;
    });

    // Get conversation display name
    const getConversationName = (conv) => {
        if (conv.name) return conv.name;

        // For direct messages, show other user's name
        if (conv.type === 'direct') {
            const currentUserId = user?._id || user?.id;
            const otherUser = conv.participants.find(p => {
                const pId = p.user?._id || p.user;
                return pId && currentUserId && pId.toString() !== currentUserId.toString();
            });
            return otherUser?.user?.name || 'Unknown User';
        }

        return 'Conversation';
    };

    // Get conversation avatar
    const getConversationAvatar = (conv) => {
        if (conv.type === 'channel') {
            return (
                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Hash size={24} className="text-primary" />
                </div>
            );
        }

        if (conv.type === 'group') {
            return (
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Users size={24} className="text-blue-600" />
                </div>
            );
        }

        // Direct message - show other user's avatar
        const currentUserId = user?._id || user?.id;
        const otherUser = conv.participants.find(p => {
            const pId = p.user?._id || p.user;
            return pId && currentUserId && pId.toString() !== currentUserId.toString();
        });
        const isOnline = otherUser?.user?._id ? onlineUsers.includes(otherUser.user._id) : false;

        return (
            <div className="relative flex-shrink-0">
                {otherUser?.user?.avatar ? (
                    <img
                        src={otherUser.user.avatar}
                        alt={otherUser.user.name}
                        className="w-12 h-12 rounded-xl object-cover"
                    />
                ) : (
                    <div className="w-12 h-12 bg-gradient-to-br from-primary to-orange-600 rounded-xl flex items-center justify-center">
                        <span className="text-white font-bold text-lg">
                            {otherUser?.user?.name?.charAt(0).toUpperCase() || '?'}
                        </span>
                    </div>
                )}
                {isOnline && (
                    <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 border-2 border-white rounded-full"></div>
                )}
            </div>
        );
    };

    // Format last message time
    const formatTime = (timestamp) => {
        if (!timestamp) return '';
        try {
            return formatDistanceToNow(new Date(timestamp), { addSuffix: true });
        } catch {
            return '';
        }
    };

    return (
        <div className="flex flex-col h-full">
            {/* Header */}
            <div className="p-4 border-b border-gray-200">
                <div className="flex items-center justify-between mb-4">
                    <h1 className="text-2xl font-black text-gray-900">Messages</h1>
                    <button
                        onClick={onCreateClick}
                        className="p-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
                        title="New Message"
                    >
                        <Plus size={20} />
                    </button>
                </div>

                {/* Search */}
                <div className="relative">
                    <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search conversations..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm"
                    />
                </div>

                {/* Tabs */}
                <div className="flex space-x-1 mt-3 bg-gray-100 rounded-lg p-1">
                    <button
                        onClick={() => setActiveTab('members')}
                        className={`flex-1 px-3 py-1.5 rounded-md text-xs font-bold transition-colors ${activeTab === 'members'
                            ? 'bg-white text-gray-900 shadow-sm'
                            : 'text-gray-600 hover:text-gray-900'
                            }`}
                    >
                        Members
                    </button>
                    <button
                        onClick={() => setActiveTab('all')}
                        className={`flex-1 px-3 py-1.5 rounded-md text-xs font-bold transition-colors ${activeTab === 'all'
                            ? 'bg-white text-gray-900 shadow-sm'
                            : 'text-gray-600 hover:text-gray-900'
                            }`}
                    >
                        All
                    </button>
                </div>
            </div>

            {/* Conversations List */}
            <div className="flex-1 overflow-y-auto">
                {filteredConversations.length > 0 ? (
                    <div className="space-y-1.5">
                        {filteredConversations.map((conv) => {
                            const isActive = activeConversation?._id === conv._id;
                            const otherParticipant = conv.type === 'direct'
                                ? conv.participants.find(p => (p.user?._id || p.user)?.toString() !== currentUserId?.toString())?.user
                                : null;
                            const name = getConversationName(conv);
                            const isOnline = otherParticipant && onlineUsers.includes(otherParticipant._id || otherParticipant);

                            return (
                                <div
                                    key={conv._id}
                                    onClick={() => navigate(`/messages/${conv._id}`)}
                                    className={`group relative mx-2 p-3 rounded-2xl cursor-pointer transition-all duration-300 ${isActive
                                        ? 'bg-white shadow-[0_4px_20px_rgb(0,0,0,0.08)] scale-[1.02] z-10'
                                        : 'hover:bg-gray-100/80 active:scale-95'
                                        }`}
                                >
                                    {/* Active Indicator Bar */}
                                    {isActive && (
                                        <div className="absolute left-0 top-1/4 bottom-1/4 w-1 bg-primary rounded-r-full shadow-[0_0_8px_rgba(255,107,0,0.4)]" />
                                    )}

                                    <div className="flex items-center gap-3">
                                        {/* Avatar Column */}
                                        <div className="relative">
                                            <div className={`transition-transform duration-300 ${isActive ? 'scale-110' : 'group-hover:scale-110'}`}>
                                                {getConversationAvatar(conv)}
                                            </div>
                                        </div>

                                        {/* Info Column */}
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center justify-between mb-0.5">
                                                <h3 className={`text-sm font-black truncate tracking-tight transition-colors ${isActive ? 'text-primary' : 'text-gray-800'
                                                    }`}>
                                                    {name}
                                                </h3>
                                                {conv.lastMessage && (
                                                    <span className="text-[10px] font-bold text-gray-400 whitespace-nowrap ml-2 uppercase tracking-wide">
                                                        {format(new Date(conv.lastMessage.timestamp), 'h:mm a')}
                                                    </span>
                                                )}
                                            </div>

                                            <div className="flex items-center justify-between">
                                                <p className={`text-xs truncate ${isActive || (unreadCounts[conv._id] > 0)
                                                    ? 'text-gray-600 font-bold'
                                                    : 'text-gray-400 font-medium'
                                                    }`}>
                                                    {conv.lastMessage?.content || 'No messages yet'}
                                                </p>

                                                {unreadCounts[conv._id] > 0 && (
                                                    <div className="ml-2 px-1.5 py-0.5 bg-primary text-white text-[10px] font-black rounded-full shadow-md shadow-primary/20 scale-110">
                                                        {unreadCounts[conv._id]}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center h-64 text-gray-400">
                        <MessageCircle size={48} className="mb-3 opacity-50" />
                        <p className="text-sm font-medium">
                            {searchQuery ? 'No conversations found' : 'No conversations yet'}
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ConversationList;
