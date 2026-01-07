const express = require('express');
const router = express.Router();
const {
    getNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    deleteAllNotifications
} = require('../controllers/notificationController');
const { protect } = require('../middleware/authMiddleware');

// All routes require authentication
router.use(protect);

router.get('/', getNotifications);
router.post('/', require('../controllers/notificationController').createNotificationAPI); // Add POST route for manual creation
router.put('/:id/read', markAsRead);
router.put('/read-all', markAllAsRead);
router.delete('/delete-all', deleteAllNotifications);
router.delete('/:id', deleteNotification);

module.exports = router;
