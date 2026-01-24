const Message = require('../models/Message');
const Conversation = require('../models/Conversation');

// @desc    Get all conversations for current user
// @route   GET /api/conversations
// @access  Private
const getConversations = async (req, res) => {
    try {
        console.log('📞 Fetching conversations for user:', req.user.id);

        const conversations = await Conversation.find({
            'participants.user': req.user.id,
            archivedBy: { $ne: req.user.id }
        })
            .populate('participants.user', 'name email avatar')
            .populate('lastMessage.sender', 'name avatar')
            .populate('workspace', 'name')
            .populate('project', 'title emoji')
            .sort({ 'lastMessage.timestamp': -1 })
            .lean(); // Use lean() for better performance

        console.log(`✅ Found ${conversations.length} conversations`);

        // Filter out conversations with invalid data and add unread count
        const validConversations = conversations
            .filter(conv => {
                // Check if participants array exists and has valid users
                if (!conv.participants || !Array.isArray(conv.participants)) {
                    console.warn('⚠️ Conversation has no participants:', conv._id);
                    return false;
                }

                // Check if at least one participant is valid
                const hasValidParticipants = conv.participants.some(p => p.user && p.user._id);
                if (!hasValidParticipants) {
                    console.warn('⚠️ Conversation has no valid participants:', conv._id);
                    return false;
                }

                return true;
            })
            .map(conv => {
                // Find current user's participant record
                const participant = conv.participants.find(
                    p => p.user && p.user._id.toString() === req.user.id.toString()
                );

                return {
                    ...conv,
                    unreadCount: participant?.unreadCount || 0
                };
            });

        console.log(`✅ Returning ${validConversations.length} valid conversations`);
        res.json(validConversations);
    } catch (error) {
        console.error('❌ Get Conversations Error:', error);
        console.error('Error stack:', error.stack);
        res.status(500).json({
            message: 'Server Error fetching conversations',
            error: error.message
        });
    }
};

// @desc    Get messages for a conversation
// @route   GET /api/conversations/:id/messages
// @access  Private
const getMessages = async (req, res) => {
    try {
        const { id } = req.params;
        const { page = 1, limit = 50 } = req.query;

        // Check if user is participant
        const conversation = await Conversation.findById(id);
        if (!conversation) {
            return res.status(404).json({ message: 'Conversation not found' });
        }

        if (!conversation.isParticipant(req.user.id)) {
            return res.status(403).json({ message: 'Not authorized to view this conversation' });
        }

        // Get messages with pagination
        const messages = await Message.find({ conversation: id })
            .populate('sender', 'name email avatar')
            .populate('replyTo', 'content sender')
            .populate('reactions.users', 'name')
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(parseInt(limit));

        const total = await Message.countDocuments({ conversation: id });

        res.json({
            messages: messages.reverse(), // Reverse to show oldest first
            page: parseInt(page),
            pages: Math.ceil(total / limit),
            total
        });
    } catch (error) {
        console.error('Get Messages Error:', error);
        res.status(500).json({ message: 'Server Error fetching messages' });
    }
};

// @desc    Send a message
// @route   POST /api/messages
// @access  Private
const sendMessage = async (req, res) => {
    try {
        const { conversationId, content, type = 'text', replyTo, attachments } = req.body;

        // Verify conversation exists and user is participant
        const conversation = await Conversation.findById(conversationId);
        if (!conversation) {
            return res.status(404).json({ message: 'Conversation not found' });
        }

        if (!conversation.isParticipant(req.user.id)) {
            return res.status(403).json({ message: 'Not authorized to send message' });
        }

        // Create message
        const message = await Message.create({
            conversation: conversationId,
            sender: req.user.id,
            content,
            type,
            replyTo,
            attachments: attachments || []
        });

        // Update conversation's last message
        conversation.lastMessage = {
            content: content || (attachments && attachments.length > 0 ? 'Sent an attachment' : 'New message'),
            sender: req.user.id,
            timestamp: new Date()
        };

        // Increment unread count for other participants
        conversation.incrementUnreadCount(req.user.id);
        await conversation.save();

        // Populate sender info
        await message.populate('sender', 'name email avatar');

        // Broadcast message to all connected socket clients in this conversation
        const io = req.app.get('io');
        if (io) {
            console.log(`📢 HTTP API: Broadcasting message:new to room conversation:${conversationId}`);
            io.to(`conversation:${conversationId}`).emit('message:new', message);
        }

        res.status(201).json(message);
    } catch (error) {
        console.error('Send Message Error:', error);
        res.status(500).json({ message: 'Server Error sending message' });
    }
};

