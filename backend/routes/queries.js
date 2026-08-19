import { Router } from 'express';
import Query from '../models/Query.js';
import { authenticateToken } from '../middleware/auth.js';
import { sendQueryStatusEmail, sendQueryConfirmationEmail } from '../utils/email.js';

const router = Router();

// Middleware to restrict access to Admins only
const verifyAdmin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({ message: 'Access denied. Administrators only.' });
  }
};

// Route to submit a contact query
// Access: Public
router.post('/', async (req, res) => {
  try {
    const { name, email, subject, message } = req.body;

    // Simple validation checks
    if (!name || !email || !subject || !message) {
      return res.status(400).json({ message: 'All fields are required.' });
    }

    const newQuery = new Query({
      name,
      email,
      subject,
      message
    });

    await newQuery.save();

    // Send query confirmation email to user
    try {
      await sendQueryConfirmationEmail(email, name, subject);
    } catch (emailErr) {
      console.error('Error sending query confirmation email:', emailErr);
    }

    res.status(201).json({ message: 'Query submitted successfully.', query: newQuery });
  } catch (err) {
    console.error('Error submitting query:', err);
    res.status(500).json({ message: 'Internal server error.' });
  }
});

// Route to get all contact queries
// Access: Admin Only
router.get('/', authenticateToken, verifyAdmin, async (req, res) => {
  try {
    // Retrieve all queries sorted by creation date in descending order
    const queries = await Query.find().sort({ createdAt: -1 });
    res.status(200).json(queries);
  } catch (err) {
    console.error('Error retrieving queries:', err);
    res.status(500).json({ message: 'Internal server error.' });
  }
});

// Route to update a query status
// Access: Admin Only
router.patch('/:id', authenticateToken, verifyAdmin, async (req, res) => {
  try {
    const { status } = req.body;

    // Validate the status input
    if (status !== 'Pending' && status !== 'Resolved') {
      return res.status(400).json({ message: 'Invalid status value.' });
    }

    const updatedQuery = await Query.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );

    if (!updatedQuery) {
      return res.status(404).json({ message: 'Query not found.' });
    }

    // Send query update notification to user email
    try {
      await sendQueryStatusEmail(updatedQuery.email, updatedQuery.name, updatedQuery.subject, status);
    } catch (emailErr) {
      console.error('Error sending query status email:', emailErr);
    }

    res.status(200).json({ message: 'Query status updated successfully.', query: updatedQuery });
  } catch (err) {
    console.error('Error updating query status:', err);
    res.status(500).json({ message: 'Internal server error.' });
  }
});

export default router;
