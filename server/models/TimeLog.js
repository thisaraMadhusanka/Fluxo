const mongoose = require('mongoose');

const timeLogSchema = new mongoose.Schema({
    task: { type: mongoose.Schema.Types.ObjectId, ref: 'Task', required: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    startTime: { type: Date, required: true },
    endTime: { type: Date },
    duration: { type: Number }, // in minutes
}, { timestamps: true });

module.exports = mongoose.model('TimeLog', timeLogSchema);
