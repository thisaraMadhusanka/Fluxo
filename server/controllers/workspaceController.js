const Workspace = require('../models/Workspace');
const Member = require('../models/Member');
const Role = require('../models/Role');
const Task = require('../models/Task');
const Project = require('../models/Project');
const emailService = require('../services/emailService');
const crypto = require('crypto');

// Helper to create default roles
const createDefaultRoles = async (workspaceId) => {
    const roles = [
        {
            name: 'Owner',
            workspace: workspaceId,
            permissions: ['*'], // All permissions
            isSystem: true
        },
        {
            name: 'Admin',
            workspace: workspaceId,
            permissions: ['create_project', 'delete_project', 'manage_members', 'view_analytics', 'manage_tasks'],
            isSystem: true
        },
        {
            name: 'Member',
            workspace: workspaceId,
            permissions: ['create_task', 'edit_task', 'comment', 'view_projects'],
            isSystem: true
        },
        {
            name: 'Viewer',
            workspace: workspaceId,
            permissions: ['view_projects', 'view_tasks', 'comment'],
            isSystem: true
        }
    ];
    return await Role.insertMany(roles);
};

// ... (existing code) ...

// Remove member
exports.removeMember = async (req, res) => {
    try {
        const { workspaceId, memberId } = req.params;

        // Ensure requester is Admin or Owner
        const requesterMember = await Member.findOne({ user: req.user.id, workspace: workspaceId }).populate('role');

        if (!requesterMember) {
            return res.status(403).json({ message: 'You are not a member of this workspace' });
        }

        const isOwner = requesterMember.role.name === 'Owner';
        const isAdmin = requesterMember.role.name === 'Admin';

        if (!isOwner && !isAdmin) {
            return res.status(403).json({ message: 'Only Admins and Owners can remove members' });
        }

        // Prevent removing the Owner (unless by themselves, but usually ownership transfer is needed)
        const memberToRemove = await Member.findById(memberId).populate('role');
        if (memberToRemove && memberToRemove.role.name === 'Owner') {
            return res.status(403).json({ message: 'Cannot remove the workspace owner' });
        }

        await Member.findByIdAndDelete(memberId);

        await Workspace.findByIdAndUpdate(workspaceId, {
            $pull: {
                members: memberId, // Pull from array of ObjectIds
                // Also try to pull if it was stored as an object (schema mismatch safeguard)
            }
        });

        // Also handle the embedded members array if it uses objects
        await Workspace.findByIdAndUpdate(workspaceId, {
            $pull: { members: { _id: memberId } }
        });

        // Also handle if memberId passed is actually userId (frontend confusion safeguard)
        await Workspace.findByIdAndUpdate(workspaceId, {
            $pull: { members: { user: memberId } }
        });


        res.status(200).json({ message: 'Member removed successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error removing member' });
    }
};

// Delete workspace
exports.deleteWorkspace = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;

        const workspace = await Workspace.findById(id);

        if (!workspace) {
            return res.status(404).json({ message: 'Workspace not found' });
        }

        // Check ownership
        const member = await Member.findOne({ workspace: id, user: userId }).populate('role');

        if (!member || member.role.name !== 'Owner') {
            return res.status(403).json({ message: 'Only the workspace owner can delete the workspace' });
        }

        // Delete all workspace data
        await Task.deleteMany({ workspace: id });
        await Project.deleteMany({ workspace: id });
        await Member.deleteMany({ workspace: id });

        await Workspace.findByIdAndDelete(id);

        res.status(200).json({ message: 'Workspace deleted successfully' });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error deleting workspace' });
    }
};

// Create a new workspace
exports.createWorkspace = async (req, res) => {
    try {
        const { name, theme } = req.body;

        // 1. Create Workspace
        const workspace = new Workspace({
            name,
            owner: req.user.id,
            inviteCode: crypto.randomBytes(4).toString('hex').toUpperCase(),
            settings: { theme }
        });
        await workspace.save();

        // 2. Create Default Roles
        const roles = await createDefaultRoles(workspace._id);
        const ownerRole = roles.find(r => r.name === 'Owner');

        // 3. Add Creator as Owner
        const member = new Member({
            user: req.user.id,
            workspace: workspace._id,
            role: ownerRole._id,
            status: 'Active'
        });
        await member.save();

        // 4. Update Workspace members array
        workspace.members.push(member._id);
        await workspace.save();

        // 5. Update User's last active workspace
        req.user.lastActiveWorkspace = workspace._id;
        await req.user.save();

        res.status(201).json({ workspace, member });
    } catch (error) {
        console.error('Create Workspace Error:', error);
        res.status(500).json({ message: error.message || 'Server error creating workspace' });
    }
};

