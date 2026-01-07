const Project = require('../models/Project');

// Check if user can edit project
exports.canEditProject = async (req, res, next) => {
    try {
        const projectId = req.params.id || req.params.projectId;
        const project = await Project.findById(projectId);

        if (!project) {
            return res.status(404).json({ message: 'Project not found' });
        }

        // Owner always has full access
        if (project.owner.toString() === req.user.id) {
            req.project = project;
            return next();
        }

        // Check if user is a member with edit permissions
        const member = project.members.find(
            m => (m.user?._id || m.user).toString() === req.user.id
        );

        if (!member) {
            return res.status(403).json({
                message: 'You must be added to the project first'
            });
        }

        // Check specific permission or role
        // Owners (project level) always have edit permissions
        if (member.role === 'Owner' || member.role === 'Leader') {
            req.project = project;
            return next();
        }

        if (!member.permissions?.canEdit) {
            return res.status(403).json({
                message: 'You only have view access to this project'
            });
        }

        req.project = project;
        next();
    } catch (error) {
        console.error('Project permission check failed:', error);
        res.status(500).json({ message: 'Server error checking permissions' });
    }
};

// Check if user can view project
exports.canViewProject = async (req, res, next) => {
    try {
        const projectId = req.params.id || req.params.projectId;
        const project = await Project.findById(projectId);

        if (!project) {
            return res.status(404).json({ message: 'Project not found' });
        }

        // Workspace owner can always view (optional, but good for oversight)
        if (req.workspace.owner.toString() === req.user.id) {
            req.project = project;
            return next();
        }

        // Check if user is project member OR workspace member (depending on standard privacy)
        // Requirement: "other members cant edit its project before he added , only they can watch"
        // This implies workspace members can WATCH (View) but not Edit.

        // So we just check if they are in the workspace (which is already checked by authWorkspace usually)
        // But to be safe, valid workspace membership is enough for View Only?
        // User said: "only they can watch"

        // If the route assumes `active workspace`, and `authWorkspace` middleware is used, 
        // then `req.workspace` is set. 

        // We ensure the project belongs to the current workspace
        if (project.workspace.toString() !== req.workspace._id.toString()) {
            return res.status(404).json({ message: 'Project not found in this workspace' });
        }

        req.project = project;
        next();
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
