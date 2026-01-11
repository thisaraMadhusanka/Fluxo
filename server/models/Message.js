const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
    conversation: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Conversation',
        required: true,
        index: true
    },
    sender: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    content: {
        type: String,
        trim: true
    },
    type: {
        type: String,
        enum: ['text', 'file', 'system', 'task'],
        default: 'text'
    },
    attachments: [{
        name: String,
        url: String,
        size: Number,
        mimeType: String
    }],
    reactions: [{
        emoji: String,
        users: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        }]
    }],
    replyTo: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Message'
    },
    taskReference: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Task'
    },
    editedAt: Date,
    deletedAt: Date,
    readBy: [{
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        readAt: {
            type: Date,
            default: Date.now
        }
    }]
}, {
    timestamps: true
});

// Indexes for performance
messageSchema.index({ conversation: 1, createdAt: -1 });
messageSchema.index({ conversation: 1, deletedAt: 1, createdAt: -1 });

// Virtual for checking if message is deleted
messageSchema.virtual('isDeleted').get(function () {
    return !!this.deletedAt;
});

// Method to check if user has read message
messageSchema.methods.isReadBy = function (userId) {
    return this.readBy.some(read => read.user.toString() === userId.toString());
};

// Don't return deleted messages by default
messageSchema.pre(/^find/, function (next) {
    if (!this.getOptions().includeDeleted) {
        this.where({ deletedAt: null });
    }
    next();
});

module.exports = mongoose.model('Message', messageSchema);
