import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { MessageCircle } from 'lucide-react';
import ConversationList from './ConversationList';
import MessageList from './MessageList';
import MessageInput from './MessageInput';
import ConversationHeader from './ConversationHeader';
import CreateConversationModal from './CreateConversationModal';
import api from '@/services/api';
import socketService from '@/services/socket';
import { setConversations, setActiveConversation, setMessages, markConversationAsRead } from '@/store/slices/messagesSlice';

const MessagingLayout = () => {
    const { conversationId } = useParams();
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { user, token } = useSelector((state) => state.auth);
    const { conversations, activeConversation, messages } = useSelector((state) => state.messages);
    const [loading, setLoading] = useState(true);
    const [showCreateModal, setShowCreateModal] = useState(false);

    // Handle Firebase subscription
    useEffect(() => {
        if (conversationId) {
            chatService.subscribeToMessages(conversationId);
        }

        return () => {
            if (conversationId) {
                chatService.unsubscribeFromMessages(conversationId);
            }
        };
    }, [conversationId]);

    // Load conversations
    useEffect(() => {
        const loadConversations = async () => {
            try {
                const { data } = await api.get('/conversations');
                dispatch(setConversations(data));
            } catch (error) {
                console.error('Error loading conversations:', error);
            } finally {
                setLoading(false);
            }
        };

        loadConversations();
    }, [dispatch]);

    // Set active conversation from URL
    useEffect(() => {
        if (conversationId && conversations.length > 0) {
            const conversation = conversations.find(c => c._id === conversationId);
            if (conversation) {
                dispatch(setActiveConversation(conversation));
                loadMessages(conversationId);
            }
        }
    }, [conversationId, conversations, dispatch]);


    // Load messages for active conversation
    const loadMessages = async (convId) => {
        try {
            console.log('Loading messages for conversation:', convId);
            const { data } = await api.get(`/conversations/${convId}/messages`);
            console.log('Messages loaded:', data);
            dispatch(setMessages({ conversationId: convId, messages: data.messages }));

            // Mark as read
            await api.post(`/conversations/${convId}/read`);
            dispatch(markConversationAsRead(convId));
        } catch (error) {
            console.error('Error loading messages:', error);
        }
    };

    // Handle new conversation created
    const handleConversationCreated = async (conversation) => {
        // Refresh conversations
        const { data } = await api.get('/conversations');
        dispatch(setConversations(data));
        // Navigate to new conversation
        navigate(`/messages/${conversation._id}`);
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-full bg-gray-50">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading conversations...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex h-full bg-gray-50">
            {/* Left Sidebar - Conversations */}
            <div className={`${conversationId ? 'hidden md:flex' : 'flex'
                } w-full md:w-80 bg-white border-r border-gray-200 flex-shrink-0 flex-col`}>
                <ConversationList onCreateClick={() => setShowCreateModal(true)} />
            </div>

            {/* Main Chat Area */}
            <div className={`${conversationId ? 'flex' : 'hidden md:flex'
                } flex-1 flex-col min-w-0`}>
                {activeConversation ? (
                    <>
                        {/* Conversation Header */}
                        <ConversationHeader conversation={activeConversation} />

                        {/* Messages */}
                        <div className="flex-1 overflow-y-auto">
                            <MessageList
                                messages={messages[activeConversation._id] || []}
                                conversationId={activeConversation._id}
                            />
                        </div>

                        {/* Message Input */}
                        <MessageInput conversationId={activeConversation._id} />
                    </>
                ) : (
                    /* No Conversation Selected */
                    <div className="flex-1 flex items-center justify-center bg-gray-50">
                        <div className="text-center">
                            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                                <MessageCircle size={48} className="text-gray-400" />
                            </div>
                            <h2 className="text-2xl font-black text-gray-900 mb-2">Welcome to Messages</h2>
                            <p className="text-gray-500 mb-6">Select a conversation to start messaging</p>
                        </div>
                    </div>
                )}
            </div>

            {/* Create Conversation Modal */}
            <CreateConversationModal
                isOpen={showCreateModal}
                onClose={() => setShowCreateModal(false)}
                onConversationCreated={handleConversationCreated}
            />
        </div>
    );
};

export default MessagingLayout;
