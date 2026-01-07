const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String },
    members: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    deadline: { type: Date },
    token: { type: String, unique: true, required: true },
    isArchived: { type: Boolean, default: false },
}, { timestamps: true });

module.exports = mongoose.model('Project', projectSchema);
