const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String }, // Optional for Google Auth users
    avatar: { type: String },
    googleId: { type: String },
    role: {
        type: String,
        enum: ['Owner', 'Admin', 'Editor', 'Member', 'Viewer', 'Guest'],
        default: 'Member'
    },
    isApproved: {
        type: Boolean,
        default: false
    },
    privateWorkspaceId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Workspace'
    },
    lastActiveWorkspace: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Workspace'
    },
    position: {
        type: String,
        default: 'Team Member'
    },
    bio: {
        type: String,
        default: 'Fluxo project management team member'
    }
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
