const jwt = require('jsonwebtoken');
const Member = require('../models/Member');
const Workspace = require('../models/Workspace');
const Role = require('../models/Role');

const authWorkspace = async (req, res, next) => {
    try {
        // 1. Get workspaceId from params or header
        const workspaceId = req.params.workspaceId || req.header('X-Workspace-ID') || req.body.workspaceId;

        if (!workspaceId) {
            return res.status(400).json({ message: 'Workspace ID is required' });
        }

        // 2. Verify Membership
        const member = await Member.findOne({
            user: req.user.id,
            workspace: workspaceId
        }).populate('role');

        if (!member) {
            return res.status(403).json({ message: 'Access denied. You are not a member of this workspace.' });
        }

        if (member.status === 'Suspended') {
            return res.status(403).json({ message: 'Your access to this workspace has been suspended.' });
        }

        // 3. Fetch and validate workspace exists
        const workspace = await Workspace.findById(workspaceId);

        if (!workspace) {
            return res.status(404).json({ message: 'Workspace not found or has been deleted' });
        }

        // 4. Attach to request
        req.workspace = workspace;
        req.member = member;
        req.workspaceRole = member.role;

        next();
    } catch (error) {
        console.error('Workspace Auth Error:', error);
        res.status(500).json({ message: 'Server error authorizing workspace access' });
    }
};

module.exports = authWorkspace;