// Get all workspaces for the user
exports.getMyWorkspaces = async (req, res) => {
    try {
        // Get workspaces where user is a member (via Member collection)
        const members = await Member.find({ user: req.user.id })
            .populate('workspace')
            .populate('role');

        const memberWorkspaces = members.map(m => {
            if (!m.workspace) return null;
            return {
                ...m.workspace.toObject(),
                role: m.role, // Attach role directly for easy access
                joinedAt: m.joinedAt
            };
        }).filter(w => w !== null);

        // Also get workspaces where user is the owner
        const ownedWorkspaces = await Workspace.find({ owner: req.user.id });

        // Merge and deduplicate
        const workspaceIds = new Set(memberWorkspaces.map(w => w._id.toString()));
        const allWorkspaces = [...memberWorkspaces];

        ownedWorkspaces.forEach(w => {
            if (!workspaceIds.has(w._id.toString())) {
                allWorkspaces.push({
                    ...w.toObject(),
                    role: { name: 'Owner' },
                    joinedAt: w.createdAt
                });
                workspaceIds.add(w._id.toString());
            } else {
                // If workspace already exists in memberWorkspaces, update its role to Owner
                const existingIndex = allWorkspaces.findIndex(ws => ws._id.toString() === w._id.toString());
                if (existingIndex !== -1) {
                    allWorkspaces[existingIndex].role = { name: 'Owner' };
                }
            }
        });

        res.json(allWorkspaces);
    } catch (error) {
        console.error('[getMyWorkspaces] Error:', error);
        res.status(500).json({ message: 'Server error fetching workspaces' });
    }
};

// Get single workspace details
exports.getWorkspaceById = async (req, res) => {
    try {
        const workspace = await Workspace.findById(req.params.id)
            .populate('owner', 'name email avatar');

        if (!workspace) {
            return res.status(404).json({ message: 'Workspace not found' });
        }

        // Safety check for user ID
        const userId = req.user?.id || req.user?._id;
        if (!userId) {
            return res.status(401).json({ message: 'Authentication required' });
        }

        // Fetch members from Member collection (canonical source for shared workspaces)
        const collectionMembers = await Member.find({ workspace: workspace._id })
            .populate('user', 'name email avatar')
            .populate('role', 'name');

        let finalMembers = collectionMembers.map(m => ({
            _id: m._id,
            user: m.user,
            role: m.role || { name: 'Member' },
            joinedAt: m.joinedAt
        }));

        // If no members in collection, but it's a private workspace or just missing owner
        const ownerId = workspace.owner?._id || workspace.owner;
        const ownerExistsInMembers = finalMembers.some(m => m.user?._id?.toString() === ownerId?.toString() || m.user?.toString() === ownerId?.toString());

        if (!ownerExistsInMembers && workspace.owner) {
            // Add owner as a member for the UI
            finalMembers.unshift({
                _id: 'owner-' + ownerId,
                user: workspace.owner,
                role: { name: 'Owner' },
                joinedAt: workspace.createdAt
            });
        }

        // Permission check
        const isOwner = ownerId && ownerId.toString() === userId.toString();
        const isMember = finalMembers.some(m => m.user?._id?.toString() === userId.toString() || m.user?.toString() === userId.toString());

        if (!isOwner && !isMember) {
            return res.status(403).json({ message: 'Access denied' });
        }

        const workspaceObj = workspace.toObject();
        workspaceObj.members = finalMembers;

        res.json(workspaceObj);
    } catch (error) {
        console.error('[getWorkspaceById] Error:', error.message);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Join workspace via code
exports.joinWorkspace = async (req, res) => {
    try {
        const { inviteCode } = req.body;
        const workspace = await Workspace.findOne({ inviteCode });

        if (!workspace) {
            return res.status(404).json({ message: 'Invalid invite code' });
        }

        // Check if already a member
        const existingMember = await Member.findOne({ user: req.user.id, workspace: workspace._id });
        if (existingMember) {
            return res.status(400).json({ message: 'You are already a member of this workspace', workspaceId: workspace._id });
        }

        // Assign default 'Member' role
        const memberRole = await Role.findOne({ workspace: workspace._id, name: 'Member' });

        const newMember = new Member({
            user: req.user.id,
            workspace: workspace._id,
            role: memberRole._id
        });
        await newMember.save();

        workspace.members.push(newMember._id);
        await workspace.save();

        // Create notifications for both inviter and joined user
        const { createNotification } = require('./notificationController');

        // Notify the user who joined
        createNotification({
            userId: req.user.id,
            type: 'success',
            title: 'Joined Workspace',
            message: `You have successfully joined "${workspace.name}"`,
            link: `/workspace/${workspace._id}`,
            metadata: { workspaceId: workspace._id }
        });

        // Notify the workspace owner
        if (workspace.owner && workspace.owner.toString() !== req.user.id.toString()) {
            createNotification({
                userId: workspace.owner,
                type: 'system',
                title: 'New Member Joined',
                message: `${req.user.name} joined your workspace "${workspace.name}"`,
                link: `/settings/workspace`,
                metadata: { workspaceId: workspace._id, newMemberId: req.user.id }
            });
        }

        res.status(200).json({ message: 'Joined workspace successfully', workspace });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error joining workspace' });
    }
};

// Switch workspace (updates user preference)
exports.switchWorkspace = async (req, res) => {
    try {
        const { workspaceId } = req.body;

        // Verify membership OR ownership
        const workspace = await Workspace.findById(workspaceId);
        if (!workspace) {
            return res.status(404).json({ message: 'Workspace not found' });
        }

        const isOwner = workspace.owner?.toString() === req.user.id.toString();
        const isMember = await Member.exists({ user: req.user.id, workspace: workspaceId });

        if (!isOwner && !isMember) {
            return res.status(403).json({ message: 'Not a member of this workspace' });
        }

        req.user.lastActiveWorkspace = workspaceId;
        await req.user.save();

        res.json({ message: 'Workspace switched', workspaceId });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error switching workspace' });
    }
};
// Update workspace details
exports.updateWorkspace = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, description } = req.body;

        const workspace = await Workspace.findById(id);
        if (!workspace) {
            return res.status(404).json({ message: 'Workspace not found' });
        }

        // Check ownership
        if (workspace.owner.toString() !== req.user.id) {
            return res.status(403).json({ message: 'Only the owner can update workspace details' });
        }

        workspace.name = name || workspace.name;
        workspace.description = description || workspace.description;
        await workspace.save();

        res.json(workspace);
    } catch (error) {
        console.error('Update Workspace Error:', error);
        res.status(500).json({ message: 'Server error updating workspace' });
    }
};

