import { db } from "./firebase";
import { ref, push, onChildAdded, serverTimestamp, set, remove, off } from "firebase/database";
import store from "@/store"; // Access Redux store directly (read-only recommended)
import { addMessage, setTyping } from "@/store/slices/messagesSlice";
import api from "./api"; // For non-realtime fallback or initial load if needed

class ChatService {
    constructor() {
        this.activeListeners = {}; // { conversationId: listenerFunction }
    }

    /**
     * Send a message to a conversation
     * @param {string} conversationId 
     * @param {object} messageData - { content, type, sender }
     * @returns {Promise<string>} - Firebase Message ID
     */
    async sendMessage(conversationId, messageData) {
        if (!db) {
            console.error("Cannot send message: Firebase not initialized");
            return null;
        }

        try {
            // 1. Save to MongoDB (Archive/Backup) via API
            // We still need this to persist data permanently and handle notifications/unread counts on backend
            const response = await api.post(`/conversations/${conversationId}/messages`, messageData);
            const savedMessage = response.data;

            // 2. Push to Firebase for Realtime updates
            const messagesRef = ref(db, `messages/${conversationId}`);

            // We push the FULL message object returned by MongoDB so consistent IDs are used
            // OR we can just push a lightweight version if we want Firebase to be the source of truth for "live" view
            // For this hybrid approach, let's sync the MongoDB message object to Firebase

            // Use the MongoDB ID as the key in Firebase if possible, or let Firebase generate one
            // Let's use push() which generates a time-sorted key, but include mongoId inside
            await push(messagesRef, {
                ...savedMessage,
                timestamp: serverTimestamp() // Ensure server-side ordering
            });

            return savedMessage._id;
        } catch (error) {
            console.error("Error sending message:", error);
            throw error;
        }
    }

    /**
     * Subscribe to messages for a conversation
     * @param {string} conversationId 
     */
    subscribeToMessages(conversationId) {
        if (!db || this.activeListeners[conversationId]) return;

        console.log(`🔌 Subscribing to Firebase chat: ${conversationId}`);
        const messagesRef = ref(db, `messages/${conversationId}`);

        // Listen for new messages added
        const listener = onChildAdded(messagesRef, (snapshot) => {
            const message = snapshot.val();
            console.log("📩 Firebase received:", message);

            // Dispatch to Redux
            store.dispatch(addMessage(message));
        });

        this.activeListeners[conversationId] = { ref: messagesRef, listener };
    }

    /**
     * Unsubscribe from a conversation
     * @param {string} conversationId 
     */
    unsubscribeFromMessages(conversationId) {
        if (this.activeListeners[conversationId]) {
            const { ref, listener } = this.activeListeners[conversationId];
            off(ref, "child_added", listener);
            delete this.activeListeners[conversationId];
            console.log(`🔌 Unsubscribed from: ${conversationId}`);
        }
    }

    /**
     * Set typing status
     * @param {string} conversationId 
     * @param {string} userId 
     * @param {boolean} isTyping 
     */
    async setTypingStatus(conversationId, userId, isTyping) {
        if (!db) return;

        const typingRef = ref(db, `typing/${conversationId}/${userId}`);
        if (isTyping) {
            await set(typingRef, true);
        } else {
            await remove(typingRef);
        }
    }

    // Subscribe to typing indicators
    subscribeToTyping(conversationId) {
        if (!db) return;
        // Implementation for typing listeners could go here
    }
}

export const chatService = new ChatService();
