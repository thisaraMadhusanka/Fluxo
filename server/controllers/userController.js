const User = require('../models/User');
const bcrypt = require('bcryptjs');

// @desc    Get all users
// @route   GET /api/users
// @access  Private/Owner
// @desc    Get all users (Scoped to Workspace if provided)
// @route   GET /api/users
// @access  Private
const getUsers = async (req, res) => {
    try {
        const workspaceId = req.headers['x-workspace-id'];

        if (workspaceId) {
            const Member = require('../models/Member');
            // Fetch members of the workspace
            const members = await Member.find({ workspace: workspaceId })
                .populate('user', 'name email avatar position bio role isApproved');

            // map to user objects
            const users = members
                .filter(m => m.user) // Filter out broken references
                .map(m => m.user);

            return res.json(users);
        }

        // Fallback for non-workspace context (e.g. Admin Dashboard) - WITH PAGINATION
        // Or limiting to avoid crash
        const users = await User.find({})
            .select('-password')
            .limit(100); // Safety limit

        res.json(users);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Update own profile
// @route   PUT /api/users/profile
// @access  Private
const updateProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);

        if (user) {
            user.name = req.body.name || user.name;
            user.avatar = req.body.avatar || user.avatar;
            user.position = req.body.position || user.position;
            user.bio = req.body.bio || user.bio;

            const updatedUser = await user.save();
            res.json({
                _id: updatedUser._id,
                name: updatedUser.name,
                email: updatedUser.email,
                avatar: updatedUser.avatar,
                role: updatedUser.role,
                position: updatedUser.position,
                bio: updatedUser.bio
            });
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        console.error('Update Profile Error:', error);
        res.status(500).json({ message: error.message || 'Server Error updating profile' });
    }
};