// Invite member by email - send invitation link
exports.inviteMember = async (req, res) => {
    try {
        const { email, workspaceId, roleName = 'Member' } = req.body;

        if (!workspaceId) {
            return res.status(400).json({ message: 'Workspace ID is required' });
        }
        if (!email) {
            return res.status(400).json({ message: 'Email is required' });
        }


        const workspace = await Workspace.findById(workspaceId).populate('owner', 'name email');
        if (!workspace) {
            return res.status(404).json({ message: 'Workspace not found' });
        }

        // Check if user is already a member
        const Member = require('../models/Member');
        const User = require('../models/User');
        const existingUser = await User.findOne({ email });

        if (existingUser) {
            const existingMember = await Member.findOne({ user: existingUser._id, workspace: workspaceId });
            if (existingMember) {
                return res.status(400).json({ message: 'User is already a member of this workspace' });
            }
        }

        // Check if there's already a pending invitation
        const Invitation = require('../models/Invitation');
        const existingInvite = await Invitation.findOne({
            email,
            workspace: workspaceId,
            status: 'pending',
            expiresAt: { $gt: new Date() }
        });

        if (existingInvite) {
            // Instead of blocking, we delete the old one and let the code proceed to create a new one
            await Invitation.findByIdAndDelete(existingInvite._id);
        }

        // Find the requested role
        let requestedRole = await Role.findOne({ workspace: workspaceId, name: roleName });
        if (!requestedRole) {
            requestedRole = await Role.findOne({ workspace: workspaceId, name: 'Member' });
        }

        if (!requestedRole) {
            const roles = await createDefaultRoles(workspace._id);
            requestedRole = roles.find(r => r.name === 'Member');
        }

        // Generate unique invitation token
        const token = crypto.randomBytes(32).toString('hex');

        // Create invitation that expires in 7 days
        const invitation = new Invitation({
            workspace: workspaceId,
            email,
            role: requestedRole._id,
            token,
            invitedBy: req.user.id,
            expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
        });
        await invitation.save();

        // Send invitation email with acceptance link
        const acceptUrl = `${process.env.CLIENT_URL}/accept-invite?token=${token}`;

        // --- MODIFIED FOR CLIENT-SIDE SENDING ---
        // Instead of sending the email from the server, we return the link
        // so the client can send it via EmailJS.

        // Notify Inviter (Self) - Persistence
        const { createNotification } = require('./notificationController');
        createNotification({
            userId: req.user.id,
            type: 'system',
            title: 'Invitation Generated',
            message: `Invitation link generated for ${email}`,
            link: null,
            metadata: { workspaceId: workspace._id, email }
        });

        res.status(200).json({
            message: `Invitation generated for ${email}`,
            invitation: {
                email,
                expiresAt: invitation.expiresAt
            },
            invitationLink: acceptUrl // <--- Sending this to client
        });

        // (Server-side email code removed/skipped to avoid blocks)
        /*
                try {
                    await emailService.sendInvitationEmail(
                        email,
                        workspace.name,
                        workspace.owner?.name || 'Team',
                        acceptUrl
                    );
                    // ...
                } catch (emailError) {
                     // ...
                }
        */

    } catch (error) {
        console.error('❌ Invite Member Error:', error);
        res.status(500).json({ message: 'Server error during invitation', error: error.message });
    }
};

