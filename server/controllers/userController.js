const User = require('../models/User');
const bcrypt = require('bcryptjs');

// @desc    Get all users
// @route   GET /api/users
// @access  Private/Owner
const getUsers = async (req, res) => {
    try {
        const users = await User.find({}).select('-password');
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

        // Get projects user is a member of
        const joinedProjects = await Project.find({
            "members.user": req.user.id
        }).populate('workspace', 'name');

        // Get workspaces user is a member of
        const joinedWorkspaces = await Workspace.find({
            "members.user": req.user.id
        });

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
            joinedWorkspaces: joinedWorkspaces.map(w => ({
                _id: w._id,
                name: w.name,
                role: w.members.find(m => m.user.toString() === req.user.id.toString())?.role
            }))
        });
    } catch (error) {
        console.error('Get Stats Error:', error);
        res.status(500).json({ message: 'Server Error fetching stats' });
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

        // Remove user from members
        project.members = project.members.filter(m => m.user.toString() !== req.user.id.toString());
        await project.save();

        res.json({ message: 'Left project successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server Error leaving project' });
    }
};

// @desc    Leave a workspace
// @route   POST /api/users/leave-workspace/:id
// @access  Private
const leaveWorkspace = async (req, res) => {
    try {
        const Workspace = require('../models/Workspace');
        const workspace = await Workspace.findById(req.params.id);

        if (!workspace) return res.status(404).json({ message: 'Workspace not found' });

        // Owners cannot leave their own workspace normally, they must delete it or transfer it
        const userMember = workspace.members.find(m => m.user.toString() === req.user.id.toString());
        if (userMember?.role === 'Owner') {
            return res.status(400).json({ message: 'Owner cannot leave their own workspace. Delete the workspace instead.' });
        }

        // Remove user from members
        workspace.members = workspace.members.filter(m => m.user.toString() !== req.user.id.toString());
        await workspace.save();

        res.json({ message: 'Left workspace successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server Error leaving workspace' });
    }
};

module.exports = {
    getUsers,
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
