const mongoose = require('mongoose');

const memberSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    workspace: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Workspace',
        required: true
    },
    role: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Role',
        required: true
    },
    joinedAt: {
        type: Date,
        default: Date.now
    },
    status: {
        type: String,
        enum: ['Active', 'Invited', 'Suspended'],
        default: 'Active'
    }
}, { timestamps: true });

// Ensure a user appears only once in a workspace
memberSchema.index({ user: 1, workspace: 1 }, { unique: true });

module.exports = mongoose.model('Member', memberSchema);
