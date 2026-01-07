const mongoose = require('mongoose');

const roleSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    workspace: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Workspace',
        required: true
    },
    description: String,
    permissions: [{
        type: String,
        // E.g., 'create_project', 'delete_task', 'view_analytics', 'manage_members'
    }],
    isSystem: {
        type: Boolean,
        default: false // System roles cannot be deleted
    }
}, { timestamps: true });

// Compound index to ensure role names are unique within a workspace
roleSchema.index({ workspace: 1, name: 1 }, { unique: true });

module.exports = mongoose.model('Role', roleSchema);
