const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String },
    icon: { type: String, default: '📁' },
    color: { type: String, default: '#3b82f6' }, // Default blue
    status: {
        type: String,
        enum: ['Active', 'Completed', 'On Hold', 'Archived'],
        default: 'Active'
    },
    deadline: { type: Date },
    budget: { type: Number },
    workspace: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Workspace',
        required: true
    },
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    members: [{
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        role: {
            type: String,
            enum: ['Owner', 'Leader', 'Developer', 'Designer', 'QA', 'Member', 'Viewer'],
            default: 'Member'
        },
        permissions: {
            canEdit: { type: Boolean, default: false },
            canDelete: { type: Boolean, default: false },
            canManageMembers: { type: Boolean, default: false },
            canViewOnly: { type: Boolean, default: true }
        },
        joinedAt: { type: Date, default: Date.now }
    }],
    views: [
        {
            type: {
                type: String,
                enum: ['board', 'table', 'calendar', 'gantt', 'timeline'],
                required: true
            },
            name: { type: String, required: true },
            id: { type: String, required: true } // Unique ID for the view tab
        }
    ],
    defaultView: { type: String, default: 'board' }
}, { timestamps: true });

module.exports = mongoose.model('Project', projectSchema);
