const Project = require('../models/Project');
const { createNotification } = require('./notificationController');

// Get all projects for current workspace
exports.getProjects = async (req, res) => {
    try {
        const Task = require('../models/Task');

        // Use aggregation to get projects with task counts for progress
        const projects = await Project.aggregate([
            { $match: { workspace: req.workspace._id } },
            {
                $lookup: {
                    from: 'tasks',
                    localField: '_id',
                    foreignField: 'project',
                    as: 'projectTasks'
                }
            },
            {
                $addFields: {
                    totalTasks: { $size: '$projectTasks' },
                    completedTasks: {
                        $size: {
                            $filter: {
                                input: '$projectTasks',
                                as: 'task',
                                cond: { $eq: ['$$task.status', 'Done'] }
                            }
                        }
                    }
                }
            },
            { $project: { projectTasks: 0 } }
        ]);

        // Populate members and owner manually after aggregation
        await Project.populate(projects, [
            { path: 'members.user', select: 'name avatar email' },
            { path: 'owner', select: 'name' }
        ]);

        res.json(projects);
    } catch (error) {
        console.error('GetProjects Error:', error);
        res.status(500).json({ message: error.message });
    }
};

// Get single project
exports.getProjectById = async (req, res) => {
    try {
        const project = await Project.findById(req.params.id)
            .populate('members.user', 'name avatar email')
            .populate('owner', 'name');

        if (!project) return res.status(404).json({ message: 'Project not found' });
        res.json(project);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Create a new project
exports.createProject = async (req, res) => {
    const { title, description, deadline, budget, status } = req.body;
    try {
        const project = await Project.create({
            title,
            description,
            deadline,
            budget,
            status,
            workspace: req.workspace._id,
            owner: req.user.id,
            members: [{
                user: req.user.id,
                role: 'Owner',
                permissions: {
                    canEdit: true,
                    canDelete: true,
                    canManageMembers: true,
                    canViewOnly: false
                }
            }] // Add creator as Owner
        });
        res.status(201).json(project);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Update project
exports.updateProject = async (req, res) => {
    try {
        const project = await Project.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json(project);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Delete project
exports.deleteProject = async (req, res) => {
    try {
        await Project.findByIdAndDelete(req.params.id);
        res.json({ message: 'Project deleted' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


// Add Member
exports.addMember = async (req, res) => {
    const { userId, role } = req.body;
    console.log(`[AddMember] Request for project ${req.params.id}, User: ${userId}, Role: ${role}`);

    try {
        const project = await Project.findById(req.params.id);
        if (!project) {
            console.log('[AddMember] Project not found');
            return res.status(404).json({ message: 'Project not found' });
        }

        // Check for duplicate
        const isDuplicate = project.members.some(m => {
            const memberId = m.user ? m.user.toString() : m.toString();
            return memberId === userId;
        });

        if (isDuplicate) {
            console.log('[AddMember] User already in project');
            return res.status(400).json({ message: 'User already in project' });
        }

        project.members.push({ user: userId, role: role || 'Member' });
        await project.save();

        await project.populate('members.user', 'name avatar email');

        // Notify new member
        if (userId !== req.user.id) {
            try {
                await createNotification({
                    userId: userId,
                    type: 'success',
                    title: 'Added to Project',
                    message: `You were added to project "${project.title}" as ${role || 'Member'}`,
                    link: `/projects/${project._id}`,
                    metadata: { projectId: project._id }
                });
            } catch (notifError) {
                console.error('[AddMember] Notification failed (non-blocking):', notifError);
            }
        }

        res.json(project);
    } catch (error) {
        console.error('[AddMember] Error:', error);
        res.status(400).json({ message: error.message });
    }
};

// Update Member Role
exports.updateMemberRole = async (req, res) => {
    const { role } = req.body;
    try {
        const project = await Project.findOneAndUpdate(
            { _id: req.params.id, "members.user": req.params.userId },
            { $set: { "members.$.role": role } },
            { new: true }
        ).populate('members.user', 'name avatar email');

        if (!project) return res.status(404).json({ message: 'Project or member not found' });
        res.json(project);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Remove Member
exports.removeMember = async (req, res) => {
    try {
        const project = await Project.findByIdAndUpdate(
            req.params.id,
            { $pull: { members: { user: req.params.userId } } },
            { new: true }
        ).populate('members.user', 'name avatar email');

        res.json(project);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};