// @desc    Mark conversation as read
// @route   POST /api/conversations/:id/read
// @access  Private
const markAsRead = async (req, res) => {
    try {
        const { id } = req.params;

        const conversation = await Conversation.findById(id);
        if (!conversation) {
            return res.status(404).json({ message: 'Conversation not found' });
        }

        if (!conversation.isParticipant(req.user.id)) {
            return res.status(403).json({ message: 'Not authorized' });
        }

        // Update participant's lastRead and reset unread count
        const participant = conversation.participants.find(
            p => p.user.toString() === req.user.id.toString()
        );

        if (participant) {
            participant.lastRead = new Date();
            participant.unreadCount = 0;
            await conversation.save();
        }

        // Mark all unread messages in this conversation as read
        const unreadMessages = await Message.find({
            conversation: id,
            'readBy.user': { $ne: req.user.id }
        });

        console.log(`📖 Marking ${unreadMessages.length} messages as read for user ${req.user.id}`);

        for (const message of unreadMessages) {
            // Skip if sender is the current user
            if (message.sender.toString() === req.user.id.toString()) {
                continue;
            }

            message.readBy.push({
                user: req.user.id,
                readAt: new Date()
            });
            await message.save();

            // Emit socket event to notify sender
            const io = req.app.get('io');
            console.log(`🔍 IO instance found:`, !!io);
            if (io) {
                console.log(`📤 Emitting message:read for message ${message._id} to conversation:${id}`);
                io.to(`conversation:${id}`).emit('message:read', {
                    messageId: message._id,
                    userId: req.user.id,
                    readAt: new Date()
                });
            } else {
                console.error('❌ IO instance not found in req.app');
            }
        }

        res.json({ message: 'Marked as read', messagesMarked: unreadMessages.length });
    } catch (error) {
        console.error('Mark As Read Error:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Create a conversation
// @route   POST /api/conversations
// @access  Private
const createConversation = async (req, res) => {
    try {
        const { type, name, participants, workspaceId, projectId, isPrivate } = req.body;

        // For direct messages, use findOrCreateDirect
        if (type === 'direct' && participants.length === 1) {
            const conversation = await Conversation.findOrCreateDirect(
                req.user.id,
                participants[0]
            );
            await conversation.populate('participants.user', 'name email avatar');
            return res.status(201).json(conversation);
        }

        // Create group or channel
        const participantList = [
            { user: req.user.id, role: 'admin' },
            ...participants.map(userId => ({ user: userId, role: 'member' }))
        ];

        const conversation = await Conversation.create({
            type,
            name,
            participants: participantList,
            workspace: workspaceId,
            project: projectId,
            isPrivate: isPrivate !== undefined ? isPrivate : true,
            createdBy: req.user.id
        });

        await conversation.populate('participants.user', 'name email avatar');

        res.status(201).json(conversation);
    } catch (error) {
        console.error('Create Conversation Error:', error);
        res.status(500).json({ message: 'Server Error creating conversation' });
    }
};

// @desc    Add reaction to message
// @route   POST /api/messages/:id/react
// @access  Private
const addReaction = async (req, res) => {
    try {
        const { id } = req.params;
        const { emoji } = req.body;

        const message = await Message.findById(id);
        if (!message) {
            return res.status(404).json({ message: 'Message not found' });
        }

        // Check if reaction already exists
        const existingReaction = message.reactions.find(r => r.emoji === emoji);

        if (existingReaction) {
            // Add user to existing reaction if not already there
            if (!existingReaction.users.includes(req.user.id)) {
                existingReaction.users.push(req.user.id);
            }
        } else {
            // Create new reaction
            message.reactions.push({
                emoji,
                users: [req.user.id]
            });
        }

        await message.save();
        await message.populate('reactions.users', 'name');

        res.json(message);
    } catch (error) {
        console.error('Add Reaction Error:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Remove reaction from message
// @route   DELETE /api/messages/:id/react
// @access  Private
const removeReaction = async (req, res) => {
    try {
        const { id } = req.params;
        const { emoji } = req.body;

        const message = await Message.findById(id);
        if (!message) {
            return res.status(404).json({ message: 'Message not found' });
        }

        const reaction = message.reactions.find(r => r.emoji === emoji);
        if (reaction) {
            reaction.users = reaction.users.filter(
                userId => userId.toString() !== req.user.id.toString()
            );

            // Remove reaction if no users left
            if (reaction.users.length === 0) {
                message.reactions = message.reactions.filter(r => r.emoji !== emoji);
            }
        }

        await message.save();
        await message.populate('reactions.users', 'name');

        res.json(message);
    } catch (error) {
        console.error('Remove Reaction Error:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Delete a message
// @route   DELETE /api/messages/:id
// @access  Private
const deleteMessage = async (req, res) => {
    try {
        const { id } = req.params;

        const message = await Message.findById(id);
        if (!message) {
            return res.status(404).json({ message: 'Message not found' });
        }

        // Check if user is the sender
        if (message.sender.toString() !== req.user.id) {
            return res.status(403).json({ message: 'Not authorized to delete this message' });
        }

        await message.deleteOne();

        // Emit socket event
        const io = req.app.get('io');
        if (io) {
            io.to(`conversation:${message.conversation.toString()}`).emit('messageDeleted', { messageId: id });
        }

        res.json({ message: 'Message deleted successfully' });
    } catch (error) {
        console.error('Delete Message Error:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Clear all messages in a conversation
// @route   DELETE /api/conversations/:id/messages
// @access  Private
const clearConversation = async (req, res) => {
    try {
        const { id } = req.params;

        const conversation = await Conversation.findById(id);
        if (!conversation) {
            return res.status(404).json({ message: 'Conversation not found' });
        }

        // Check if user is a participant
        const isParticipant = conversation.participants.some(
            p => p.user.toString() === req.user.id
        );
        if (!isParticipant) {
            return res.status(403).json({ message: 'Not authorized' });
        }

        // Delete all messages in the conversation
        await Message.deleteMany({ conversation: id });

        // Emit socket event
        const io = req.app.get('io');
        if (io) {
            io.to(`conversation:${id}`).emit('conversationCleared', { conversationId: id });
        }

        res.json({ message: 'Conversation cleared successfully' });
    } catch (error) {
        console.error('Clear Conversation Error:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Delete a conversation (remove from list)
// @route   DELETE /api/conversations/:id
// @access  Private
const deleteConversation = async (req, res) => {
    try {
        const { id } = req.params;

        const conversation = await Conversation.findById(id);
        if (!conversation) {
            return res.status(404).json({ message: 'Conversation not found' });
        }

        // Check if user is a participant
        const isParticipant = conversation.participants.some(
            p => p.user.toString() === req.user.id
        );
        if (!isParticipant) {
            return res.status(403).json({ message: 'Not authorized' });
        }

        // Deleting conversation for everyone (or just hiding it?)
        // If it's a channel/group and user is admin, delete it.
        // If it's direct, maybe just hide?
        // For now, let's implement strict delete for simplicity as requested "delete chat button".
        // A better approach is to remove the user from participants, but for direct chat, deleting it clears it for both? 
        // User request "delete chat button" usually implies "Delete Conversation".
        // Let's strictly delete it.

        await Message.deleteMany({ conversation: id });
        await Conversation.findByIdAndDelete(id);

        // Emit socket event
        const io = req.app.get('io');
        if (io) {
            io.to(`conversation:${id}`).emit('conversationDeleted', { conversationId: id });
        }

        res.json({ message: 'Conversation deleted successfully' });
    } catch (error) {
        console.error('Delete Conversation Error:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};

module.exports = {
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
};
