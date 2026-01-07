const Project = require('../models/Project');
const Task = require('../models/Task');

// Get all projects for current user
exports.getProjects = async (req, res) => {
    try {
        // Only return projects where the user is a member
        const projects = await Project.find({
            members: req.user.id
        }).populate('members', 'name email avatar');

        // Add task counts to each project
        const projectsWithCounts = await Promise.all(projects.map(async (project) => {
            const taskCount = await Task.countDocuments({ projectId: project._id });
            const completedCount = await Task.countDocuments({ projectId: project._id, status: 'Done' });
            return {
                ...project._doc,
                taskCount,
                completedCount,
                progress: taskCount > 0 ? Math.round((completedCount / taskCount) * 100) : 0
            };
        }));

        res.json(projectsWithCounts);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

// Join project with token
exports.joinProject = async (req, res) => {
    try {
        const { token } = req.body;
        const project = await Project.findOne({ token });

        if (!project) {
            return res.status(404).json({ msg: 'Invalid token or project not found' });
        }

        // Check if user is already a member
        if (project.members.includes(req.user.id)) {
            return res.status(400).json({ msg: 'Already a member of this project' });
        }

        project.members.push(req.user.id);
        await project.save();

        res.json(project);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

// Create project
exports.createProject = async (req, res) => {
    try {
        const { title, description, deadline } = req.body;

        // Generate a random 6-character alphanumeric token
        const token = Math.random().toString(36).substring(2, 8).toUpperCase();

        const newProject = new Project({
            title,
            description,
            deadline,
            token,
            createdBy: req.user.id,
            members: [req.user.id] // Initially, creator is the only member
        });
        const project = await newProject.save();
        res.json(project);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

// Get single project
exports.getProject = async (req, res) => {
    try {
        const project = await Project.findById(req.params.id).populate('members', 'name email avatar');
        if (!project) return res.status(404).json({ msg: 'Project not found' });

        // Security: Check if user is a member
        if (!project.members.some(member => member._id.toString() === req.user.id)) {
            return res.status(403).json({ msg: 'Not authorized to view this project' });
        }

        res.json(project);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

// Update project
exports.updateProject = async (req, res) => {
    try {
        const { title, description, deadline } = req.body;
        let project = await Project.findById(req.params.id);

        if (!project) return res.status(404).json({ msg: 'Project not found' });

        // Security: Only creator can update
        if (project.createdBy.toString() !== req.user.id) {
            return res.status(403).json({ msg: 'Not authorized to update this project' });
        }

        project.title = title || project.title;
        project.description = description || project.description;
        project.deadline = deadline || project.deadline;

        await project.save();
        res.json(project);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

// Delete project
exports.deleteProject = async (req, res) => {
    try {
        const project = await Project.findById(req.params.id);
        if (!project) return res.status(404).json({ msg: 'Project not found' });

        // Security: Only creator can delete
        if (project.createdBy.toString() !== req.user.id) {
            return res.status(403).json({ msg: 'Not authorized to delete this project' });
        }

        await Project.findByIdAndDelete(req.params.id);
        // Also delete associated tasks
        await Task.deleteMany({ projectId: req.params.id });

        res.json({ msg: 'Project and its tasks removed' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};
