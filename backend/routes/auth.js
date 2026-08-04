import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { authenticateToken } from '../middleware/auth.js';

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_key_agri_market_2026';

// Helper to generate JWT token
const generateToken = (user) => {
  return jwt.sign(
    { id: user._id, email: user.email, role: user.role },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
};

/**
 * @route   POST /api/auth/register
 * @desc    Register a new farmer or buyer user in MongoDB Atlas
 * @access  Public
 */
router.post('/register', async (req, res) => {
  try {
    const { fullName, email, phone, role, password } = req.body;

    // Basic Validation
    if (!fullName || !email || !phone || !role || !password) {
      return res.status(400).json({ message: 'All fields are required.' });
    }

    if (role !== 'buyer' && role !== 'farmer') {
      return res.status(400).json({ message: 'Invalid role selection.' });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({ message: 'User with this email already exists.' });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user document
    const newUser = new User({
      fullName,
      email: email.toLowerCase(),
      phone,
      role,
      password: hashedPassword
    });

    await newUser.save();

    // Generate JWT token
    const token = generateToken(newUser);

    // Send user profile and token
    res.status(201).json({
      token,
      user: {
        id: newUser._id,
        fullName: newUser.fullName,
        email: newUser.email,
        phone: newUser.phone,
        role: newUser.role
      }
    });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Internal Server Error.' });
  }
});

/**
 * @route   POST /api/auth/login
 * @desc    Authenticate user against MongoDB Atlas and get token
 * @access  Public
 */
router.post('/login', async (req, res) => {
  try {
    const { email, password, role } = req.body;

    // Basic Validation
    if (!email || !password || !role) {
      return res.status(400).json({ message: 'Email, password, and role are required.' });
    }

    // Find the user by email AND role
    const user = await User.findOne({ email: email.toLowerCase(), role });
    if (!user) {
      return res.status(400).json({ message: 'Invalid email, password, or role selection.' });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid email, password, or role selection.' });
    }

    // Generate JWT token
    const token = generateToken(user);

    res.status(200).json({
      token,
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        phone: user.phone,
        role: user.role
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Internal Server Error.' });
  }
});

/**
 * @route   GET /api/auth/me
 * @desc    Get currently authenticated user details from MongoDB Atlas
 * @access  Private
 */
router.get('/me', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ message: 'User profile not found.' });
    }

    res.status(200).json({
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        phone: user.phone,
        role: user.role
      }
    });

  } catch (error) {
    console.error('Fetch profile error:', error);
    res.status(500).json({ message: 'Internal Server Error.' });
  }
});

export default router;
