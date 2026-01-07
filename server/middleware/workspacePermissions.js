// Only workspace owner
exports.isWorkspaceOwner = async (req, res, next) => {
    if (!req.workspace) {
        return res.status(500).json({ message: 'Workspace context missing' });
    }

    if (req.workspace.owner.toString() !== req.user.id) {
        return res.status(403).json({
            message: 'Only workspace owner can perform this action'
        });
    }
    next();
};

// Owner or Admin
exports.canManageWorkspace = async (req, res, next) => {
    if (!req.workspace) {
        return res.status(500).json({ message: 'Workspace context missing' });
    }

    const isOwner = req.workspace.owner.toString() === req.user.id;

    const member = req.workspace.members.find(
        m => (m.user?._id || m.user).toString() === req.user.id
    );

    // Check role inside member object or if the member object itself has role property structure
    // Schema: members: [{ user, role, permissions }]
    const isAdmin = member?.role === 'Admin';

    if (!isOwner && !isAdmin) {
        return res.status(403).json({
            message: 'Only workspace owner or admin can manage workspace'
        });
    }

    next();
};
