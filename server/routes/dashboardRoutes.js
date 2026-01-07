const express = require('express');
const router = express.Router();
const { getDashboardStats } = require('../controllers/dashboardController');
const { protect } = require('../middleware/authMiddleware');
const authWorkspace = require('../middleware/authWorkspace');

router.get('/stats', protect, authWorkspace, getDashboardStats);

module.exports = router;
