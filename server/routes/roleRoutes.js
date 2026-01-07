const express = require('express');
const router = express.Router({ mergeParams: true }); // Merge params to access :workspaceId
const { protect } = require('../middleware/authMiddleware');
const authWorkspace = require('../middleware/authWorkspace');
const checkPermission = require('../middleware/checkPermission');
const {
    getWorkspaceRoles,
    createRole,
    updateRole,
    deleteRole
} = require('../controllers/roleController');

// All routes require authentication and workspace context
router.use(protect);
router.use(authWorkspace);

// Get roles - accessible to anyone with 'view_members' or similar, defaults to all members for now
router.get('/', getWorkspaceRoles);

// Manage Roles - Requires 'manage_roles' permission (usually Admin/Owner)
router.post('/', checkPermission('manage_members'), createRole);
router.put('/:roleId', checkPermission('manage_members'), updateRole);
router.delete('/:roleId', checkPermission('manage_members'), deleteRole);

module.exports = router;
