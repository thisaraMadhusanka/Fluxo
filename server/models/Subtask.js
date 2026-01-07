const mongoose = require('mongoose');

const subtaskSchema = new mongoose.Schema({
    title: { type: String, required: true },
    isCompleted: { type: Boolean, default: false },
    task: { type: mongoose.Schema.Types.ObjectId, ref: 'Task', required: true },
}, { timestamps: true });

module.exports = mongoose.model('Subtask', subtaskSchema);
