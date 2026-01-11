import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    conversations: [],
    activeConversation: null,
    messages: {},  // { conversationId: [messages] }
    loading: false,
    error: null,
    onlineUsers: [],
    typingUsers: {}, // { conversationId: [userId] }
    unreadCounts: {} // { conversationId: count }
};

const messagesSlice = createSlice({
    name: 'messages',
    initialState,
    reducers: {
        setConversations: (state, action) => {
            state.conversations = action.payload;
            // Update unread counts
            action.payload.forEach(conv => {
                state.unreadCounts[conv._id] = conv.unreadCount || 0;
            });
        },
        setActiveConversation: (state, action) => {
            state.activeConversation = action.payload;
        },
        setMessages: (state, action) => {
            const { conversationId, messages } = action.payload;
            state.messages[conversationId] = messages;
        },
        addMessage: (state, action) => {
            const message = action.payload;
            const conversationId = message.conversation;

            if (!state.messages[conversationId]) {
                state.messages[conversationId] = [];
            }

            // Avoid duplicates
            const exists = state.messages[conversationId].find(m => m._id === message._id);
            if (!exists) {
                state.messages[conversationId].push(message);
            }

            // Update conversation's last message
            const conversation = state.conversations.find(c => c._id === conversationId);
            if (conversation) {
                conversation.lastMessage = {
                    content: message.content,
                    sender: message.sender,
                    timestamp: message.createdAt
                };
            }
        },
        updateMessage: (state, action) => {
            const { conversationId, messageId, updates } = action.payload;
            if (state.messages[conversationId]) {
                const messageIndex = state.messages[conversationId].findIndex(m => m._id === messageId);
                if (messageIndex !== -1) {
                    state.messages[conversationId][messageIndex] = {
                        ...state.messages[conversationId][messageIndex],
                        ...updates
                    };
                }
            }
        },
        setOnlineUsers: (state, action) => {
            state.onlineUsers = action.payload;
        },
        addOnlineUser: (state, action) => {
            if (!state.onlineUsers.includes(action.payload)) {
                state.onlineUsers.push(action.payload);
            }
        },
        removeOnlineUser: (state, action) => {
            state.onlineUsers = state.onlineUsers.filter(id => id !== action.payload);
        },
        setTyping: (state, action) => {
            const { conversationId, userId, isTyping } = action.payload;
            if (!state.typingUsers[conversationId]) {
                state.typingUsers[conversationId] = [];
            }

            if (isTyping) {
                if (!state.typingUsers[conversationId].includes(userId)) {
                    state.typingUsers[conversationId].push(userId);
                }
            } else {
                state.typingUsers[conversationId] = state.typingUsers[conversationId].filter(id => id !== userId);
            }
        },
        updateReaction: (state, action) => {
            const { conversationId, messageId, reactions } = action.payload;
            if (state.messages[conversationId]) {
                const message = state.messages[conversationId].find(m => m._id === messageId);
                if (message) {
                    message.reactions = reactions;
                }
            }
        },
        removeMessage: (state, action) => {
            const { conversationId, messageId } = action.payload;
            if (state.messages[conversationId]) {
                state.messages[conversationId] = state.messages[conversationId].filter(
                    m => m._id !== messageId
                );
            }
        },
        clearMessages: (state, action) => {
            const { conversationId } = action.payload;
            if (state.messages[conversationId]) {
                state.messages[conversationId] = [];
            }
        },
        markConversationAsRead: (state, action) => {
            const conversationId = action.payload;
            state.unreadCounts[conversationId] = 0;
            const conversation = state.conversations.find(c => c._id === conversationId);
            if (conversation) {
                conversation.unreadCount = 0;
            }
        },
        incrementUnread: (state, action) => {
            const conversationId = action.payload;
            state.unreadCounts[conversationId] = (state.unreadCounts[conversationId] || 0) + 1;
            const conversation = state.conversations.find(c => c._id === conversationId);
            if (conversation) {
                conversation.unreadCount = (conversation.unreadCount || 0) + 1;
            }
        },
        setLoading: (state, action) => {
            state.loading = action.payload;
        },
        setError: (state, action) => {
            state.error = action.payload;
        },
        clearError: (state) => {
            state.error = null;
        },
        removeConversation: (state, action) => {
            const conversationId = action.payload;
            // Remove from conversations list
            state.conversations = state.conversations.filter(c => c._id !== conversationId);
            // Clear messages for this conversation
            delete state.messages[conversationId];
            // Clear unread count
            delete state.unreadCounts[conversationId];
            // Clear active conversation if it was deleted
            if (state.activeConversation?._id === conversationId || state.activeConversation === conversationId) {
                state.activeConversation = null;
            }
        },
        updateMessageReadStatus: (state, action) => {
            const { conversationId, messageId, userId, readAt } = action.payload;
            const messages = state.messages[conversationId];
            if (messages) {
                const message = messages.find(m => m._id === messageId);
                if (message) {
                    if (!message.readBy) {
                        message.readBy = [];
                    }
                    // Add user to readBy if not already there
                    if (!message.readBy.some(r => (r.user?._id || r.user) === userId)) {
                        message.readBy.push({ user: userId, readAt });
                    }
                }
            }
        },
    }
});

export const {
    setConversations,
    setActiveConversation,
    setMessages,
    addMessage,
    updateMessage,
    setOnlineUsers,
    addOnlineUser,
    removeOnlineUser,
    setTyping,
    updateReaction,
    removeMessage,
    clearMessages,
    markConversationAsRead,
    incrementUnread,
    setLoading,
    setError,
    clearError,
    removeConversation,
    updateMessageReadStatus
} = messagesSlice.actions;

export default messagesSlice.reducer;
