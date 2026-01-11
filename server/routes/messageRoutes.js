const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
    getConversations,
    getMessages,
    sendMessage,
    markAsRead,
    createConversation,
    addReaction,
    removeReaction,
    deleteMessage,
    clearConversation,
    deleteConversation
} = require('../controllers/messageController');

// Conversation routes
router.get('/conversations', protect, getConversations);
router.post('/conversations', protect, createConversation);
router.get('/conversations/:id/messages', protect, getMessages);
router.post('/conversations/:id/read', protect, markAsRead);
router.delete('/conversations/:id/messages', protect, clearConversation);
router.delete('/conversations/:id', protect, deleteConversation);

// Message routes
router.post('/messages', protect, sendMessage);
router.post('/messages/:id/react', protect, addReaction);
router.delete('/messages/:id/react', protect, removeReaction);
router.delete('/messages/:id', protect, deleteMessage);

module.exports = router;
