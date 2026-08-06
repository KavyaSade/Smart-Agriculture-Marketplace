import { Router } from 'express';
import User from '../models/User.js';
import { authenticateToken } from '../middleware/auth.js';

const router = Router();

// Middleware to restrict access to Admins only
const verifyAdmin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({ message: 'Access denied. Administrators only.' });
  }
};

// Retrieve all users (Admin only)
router.get('/', authenticateToken, verifyAdmin, async (req, res) => {
  try {
    const users = await User.find({}, '-password').sort({ createdAt: -1 });
    res.status(200).json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete a user account (Admin only)
router.delete('/:id', authenticateToken, verifyAdmin, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    if (user.role === 'admin') {
      return res.status(400).json({ message: 'Cannot delete system administrator account.' });
    }

    await user.deleteOne();
    res.status(200).json({ message: 'User account deleted successfully.' });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
