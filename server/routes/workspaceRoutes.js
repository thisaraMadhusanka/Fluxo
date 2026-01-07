const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const authWorkspace = require('../middleware/authWorkspace');
const {
    createWorkspace,
    getMyWorkspaces,
    getWorkspaceById,
    updateWorkspace,
    joinWorkspace,
    switchWorkspace,
    inviteMember,
    acceptInvite,
    removeMember,
    deleteWorkspace
} = require('../controllers/workspaceController');

// All routes require authentication
router.use(protect);

// Workspace CRUD
router.post('/', createWorkspace);
router.get('/', getMyWorkspaces);

// Join workspace by invite code
router.post('/join', joinWorkspace);

// Switch active workspace
router.post('/switch', switchWorkspace);

// Invite management
router.post('/invite', inviteMember);
router.post('/accept/:token', acceptInvite);

// Member management
router.delete('/:workspaceId/members/:memberId', removeMember);

// Specific Workspace Routes
router.get('/:id', getWorkspaceById);
router.put('/:id', updateWorkspace);
router.delete('/:id', deleteWorkspace);

// Example of using authWorkspace for protected sub-routes (e.g., settings)
// router.use('/:workspaceId', authWorkspace);

module.exports = router;
