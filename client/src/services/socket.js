import { io } from 'socket.io-client';
import { store } from '../store';
import {
    addMessage,
    addOnlineUser,
    removeOnlineUser,
    setTyping,
    updateReaction,
    incrementUnread,
    removeMessage,
    clearMessages,
    removeConversation,
    updateMessageReadStatus
} from '../store/slices/messagesSlice';

class SocketService {
    constructor() {
        this.socket = null;
        this.isConnected = false;
    }

    connect(token) {
        // Disable Socket.IO on production/Vercel (doesn't support WebSockets)
        const isProduction = import.meta.env.PROD;
        const API_URL_DOMAIN = import.meta.env.VITE_API_URL || '';
        const isVercel = API_URL_DOMAIN.includes('vercel.app');

        if (isProduction && isVercel) {
            console.log('ℹ️ Socket.IO disabled on Vercel (WebSocket not supported on serverless)');
            console.log('💡 Messaging features are not available in this deployment');
            this.isConnected = false;
            return;
        }

        if (this.socket) {
            this.disconnect();
        }

        let API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

        // Socket.IO doesn't need the /api prefix, strip it if present to avoid "Invalid namespace" errors
        if (API_URL.endsWith('/api')) {
            API_URL = API_URL.replace(/\/api$/, '');
        }

        console.log('Connecting to Socket.IO:', API_URL);

        this.socket = io(API_URL, {
            auth: { token },
            autoConnect: true,
            reconnection: true,
            reconnectionDelay: 1000,
            reconnectionAttempts: 5,
            transports: ['websocket', 'polling'],
            path: '/socket.io/'
        });

        this.setupListeners();
    }

    setupListeners() {
        this.socket.on('connect', () => {
            console.log('✅ Socket connected successfully:', this.socket.id);
            this.isConnected = true;
        });

        this.socket.on('disconnect', (reason) => {
            console.log('❌ Socket disconnected:', reason);
            this.isConnected = false;
        });

        this.socket.on('connect_error', (error) => {
            console.warn('⚠️ Socket connection error (expected on Vercel/Serverless):', error.message);
        });

        // Message events
        this.socket.on('message:new', (message) => {
            console.log('📩 Socket: Received message:new:', message);
            store.dispatch(addMessage(message));

            const state = store.getState();
            const activeId = state.messages.activeConversation?._id || state.messages.activeConversation;
            const msgConvId = message.conversation?._id || message.conversation;

            if (activeId?.toString() !== msgConvId?.toString()) {
                console.log(`🔔 Socket: Incrementing unread for conversation: ${msgConvId}`);
                store.dispatch(incrementUnread(msgConvId));
            }
        });

        this.socket.on('message:sent', ({ tempId, message }) => {
            store.dispatch(addMessage(message));
        });

        this.socket.on('message:read', ({ messageId, userId, readAt }) => {
            console.log(`✅ Message ${messageId} read by ${userId}`);
            // Get active conversation to update the message
            const state = store.getState();
            const activeConvId = state.messages.activeConversation?._id || state.messages.activeConversation;

            // Find which conversation this message belongs to
            let conversationId = activeConvId;
            if (!conversationId) {
                // Search through all conversations' messages
                for (const [convId, messages] of Object.entries(state.messages.messages)) {
                    if (messages.some(m => m._id === messageId)) {
                        conversationId = convId;
                        break;
                    }
                }
            }

            if (conversationId) {
                store.dispatch(updateMessageReadStatus({ conversationId, messageId, userId, readAt }));
            }
        });

        // Handle message reaction
        this.socket.on('messageReacted', (message) => {
            const conversationId = message.conversation?._id || message.conversation;
            store.dispatch(updateReaction({
                conversationId,
                messageId: message._id,
                reactions: message.reactions
            }));
        });

        // Handle message deletion
        this.socket.on('messageDeleted', ({ messageId }) => {
            const state = store.getState();
            const { messages } = state.messages;
            for (const [convId, msgs] of Object.entries(messages)) {
                if (msgs.find(m => m._id === messageId)) {
                    store.dispatch(removeMessage({ conversationId: convId, messageId }));
                    break;
                }
            }
        });

        // Handle conversation clear
        this.socket.on('conversationCleared', ({ conversationId }) => {
            store.dispatch(clearMessages({ conversationId }));
        });

        // Handle conversation deletion
        this.socket.on('conversationDeleted', ({ conversationId }) => {
            console.log('🗑️ Socket: Conversation deleted:', conversationId);
            store.dispatch(removeConversation(conversationId));
        });

        // User presence events
        this.socket.on('user:online', ({ userId }) => {
            store.dispatch(addOnlineUser(userId));
        });

        this.socket.on('user:offline', ({ userId }) => {
            store.dispatch(removeOnlineUser(userId));
        });

        // Typing events
        this.socket.on('typing:start', ({ userId, conversationId }) => {
            store.dispatch(setTyping({ conversationId, userId, isTyping: true }));
        });

        this.socket.on('typing:stop', ({ userId, conversationId }) => {
            store.dispatch(setTyping({ conversationId, userId, isTyping: false }));
        });
    }

    disconnect() {
        if (this.socket) {
            this.socket.disconnect();
            this.socket = null;
            this.isConnected = false;
        }
    }

    joinConversation(conversationId) {
        if (this.socket && this.isConnected) {
            this.socket.emit('conversation:join', conversationId);
        }
    }

    leaveConversation(conversationId) {
        if (this.socket && this.isConnected) {
            this.socket.emit('conversation:leave', conversationId);
        }
    }

    sendMessage(data) {
        if (this.socket && this.isConnected) {
            const tempId = `temp-${Date.now()}`;
            this.socket.emit('message:send', { ...data, tempId });
            return tempId;
        }
        return null;
    }

    startTyping(conversationId) {
        if (this.socket && this.isConnected) {
            this.socket.emit('typing:start', { conversationId });
        }
    }

    stopTyping(conversationId) {
        if (this.socket && this.isConnected) {
            this.socket.emit('typing:stop', { conversationId });
        }
    }

    markAsRead(conversationId, messageId) {
        if (this.socket && this.isConnected) {
            this.socket.emit('message:read', { conversationId, messageId });
        }
    }

    reactToMessage(messageId, emoji, action = 'add') {
        if (this.socket && this.isConnected) {
            this.socket.emit('reactToMessage', { messageId, emoji, action });
        }
    }

    deleteMessage(messageId) {
        if (this.socket && this.isConnected) {
            this.socket.emit('deleteMessage', { messageId });
        }
    }

    clearConversation(conversationId) {
        if (this.socket && this.isConnected) {
            this.socket.emit('clearConversation', { conversationId });
        }
    }
}

export default new SocketService();
