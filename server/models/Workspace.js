const mongoose = require('mongoose');

const workspaceSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    isPrivate: {
        type: Boolean,
        default: false
    },
    canAddMembers: {
        type: Boolean,
        default: true
    },
    members: [{
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        role: {
            type: String,
            enum: ['Owner', 'Admin', 'Member'],
            default: 'Member'
        },
        permissions: {
            canManageSettings: { type: Boolean, default: false },
            canManageMembers: { type: Boolean, default: false },
            canDeleteWorkspace: { type: Boolean, default: false }
        },
        joinedAt: { type: Date, default: Date.now }
    }],
    inviteCode: {
        type: String,
        unique: true,
        sparse: true
    },
    settings: {
        theme: { type: String, default: 'light' },
        allowGuestInvites: { type: Boolean, default: false },
        allowMemberInvites: { type: Boolean, default: true },
        requireApprovalForProjects: { type: Boolean, default: false }
    }
}, { timestamps: true });



module.exports = mongoose.model('Workspace', workspaceSchema);
