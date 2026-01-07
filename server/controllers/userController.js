const User = require('../models/User');

const Project = require('../models/Project');
const Task = require('../models/Task');

// Get all users
exports.getUsers = async (req, res) => {
    try {
        const users = await User.find().select('-password');
        res.json(users);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

// Get current user
exports.getCurrentUser = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password');
        res.json(user);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

// Update current user (profile)
exports.updateCurrentUser = async (req, res) => {
    try {
        const { name, email, avatar } = req.body;

        const updates = {};
        if (typeof name === 'string') updates.name = name;
        if (typeof email === 'string') updates.email = email;
        if (typeof avatar === 'string') updates.avatar = avatar;

        const user = await User.findByIdAndUpdate(
            req.user.id,
            updates,
            { new: true, runValidators: true }
        ).select('-password');

        res.json(user);
    } catch (err) {
        // Duplicate email
        if (err && err.code === 11000) {
            return res.status(400).json({ msg: 'Email already in use' });
        }
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

// Get user stats
exports.getUserStats = async (req, res) => {
    try {
        const projectCount = await Project.countDocuments({ members: req.user.id });
        const taskCount = await Task.countDocuments({ assignedTo: req.user.id });
        const completedTasks = await Task.countDocuments({ assignedTo: req.user.id, status: 'Done' });

        res.json({
            projects: projectCount,
            tasks: taskCount,
            completedTasks
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

// Update user role
exports.updateUserRole = async (req, res) => {
    try {
        const { role } = req.body;
        const user = await User.findByIdAndUpdate(req.params.id, { role }, { new: true });
        res.json(user);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};
