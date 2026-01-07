const express = require('express');
const router = express.Router();
const {
    submitRequest,
    getRequests,
    approveRequest,
    rejectRequest
} = require('../controllers/accessRequestController');
const { protect, owner } = require('../middleware/authMiddleware');

// Public route
router.post('/', submitRequest);

// Admin routes
router.get('/', protect, owner, getRequests);
router.put('/:id/approve', protect, owner, approveRequest);
router.put('/:id/reject', protect, owner, rejectRequest);

module.exports = router;