// Accept workspace invitation
exports.acceptInvite = async (req, res) => {
    try {
        const { token } = req.params;

        const Invitation = require('../models/Invitation');
        const invitation = await Invitation.findOne({ token })
            .populate('workspace', 'name')
            .populate('role', 'name');

        if (!invitation) {
            return res.status(404).json({ message: 'Invalid invitation link' });
        }

        if (invitation.status !== 'pending') {
            return res.status(400).json({ message: 'This invitation has already been used' });
        }

        if (invitation.expiresAt < new Date()) {
            invitation.status = 'expired';
            await invitation.save();
            return res.status(400).json({ message: 'This invitation has expired' });
        }

        // User must be authenticated
        if (!req.user || !req.user.email) {
            return res.status(401).json({ message: 'Please sign in to accept this invitation' });
        }

        // Verify email matches
        if (req.user.email.toLowerCase() !== invitation.email.toLowerCase()) {
            return res.status(403).json({
                message: `This invitation is for ${invitation.email}. Please sign in with that account.`
            });
        }

        // Check if already a member
        const existingMember = await Member.findOne({
            user: req.user.id,
            workspace: invitation.workspace._id
        });

        if (existingMember) {
            invitation.status = 'accepted';
            await invitation.save();
            return res.status(200).json({
                message: 'You are already a member of this workspace',
                workspace: invitation.workspace
            });
        }

        // Add user to workspace
        const newMember = new Member({
            user: req.user.id,
            workspace: invitation.workspace._id,
            role: invitation.role._id,
            joinedAt: new Date(),
            status: 'Active'
        });
        await newMember.save();

        // Update workspace members array
        await Workspace.findByIdAndUpdate(invitation.workspace._id, {
            $push: { members: newMember._id }
        });

        // Mark invitation as accepted
        invitation.status = 'accepted';
        await invitation.save();

        // Notify the user who joined
        const { createNotification } = require('./notificationController');
        await createNotification({
            userId: req.user.id,
            type: 'success',
            title: 'Welcome to Workspace',
            message: `You have successfully joined "${invitation.workspace.name}"`,
            link: `/workspace/${invitation.workspace._id}`,
            metadata: { workspaceId: invitation.workspace._id }
        });

        // Notify the workspace owner
        const workspaceOwnerId = invitation.workspace.owner?._id || invitation.workspace.owner;
        if (workspaceOwnerId && workspaceOwnerId.toString() !== req.user.id.toString()) {
            await createNotification({
                userId: workspaceOwnerId,
                type: 'system',
                title: 'New Member Joined',
                message: `${req.user.name} has joined "${invitation.workspace.name}"`,
                link: `/settings/workspace`,
                metadata: { workspaceId: invitation.workspace._id, newMemberId: req.user.id }
            });
        }

        res.status(200).json({
            message: `Welcome to ${invitation.workspace.name}!`,
            workspace: invitation.workspace,
            member: newMember
        });

    } catch (error) {
        console.error('❌ Accept Invite Error:', error);
        res.status(500).json({ message: 'Server error accepting invitation', error: error.message });
    }
};


