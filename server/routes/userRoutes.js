const express = require('express');
const router = express.Router();
const {
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
} = require('../controllers/userController');
const { protect, owner } = require('../middleware/authMiddleware');

// Profile management routes (own profile)
router.put('/profile', protect, updateProfile);
router.put('/password', protect, updatePassword);
router.post('/avatar', protect, uploadAvatar);
router.delete('/account', protect, deleteOwnAccount);
router.get('/stats', protect, getUserStats);
router.post('/leave-project/:id', protect, leaveProject);
router.post('/leave-workspace/:id', protect, leaveWorkspace);

// Admin routes (Note: GET / now allows all authenticated users for messaging)
router.get('/', protect, getUsers); // Changed from owner-only to allow workspace member listing
router.put('/:id/role', protect, owner, updateUserRole);
router.put('/:id/approve', protect, owner, approveUser);
router.delete('/:id', protect, owner, deleteUser);

module.exports = router;
