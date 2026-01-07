const Task = require('../models/Task');
const Activity = require('../models/Activity');
const User = require('../models/User');
const Project = require('../models/Project');

// Get tasks
exports.getTasks = async (req, res) => {
    try {
        let query = {};

        // Find projects where the user is a member
        const userProjects = await Project.find({ members: req.user.id }).select('_id');
        const projectIds = userProjects.map(p => p._id);

        if (req.params.projectId !== 'all') {
            // Security: Check if user is member of the specific project
            if (!projectIds.some(id => id.toString() === req.params.projectId)) {
                return res.status(403).json({ msg: 'Not authorized to view tasks for this project' });
            }
            query.projectId = req.params.projectId;
        } else {
            // If fetching 'all', only return tasks from projects the user is a member of
            query.projectId = { $in: projectIds };
        }

        const tasks = await Task.find(query)
            .populate('assignedTo', 'name email avatar')
            .populate('createdBy', 'name email avatar')
            .populate('projectId', 'title createdBy');
        res.json(tasks);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

// Create task
exports.createTask = async (req, res) => {
    try {
        const { title, description, assignedToEmail, priority, dueDate, projectId } = req.body;

        // Security: Check if user is member of project
        const project = await Project.findById(projectId);
        if (!project) return res.status(404).json({ msg: 'Project not found' });
        if (!project.members.includes(req.user.id)) {
            return res.status(403).json({ msg: 'Not authorized to create tasks in this project' });
        }

        let assignedTo = null;
        if (assignedToEmail) {
            let user = await User.findOne({ email: assignedToEmail });
            if (!user) {
                user = new User({
                    name: assignedToEmail.split('@')[0],
                    email: assignedToEmail,
                    role: 'Member'
                });
                await user.save();
            }
            assignedTo = user._id;
        }

        const newTask = new Task({
            title,
            description,
            assignedTo,
            priority,
            dueDate,
            projectId,
            createdBy: req.user.id
        });

        const task = await newTask.save();
        const currentTime = new Date().toLocaleTimeString();

        // Log activity & Send Notification to Lead/Project Owner (optional, but keep for history)
        const activity = new Activity({
            userId: req.user.id,
            projectId,
            taskId: task._id,
            action: 'task created',
            details: `Created task "${title}"`
        });
        await activity.save();

        // Socket Notification for assigned user
        const io = req.app.get('io');
        if (assignedTo && assignedTo.toString() !== req.user.id) {
            const assigner = await User.findById(req.user.id);
            const notificationDetails = `${assigner.name} assigned you a new task: "${title}" at ${currentTime}`;

            // Save as Activity for the assigned user to see in their bell icon
            const assignedActivity = new Activity({
                userId: assignedTo,
                projectId,
                taskId: task._id,
                action: 'task assigned',
                details: notificationDetails
            });
            await assignedActivity.save();

            io.to(assignedTo.toString()).emit('notification', {
                type: 'TASK_ASSIGNED',
                details: notificationDetails,
                taskId: task._id
            });
        }

        res.json(task);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

// Update task status
exports.updateTaskStatus = async (req, res) => {
    try {
        const { status } = req.body;
        const task = await Task.findById(req.params.id).populate('projectId');
        if (!task) return res.status(404).json({ msg: 'Task not found' });

        const project = task.projectId;
        const isProjectOwner = project.createdBy.toString() === req.user.id;
        const isCreator = task.createdBy.toString() === req.user.id;
        const isAssignee = task.assignedTo && task.assignedTo.toString() === req.user.id;

        // Security: status can be edited by the lead (project owner/creator) and assigned person
        if (!isProjectOwner && !isCreator && !isAssignee) {
            return res.status(403).json({ msg: 'Not authorized to update this task status' });
        }

        const oldStatus = task.status;
        task.status = status;
        await task.save();

        const currentTime = new Date().toLocaleTimeString();
        const updater = await User.findById(req.user.id);

        // Log activity
        const detailMessage = `${updater.name} changed status of "${task.title}" to ${status} at ${currentTime}`;
        const activity = new Activity({
            userId: req.user.id,
            projectId: task.projectId._id,
            taskId: task._id,
            action: 'status changed',
            details: detailMessage
        });
        await activity.save();

        // Notification to project owner if updated by assignee
        const io = req.app.get('io');
        if (isAssignee && !isProjectOwner) {
            const ownerNotification = new Activity({
                userId: project.createdBy,
                projectId: task.projectId._id,
                taskId: task._id,
                action: 'status updated',
                details: detailMessage
            });
            await ownerNotification.save();

            io.to(project.createdBy.toString()).emit('notification', {
                type: 'TASK_STATUS_UPDATED',
                details: detailMessage,
                taskId: task._id
            });
        }

        res.json(task);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

// Update task details
exports.updateTask = async (req, res) => {
    try {
        const { title, description, priority, dueDate, status } = req.body;
        const task = await Task.findById(req.params.id).populate('projectId');
        if (!task) return res.status(404).json({ msg: 'Task not found' });

        const isProjectOwner = task.projectId.createdBy.toString() === req.user.id;
        const isCreator = task.createdBy.toString() === req.user.id;
        const isAssignee = task.assignedTo && task.assignedTo.toString() === req.user.id;

        if (!isProjectOwner && !isCreator && !isAssignee) {
            return res.status(403).json({ msg: 'Not authorized to edit this task' });
        }

        task.title = title || task.title;
        task.description = description || task.description;
        task.priority = priority || task.priority;
        task.dueDate = dueDate || task.dueDate;
        task.status = status || task.status;

        await task.save();
        res.json(task);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

// Delete task
exports.deleteTask = async (req, res) => {
    try {
        const task = await Task.findById(req.params.id);
        if (!task) return res.status(404).json({ msg: 'Task not found' });

        // Security: deletion is possible only by the person who created the task
        if (task.createdBy.toString() !== req.user.id) {
            return res.status(403).json({ msg: 'Only the task creator can delete this task' });
        }

        await Task.findByIdAndDelete(req.params.id);
        res.json({ msg: 'Task removed' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};
