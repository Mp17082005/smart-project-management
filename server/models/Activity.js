const mongoose = require('mongoose');

const activitySchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    projectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Project' },
    taskId: { type: mongoose.Schema.Types.ObjectId, ref: 'Task' },
    action: { type: String, required: true }, // e.g., "created task", "changed status"
    details: { type: String },
}, { timestamps: true });

module.exports = mongoose.model('Activity', activitySchema);