// @desc    Update password
// @route   PUT /api/users/password
// @access  Private
const updatePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;

        if (!currentPassword || !newPassword) {
            return res.status(400).json({ message: 'Please provide both current and new password' });
        }

        const user = await User.findById(req.user.id);

        if (user && user.password) {
            // Verify current password
            const isMatch = await bcrypt.compare(currentPassword, user.password);

            if (!isMatch) {
                return res.status(401).json({ message: 'Current password is incorrect' });
            }

            // Hash new password
            const salt = await bcrypt.genSalt(10);
            user.password = await bcrypt.hash(newPassword, salt);

            await user.save();
            res.json({ message: 'Password updated successfully' });
        } else {
            res.status(404).json({ message: 'User not found or password not set' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Delete own account
// @route   DELETE /api/users/account
// @access  Private
const deleteOwnAccount = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);

        if (user) {
            await user.deleteOne();
            res.json({ message: 'Account deleted successfully' });
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Upload avatar (base64)
// @route   POST /api/users/avatar
// @access  Private
const uploadAvatar = async (req, res) => {
    try {
        const { avatar } = req.body; // base64 string

        if (!avatar) {
            return res.status(400).json({ message: 'No avatar data provided' });
        }

        const user = await User.findById(req.user.id);

        if (user) {
            user.avatar = avatar;
            await user.save();

            res.json({
                message: 'Avatar uploaded successfully',
                avatar: user.avatar
            });
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Update user role
// @route   PUT /api/users/:id/role
// @access  Private/Owner
const updateUserRole = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);

        if (user) {
            user.role = req.body.role || user.role;
            const updatedUser = await user.save();
            res.json({
                _id: updatedUser._id,
                name: updatedUser.name,
                email: updatedUser.email,
                role: updatedUser.role,
                isApproved: updatedUser.isApproved
            });
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Approve user
// @route   PUT /api/users/:id/approve
// @access  Private/Owner
const approveUser = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);

        if (user) {
            user.isApproved = true;
            const updatedUser = await user.save();

            // Send approval email with login link
            const { sendApprovalNotification } = require('../services/emailService');
            try {
                await sendApprovalNotification(user.email, user.name);
                console.log(`✅ Approval email sent to ${user.email}`);
            } catch (emailError) {
                console.error('❌ Failed to send approval email:', emailError.message);
                // Don't fail the approval if email fails
            }

            res.json({ message: 'User approved', user: updatedUser });
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Delete user
// @route   DELETE /api/users/:id
// @access  Private/Owner
const deleteUser = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);

        if (user) {
            // Send suspended email
            const { sendAccountSuspendedNotification } = require('../services/emailService');
            try {
                await sendAccountSuspendedNotification(user.email, user.name);
            } catch (error) {
                console.error('Failed to send suspended email:', error);
            }

            await user.deleteOne();
            res.json({ message: 'User removed' });
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Get user stats (ranking, projects, tasks)
// @route   GET /api/users/stats
// @access  Private
const getUserStats = async (req, res) => {
    try {
        const Project = require('../models/Project');
        const Task = require('../models/Task');
        const Workspace = require('../models/Workspace');
        const Member = require('../models/Member');

        // Get projects user is a member of
        const joinedProjects = await Project.find({
            "members.user": req.user.id
        }).populate('workspace', 'name');

        // Get workspaces from Member collection (proper way)
        const memberRecords = await Member.find({ user: req.user.id })
            .populate('workspace', 'name owner isPrivate')
            .populate('role', 'name');

        const joinedWorkspaces = memberRecords
            .filter(m => m.workspace) // Ensure workspace exists
            .map(m => ({
                _id: m.workspace._id,
                name: m.workspace.name,
                isPrivate: m.workspace.isPrivate,
                role: m.role?.name || 'Member'
            }));

        // Calculate stats
        const completedProjects = joinedProjects.filter(p => p.status === 'Completed').length;
        const totalProjects = joinedProjects.length;

        // Get completed tasks
        const completedTasksCount = await Task.countDocuments({
            assignees: req.user.id,
            status: 'Done'
        });

        // Determine Ranking
        let ranking = 'Bronze';
        if (completedProjects >= 11) ranking = 'Diamond';
        else if (completedProjects >= 3) ranking = 'Gold';

        res.json({
            ranking,
            stats: {
                completedProjects,
                totalProjects,
                completedTasks: completedTasksCount,
                workspacesCount: joinedWorkspaces.length
            },
            joinedProjects: joinedProjects.map(p => ({
                _id: p._id,
                title: p.title,
                status: p.status,
                workspaceName: p.workspace?.name,
                color: p.color
            })),
            joinedWorkspaces
        });
    } catch (error) {
        console.error('Get Stats Error:', error);
        res.status(500).json({ message: 'Server Error fetching stats', error: error.message });
    }
};

// @desc    Leave a project
// @route   POST /api/users/leave-project/:id
// @access  Private
const leaveProject = async (req, res) => {
    try {
        const Project = require('../models/Project');
        const project = await Project.findById(req.params.id);

        if (!project) return res.status(404).json({ message: 'Project not found' });

        // Remove user from embedded members array
        project.members = project.members.filter(m => m.user.toString() !== req.user.id.toString());
        await project.save();

        res.json({ message: 'Left project successfully' });
    } catch (error) {
        console.error('Leave Project Error:', error);
        res.status(500).json({ message: 'Server Error leaving project', error: error.message });
    }
};

// @desc    Leave a workspace
// @route   POST /api/users/leave-workspace/:id
// @access  Private
const leaveWorkspace = async (req, res) => {
    try {
        const Workspace = require('../models/Workspace');
        const Member = require('../models/Member');

        const workspaceId = req.params.id;
        const workspace = await Workspace.findById(workspaceId);

        if (!workspace) return res.status(404).json({ message: 'Workspace not found' });

        // Check if user is actually a member via Member collection
        const member = await Member.findOne({
            user: req.user.id,
            workspace: workspaceId
        }).populate('role');

        if (!member) {
            return res.status(404).json({ message: 'You are not a member of this workspace' });
        }

        // Owners cannot leave their own workspace
        if (member.role?.name === 'Owner' || workspace.owner?.toString() === req.user.id.toString()) {
            return res.status(400).json({ message: 'Owner cannot leave their own workspace. Delete the workspace instead.' });
        }

        // Delete from Member collection
        await Member.deleteOne({ _id: member._id });

        // Also remove from workspace members array
        workspace.members = workspace.members.filter(m => m._id?.toString() !== member._id.toString());
        await workspace.save();

        res.json({ message: 'Left workspace successfully' });
    } catch (error) {
        console.error('Leave Workspace Error:', error);
        res.status(500).json({ message: 'Server Error leaving workspace', error: error.message });
    }
};

// @desc    Get ALL users (System Admin) - Bypasses workspace scope
// @route   GET /api/users/admin/all
// @access  Private/Owner
const getAllUsersAdmin = async (req, res) => {
    try {
        const User = require('../models/User');
        // Fetch ALL users in the system, sorted by newest
        const users = await User.find({})
            .select('-password')
            .sort({ createdAt: -1 });

        res.json(users);
    } catch (error) {
        console.error('Get All Users Admin Error:', error);
        res.status(500).json({ message: 'Server Error fetching all users' });
    }
};

module.exports = {
    getUsers,
    getAllUsersAdmin, // <--- New export
    updateProfile,
    updatePassword,
    deleteOwnAccount,
    uploadAvatar,
    updateUserRole,
    approveUser,
    deleteUser,
    getUserStats,
    leaveProject,
    leaveWorkspace
};
