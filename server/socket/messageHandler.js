const Message = require('../models/Message');
const Conversation = require('../models/Conversation');
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const notificationController = require('../controllers/notificationController');

// Store connected users
const connectedUsers = new Map(); // userId -> socketId

const initializeSocket = (io) => {
    // Authentication middleware for Socket.IO
    io.use(async (socket, next) => {
        try {
            const token = socket.handshake.auth.token;

            if (!token) {
                console.error('❌ Socket Auth Error: No token provided');
                return next(new Error('Authentication error'));
            }

            console.log('🔐 Socket Auth: Verifying token...');
            const decoded = jwt.verify(token, process.env.APP_SECRET);
            // Get user from DB to check status
            const user = await User.findById(decoded.id).select('isApproved');

            if (!user) {
                console.error('❌ Socket Auth Error: User not found');
                return next(new Error('User not found'));
            }

            if (!user.isApproved) {
                console.error('❌ Socket Auth Error: Account pending approval');
                return next(new Error('Account pending approval'));
            }

            socket.userId = decoded.id;
            console.log('✅ Socket Auth: Token verified for user:', socket.userId);
            next();
        } catch (error) {
            console.error('❌ Socket Auth Error: Token verification failed:', error.message);
            next(new Error('Authentication error'));
        }
    });

    io.on('connection', (socket) => {
        console.log(`User connected: ${socket.userId}`);

        // Store user's socket ID
        connectedUsers.set(socket.userId, socket.id);

        // Broadcast user online status
        socket.broadcast.emit('user:online', {
            userId: socket.userId,
            timestamp: new Date()
        });

        // Join user's personal room for direct messages
        socket.join(`user:${socket.userId}`);

        // Join conversation rooms
        socket.on('conversation:join', async (conversationId) => {
            try {
                const conversation = await Conversation.findById(conversationId);
                if (conversation && conversation.isParticipant(socket.userId)) {
                    socket.join(`conversation:${conversationId}`);
                    console.log(`📡 Socket ${socket.id} (User ${socket.userId}) JOINED room: conversation:${conversationId}`);
                } else {
                    console.warn(`⚠️ User ${socket.userId} attempted to join unauthorized room: conversation:${conversationId}`);
                }
            } catch (error) {
                console.error('❌ Error joining conversation room:', error);
            }
        });

        // Leave conversation room
        socket.on('conversation:leave', (conversationId) => {
            socket.leave(`conversation:${conversationId}`);
            console.log(`📡 Socket ${socket.id} (User ${socket.userId}) LEFT room: conversation:${conversationId}`);
        });

        // Handle new message
        socket.on('message:send', async (data) => {
            console.log(`📩 Received message:send from ${socket.userId}:`, data);
            try {
                const { conversationId, content, type, replyTo, attachments } = data;

                // Verify conversation and permissions
                const conversation = await Conversation.findById(conversationId);
                if (!conversation || !conversation.isParticipant(socket.userId)) {
                    console.warn(`⚠️ Unauthorized message attempt by ${socket.userId} for conversation ${conversationId}`);
                    return socket.emit('error', { message: 'Unauthorized' });
                }

                // Create message
                const message = await Message.create({
                    conversation: conversationId,
                    sender: socket.userId,
                    content,
                    type: type || 'text',
                    replyTo,
                    attachments: attachments || []
                });

                // Update conversation
                conversation.lastMessage = {
                    content: content || 'Sent an attachment',
                    sender: socket.userId,
                    timestamp: new Date()
                };
                conversation.incrementUnreadCount(socket.userId);
                await conversation.save();

                // Populate message
                await message.populate('sender', 'name email avatar');
                if (replyTo) {
                    await message.populate('replyTo', 'content sender');
                }

                // Broadcast to all participants in the conversation
                console.log(`📢 Broadcasting message:new to room conversation:${conversationId}`);
                io.to(`conversation:${conversationId}`).emit('message:new', message);

                // Filter recipients (exclude sender)
                const recipients = conversation.participants.filter(
                    p => p.user.toString() !== socket.userId.toString()
                );

                // Create persistent notifications for other participants
                console.log(`🔔 Creating notifications for ${recipients.length} recipients`);

                for (const recipient of recipients) {
                    const recipientId = recipient.user.toString();
                    console.log(`🔔 Processing notification for recipient: ${recipientId}`);

                    await notificationController.createNotification({
                        userId: recipientId,
                        type: 'message',
                        title: message.sender.name,
                        message: 'has sent you a new message',
                        link: `/messages/${conversationId}`,
                        metadata: {
                            conversationId: conversationId,
                            messageId: message._id,
                            senderId: socket.userId
                        }
                    });

                    // Also emit a specific notification event to the user's personal room
                    console.log(`🔔 Emitting notification:new to user:${recipientId}`);
                    io.to(`user:${recipientId}`).emit('notification:new', {
                        title: message.sender.name,
                        message: 'has sent you a new message',
                        conversationId
                    });
                }

                // Send delivery confirmation to sender
                socket.emit('message:sent', { tempId: data.tempId, message });
            } catch (error) {
                console.error('❌ Send message error:', error);
                socket.emit('error', { message: 'Failed to send message' });
            }
        });

        // Handle typing indicator
        socket.on('typing:start', ({ conversationId }) => {
            socket.to(`conversation:${conversationId}`).emit('typing:start', {
                userId: socket.userId,
                conversationId
            });
        });

        socket.on('typing:stop', ({ conversationId }) => {
            socket.to(`conversation:${conversationId}`).emit('typing:stop', {
                userId: socket.userId,
                conversationId
            });
        });

        // Handle message read
        socket.on('message:read', async ({ conversationId, messageId }) => {
            try {
                const message = await Message.findById(messageId);
                if (message && !message.isReadBy(socket.userId)) {
                    message.readBy.push({
                        user: socket.userId,
                        readAt: new Date()
                    });
                    await message.save();

                    // Notify sender
                    io.to(`conversation:${conversationId}`).emit('message:read', {
                        messageId,
                        userId: socket.userId,
                        readAt: new Date()
                    });
                }
            } catch (error) {
                console.error('Mark as read error:', error);
            }
        });

        // Handle reaction
        socket.on('message:react', async ({ messageId, emoji, action }) => {
            try {
                const message = await Message.findById(messageId);
                if (!message) return;

                if (action === 'add') {
                    const existingReaction = message.reactions.find(r => r.emoji === emoji);
                    if (existingReaction) {
                        if (!existingReaction.users.includes(socket.userId)) {
                            existingReaction.users.push(socket.userId);
                        }
                    } else {
                        message.reactions.push({ emoji, users: [socket.userId] });
                    }
                } else if (action === 'remove') {
                    const reaction = message.reactions.find(r => r.emoji === emoji);
                    if (reaction) {
                        reaction.users = reaction.users.filter(
                            id => id.toString() !== socket.userId.toString()
                        );
                        if (reaction.users.length === 0) {
                            message.reactions = message.reactions.filter(r => r.emoji !== emoji);
                        }
                    }
                }

                await message.save();
                await message.populate('reactions.users', 'name');

                // Broadcast reaction update
                io.to(`conversation:${message.conversation}`).emit('message:reaction', {
                    messageId,
                    reactions: message.reactions
                });
            } catch (error) {
                console.error('Reaction error:', error);
            }
        });

        // Handle disconnect
        // Handle message reactions
        socket.on('reactToMessage', async ({ messageId, emoji, action }) => {
            try {
                console.log(`[Socket] React to message: ${messageId}, emoji: ${emoji}, action: ${action}`);

                const message = await Message.findById(messageId);
                if (!message) return;

                if (action === 'add') {
                    const existingReaction = message.reactions.find(r => r.emoji === emoji);
                    if (existingReaction) {
                        if (!existingReaction.users.includes(socket.userId)) {
                            existingReaction.users.push(socket.userId);
                        }
                    } else {
                        message.reactions.push({ emoji, users: [socket.userId] });
                    }
                } else if (action === 'remove') {
                    const reaction = message.reactions.find(r => r.emoji === emoji);
                    if (reaction) {
                        reaction.users = reaction.users.filter(
                            userId => userId.toString() !== socket.userId.toString()
                        );
                        if (reaction.users.length === 0) {
                            message.reactions = message.reactions.filter(r => r.emoji !== emoji);
                        }
                    }
                }

                await message.save();
                await message.populate('sender', 'name avatar');
                await message.populate('reactions.users', 'name avatar');

                // Emit to all users in the conversation
                io.to(message.conversation.toString()).emit('messageReacted', message);
            } catch (error) {
                console.error('[Socket] React to message error:', error);
            }
        });

        // Handle message deletion
        socket.on('deleteMessage', async ({ messageId }) => {
            try {
                console.log(`[Socket] Delete message: ${messageId}`);

                const message = await Message.findById(messageId);
                if (!message) return;

                // Check if user is the sender
                if (message.sender.toString() !== socket.userId) {
                    return socket.emit('error', { message: 'Not authorized' });
                }

                const conversationId = message.conversation.toString();
                await message.deleteOne();

                // Emit to all users in the conversation
                io.to(`conversation:${conversationId}`).emit('messageDeleted', { messageId });
            } catch (error) {
                console.error('[Socket] Delete message error:', error);
            }
        });

        // Handle conversation clear
        socket.on('clearConversation', async ({ conversationId }) => {
            try {
                console.log(`[Socket] Clear conversation: ${conversationId}`);

                // Delete all messages
                await Message.deleteMany({ conversation: conversationId });

                // Emit to all users in the conversation
                io.to(`conversation:${conversationId}`).emit('conversationCleared', { conversationId });
            } catch (error) {
                console.error('[Socket] Clear conversation error:', error);
            }
        });

        // Existing disconnect handler
        socket.on('disconnect', () => {
            console.log(`User disconnected: ${socket.userId}`);
            connectedUsers.delete(socket.userId);

            // Broadcast user offline status
            socket.broadcast.emit('user:offline', {
                userId: socket.userId,
                timestamp: new Date()
            });
        });
    });

    return io;
};

// Helper function to check if user is online
const isUserOnline = (userId) => {
    return connectedUsers.has(userId);
};

// Helper function to get user's socket ID
const getUserSocketId = (userId) => {
    return connectedUsers.get(userId);
};

module.exports = {
    initializeSocket,
    isUserOnline,
    getUserSocketId
};
