const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const authWorkspace = require('../middleware/authWorkspace');
const { getProjects, createProject, updateProject, deleteProject, updateMemberRole, removeMember, addMember, getProjectById } = require('../controllers/projectController');

router.use(protect);
router.use(authWorkspace);

const { canEditProject, canViewProject } = require('../middleware/projectPermissions');

router.route('/').get(getProjects).post(createProject);
router.route('/:id')
    .get(canViewProject, getProjectById)
    .put(canEditProject, updateProject)
    .delete(canEditProject, deleteProject);

router.route('/:id/members').post(canEditProject, addMember);
router.put('/:id/members/:userId/role', canEditProject, updateMemberRole);
router.delete('/:id/members/:userId', canEditProject, removeMember);

module.exports = router;
