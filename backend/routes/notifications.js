import { Router } from 'express';
import Notification from '../models/Notification.js';
import { authenticateToken } from '../middleware/auth.js';

const router = Router();

// GET /api/notifications
// Retrieves notifications for the currently logged-in user
router.get('/', authenticateToken, async (req, res) => {
  try {
    const notifications = await Notification.find({ recipient: req.user.id })
      .sort({ createdAt: -1 })
      .limit(50);
    
    const unreadCount = await Notification.countDocuments({
      recipient: req.user.id,
      isRead: false
    });

    res.status(200).json({ notifications, unreadCount });
  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({ message: 'Server error fetching notifications.' });
  }
});

// PUT /api/notifications/:id/read
// Marks a single notification as read
router.put('/:id/read', authenticateToken, async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id);
    if (!notification) {
      return res.status(404).json({ message: 'Notification not found.' });
    }

    if (notification.recipient.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Unauthorized access to notification.' });
    }

    notification.isRead = true;
    await notification.save();

    res.status(200).json({ message: 'Notification marked as read.', notification });
  } catch (error) {
    console.error('Error marking notification read:', error);
    res.status(500).json({ message: 'Server error updating notification status.' });
  }
});

// PUT /api/notifications/read-all
// Marks all notifications for the user as read
router.put('/read-all', authenticateToken, async (req, res) => {
  try {
    await Notification.updateMany(
      { recipient: req.user.id, isRead: false },
      { $set: { isRead: true } }
    );

    res.status(200).json({ message: 'All notifications marked as read.' });
  } catch (error) {
    console.error('Error marking all notifications read:', error);
    res.status(500).json({ message: 'Server error marking all notifications read.' });
  }
});

// DELETE /api/notifications/:id
// Deletes a single notification
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id);
    if (!notification) {
      return res.status(404).json({ message: 'Notification not found.' });
    }

    if (notification.recipient.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Unauthorized deletion of notification.' });
    }

    await notification.deleteOne();
    res.status(200).json({ message: 'Notification deleted successfully.' });
  } catch (error) {
    console.error('Error deleting notification:', error);
    res.status(500).json({ message: 'Server error deleting notification.' });
  }
});

// DELETE /api/notifications
// Deletes all notifications for the user
router.delete('/', authenticateToken, async (req, res) => {
  try {
    await Notification.deleteMany({ recipient: req.user.id });
    res.status(200).json({ message: 'All notifications deleted successfully.' });
  } catch (error) {
    console.error('Error clearing notifications:', error);
    res.status(500).json({ message: 'Server error clearing notifications.' });
  }
});

export default router;
