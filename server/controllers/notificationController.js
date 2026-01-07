const Notification = require('../models/Notification');

// Get user notifications
exports.getNotifications = async (req, res) => {
    try {
        const { limit = 20, unreadOnly = false } = req.query;

        const query = { user: req.user.id };
        if (unreadOnly === 'true') {
            query.isRead = false;
        }

        const notifications = await Notification.find(query)
            .sort({ createdAt: -1 })
            .limit(parseInt(limit));

        const unreadCount = await Notification.countDocuments({
            user: req.user.id,
            isRead: false
        });

        res.status(200).json({ notifications, unreadCount });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Mark notification as read
exports.markAsRead = async (req, res) => {
    try {
        const { id } = req.params;

        const notification = await Notification.findOneAndUpdate(
            { _id: id, user: req.user.id },
            { isRead: true },
            { new: true }
        );

        if (!notification) {
            return res.status(404).json({ message: 'Notification not found' });
        }

        res.status(200).json(notification);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Mark all notifications as read
exports.markAllAsRead = async (req, res) => {
    try {
        await Notification.updateMany(
            { user: req.user.id, isRead: false },
            { isRead: true }
        );

        res.status(200).json({ message: 'All notifications marked as read' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Delete notification
exports.deleteNotification = async (req, res) => {
    try {
        const { id } = req.params;

        const notification = await Notification.findOneAndDelete({
            _id: id,
            user: req.user.id
        });

        if (!notification) {
            return res.status(404).json({ message: 'Notification not found' });
        }

        res.status(200).json({ message: 'Notification deleted' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Delete all notifications
exports.deleteAllNotifications = async (req, res) => {
    try {
        await Notification.deleteMany({ user: req.user.id });
        res.status(200).json({ message: 'All notifications deleted' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Helper: Clean up notifications older than 1 hour
const cleanupOldNotifications = async (userId) => {
    try {
        const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
        const result = await Notification.deleteMany({
            user: userId,
            createdAt: { $lt: oneHourAgo }
        });
        console.log(`Cleaned up ${result.deletedCount} old notifications for user ${userId}`);
        return result.deletedCount;
    } catch (error) {
        console.error('Failed to cleanup old notifications:', error);
        return 0;
    }
};

// Helper: Enforce max 10 notifications per user (FIFO)
const enforceNotificationLimit = async (userId, limit = 10) => {
    try {
        const count = await Notification.countDocuments({ user: userId });
        if (count >= limit) {
            // Get oldest notifications to delete
            const toDelete = count - limit + 1; // +1 to make room for new one
            const oldestNotifications = await Notification.find({ user: userId })
                .sort({ createdAt: 1 })
                .limit(toDelete)
                .select('_id');

            const ids = oldestNotifications.map(n => n._id);
            const result = await Notification.deleteMany({ _id: { $in: ids } });
            console.log(`Deleted ${result.deletedCount} oldest notifications for user ${userId}`);
            return result.deletedCount;
        }
        return 0;
    } catch (error) {
        console.error('Failed to enforce notification limit:', error);
        return 0;
    }
};

// Create notification (internal use)
exports.createNotification = async ({ userId, type, title, message, link, metadata }) => {
    try {
        // Run cleanup before creating new notification
        await cleanupOldNotifications(userId);
        await enforceNotificationLimit(userId, 10);

        const notification = await Notification.create({
            user: userId,
            type,
            title,
            message,
            link,
            metadata
        });
        return notification;
    } catch (error) {
        console.error('Failed to create notification:', error);
        return null;
    }
};
// Create notification (API use)
exports.createNotificationAPI = async (req, res) => {
    try {
        const { title, message, type, link, metadata } = req.body;

        // Run cleanup before creating new notification
        await cleanupOldNotifications(req.user.id);
        await enforceNotificationLimit(req.user.id, 10);

        const notification = await Notification.create({
            user: req.user.id,
            title,
            message,
            type,
            link,
            metadata
        });
        res.status(201).json(notification);
    } catch (error) {
        console.error('Create Notification API Error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};
