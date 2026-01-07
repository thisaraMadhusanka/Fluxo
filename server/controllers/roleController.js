const Role = require('../models/Role');
const Member = require('../models/Member');

// Get all roles in a workspace
exports.getWorkspaceRoles = async (req, res) => {
    try {
        const roles = await Role.find({ workspace: req.workspace._id });
        res.json(roles);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error fetching roles' });
    }
};

// Create a custom role
exports.createRole = async (req, res) => {
    try {
        const { name, permissions, description } = req.body;

        const roleExists = await Role.findOne({ workspace: req.workspace._id, name });
        if (roleExists) {
            return res.status(400).json({ message: 'Role with this name already exists' });
        }

        const role = new Role({
            name,
            workspace: req.workspace._id,
            permissions,
            description,
            isSystem: false
        });

        await role.save();
        res.status(201).json(role);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error creating role' });
    }
};

// Update a role (permissions)
exports.updateRole = async (req, res) => {
    try {
        const { roleId } = req.params;
        const { permissions, description } = req.body;

        const role = await Role.findOne({ _id: roleId, workspace: req.workspace._id });

        if (!role) {
            return res.status(404).json({ message: 'Role not found' });
        }

        if (role.isSystem) {
            return res.status(403).json({ message: 'Cannot modify system roles directly' });
        }

        role.permissions = permissions || role.permissions;
        role.description = description || role.description;
        await role.save();

        res.json(role);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error updating role' });
    }
};

// Delete a role
exports.deleteRole = async (req, res) => {
    try {
        const { roleId } = req.params;

        const role = await Role.findOne({ _id: roleId, workspace: req.workspace._id });

        if (!role) {
            return res.status(404).json({ message: 'Role not found' });
        }

        if (role.isSystem) {
            return res.status(403).json({ message: 'Cannot delete system roles' });
        }

        // Check if any members are assigned to this role
        const membersWithRole = await Member.countDocuments({ role: roleId });
        if (membersWithRole > 0) {
            return res.status(400).json({ message: `Cannot delete role. It is assigned to ${membersWithRole} members.` });
        }

        await role.deleteOne();
        res.json({ message: 'Role deleted successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error deleting role' });
    }
};
