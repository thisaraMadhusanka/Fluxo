const mongoose = require('mongoose');

const conversationSchema = new mongoose.Schema({
    type: {
        type: String,
        enum: ['direct', 'group', 'channel'],
        required: true
    },
    name: {
        type: String,
        trim: true
    },
    description: {
        type: String,
        trim: true
    },
    participants: [{
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        role: {
            type: String,
            enum: ['admin', 'member'],
            default: 'member'
        },
        joinedAt: {
            type: Date,
            default: Date.now
        },
        lastRead: {
            type: Date,
            default: Date.now
        },
        unreadCount: {
            type: Number,
            default: 0
        }
    }],
    workspace: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Workspace'
    },
    project: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Project'
    },
    isPrivate: {
        type: Boolean,
        default: true
    },
    pinnedMessages: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Message'
    }],
    lastMessage: {
        content: String,
        sender: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        timestamp: Date
    },
    archivedBy: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
}, {
    timestamps: true
});

// Indexes
conversationSchema.index({ 'participants.user': 1 });
conversationSchema.index({ workspace: 1, type: 1 });
conversationSchema.index({ project: 1 });
conversationSchema.index({ type: 1, isPrivate: 1 });

// Virtual to get participant count
conversationSchema.virtual('participantCount').get(function () {
    return this.participants.length;
});

// Method to check if user is participant
conversationSchema.methods.isParticipant = function (userId) {
    return this.participants.some(p => p.user && p.user.toString() === userId.toString());
};

// Method to get participant object for a user
conversationSchema.methods.getParticipant = function (userId) {
    return this.participants.find(p => p.user && p.user.toString() === userId.toString());
};

// Method to increment unread count for all participants except sender
conversationSchema.methods.incrementUnreadCount = function (senderId) {
    this.participants.forEach(participant => {
        if (participant.user && participant.user.toString() !== senderId.toString()) {
            participant.unreadCount += 1;
        }
    });
};

// Static method to find or create direct conversation
conversationSchema.statics.findOrCreateDirect = async function (user1Id, user2Id) {
    // Find existing direct conversation between these two users
    let conversation = await this.findOne({
        type: 'direct',
        'participants.user': { $all: [user1Id, user2Id] },
        $expr: { $eq: [{ $size: '$participants' }, 2] }
    });

    if (!conversation) {
        // Create new direct conversation
        conversation = await this.create({
            type: 'direct',
            participants: [
                { user: user1Id, role: 'member' },
                { user: user2Id, role: 'member' }
            ],
            createdBy: user1Id,
            isPrivate: true
        });
    }

    return conversation;
};

module.exports = mongoose.model('Conversation', conversationSchema);
