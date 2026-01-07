const Activity = require('../models/Activity');

// Get all activity for current user (notifications)
exports.getActivity = async (req, res) => {
    try {
        const activities = await Activity.find({ userId: req.user.id })
            .populate('userId', 'name avatar email')
            .populate('projectId', 'title')
            .populate('taskId', 'title')
            .sort({ createdAt: -1 })
            .limit(50);
        res.json(activities);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

// Get project activity
exports.getProjectActivity = async (req, res) => {
    try {
        const activities = await Activity.find({ projectId: req.params.projectId })
            .populate('userId', 'name avatar email')
            .populate('taskId', 'title')
            .sort({ createdAt: -1 });
        res.json(activities);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

// Get global stats
exports.getStats = async (req, res) => {
    try {
        const totalUsers = await require('../models/User').countDocuments();
        const totalProjects = await require('../models/Project').countDocuments();
        const totalTasks = await require('../models/Task').countDocuments();

        const tasksByStatus = await require('../models/Task').aggregate([
            { $group: { _id: '$status', count: { $sum: 1 } } }
        ]);

        res.json({
            totalUsers,
            totalProjects,
            totalTasks,
            tasksByStatus
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};
