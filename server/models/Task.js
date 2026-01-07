const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String },
    status: {
        type: String,
        enum: ['To Do', 'In Progress', 'In Review', 'Done'],
        default: 'To Do'
    },
    priority: {
        type: String,
        enum: ['Low', 'Medium', 'High', 'Urgent'],
        default: 'Medium'
    },
    dueDate: { type: Date },
    startDate: { type: Date },
    project: { type: mongoose.Schema.Types.ObjectId, ref: 'Project' },
    workspace: { type: mongoose.Schema.Types.ObjectId, ref: 'Workspace', required: true },
    assignees: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    columnOrder: { type: Number, default: 0 }, // For Kanban ordering

    // Advanced Features
    parentTask: { type: mongoose.Schema.Types.ObjectId, ref: 'Task', default: null },
    subtasks: [{
        title: String,
        completed: { type: Boolean, default: false }
    }],
    attachments: [{
        name: String,
        url: String,
        type: String,
        uploadedAt: { type: Date, default: Date.now }
    }],
    timeLogs: [{
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        startTime: Date,
        endTime: Date,
        duration: Number, // in seconds
        description: String
    }],
    comments: [{
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        text: String,
        createdAt: { type: Date, default: Date.now }
    }],
    // Time Tracking
    timeEstimate: { type: Number, default: 0 }, // in hours
    timeSpent: { type: Number, default: 0 }, // in hours (aggregated or manual)
    timerStartTime: { type: Date, default: null }, // For active tracking across sessions

    totalTimeSpent: { type: Number, default: 0 }, // Legacy: in seconds to match timeLogs
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

module.exports = mongoose.model('Task', taskSchema);
