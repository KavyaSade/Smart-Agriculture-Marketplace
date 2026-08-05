import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { authenticateToken } from '../middleware/auth.js';

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_key_agri_market_2026';

// helper function to generate a JSON Web Token (JWT) for a user
const generateToken = (user) => {
  return jwt.sign(
    { id: user._id, email: user.email, role: user.role },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
};

// @route   POST /api/auth/register
// @desc    registers a new farmer or buyer account in the MongoDB database
// @access  public
router.post('/register', async (req, res) => {
  try {
    const { fullName, email, phone, role, password } = req.body;

    // basic validation
    if (!fullName || !email || !phone || !role || !password) {
      return res.status(400).json({ message: 'All fields are required.' });
    }

    if (role !== 'buyer' && role !== 'farmer' && role !== 'user' && role !== 'retailer') {
      return res.status(400).json({ message: 'Invalid role selection.' });
    }

    // check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({ message: 'User with this email already exists.' });
    }

    // hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // create user document
    const newUser = new User({
      fullName,
      email: email.toLowerCase(),
      phone,
      role,
      password: hashedPassword
    });

    await newUser.save();

    // generate JWT token
    const token = generateToken(newUser);

    // send user profile and token
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

// @route   POST /api/auth/login
// @desc    authenticates user credentials against MongoDB and issues a JWT token
// @access  public
router.post('/login', async (req, res) => {
  try {
    const { email, password, role } = req.body;

    // basic validation
    if (!email || !password || !role) {
      return res.status(400).json({ message: 'Email, password, and role are required.' });
    }

    // find the user by email AND role
    const user = await User.findOne({ email: email.toLowerCase(), role });
    if (!user) {
      return res.status(400).json({ message: 'Invalid email, password, or role selection.' });
    }

    // Force update admin phone to 987654321
    if (role === 'admin' && user.phone !== '987654321') {
      user.phone = '987654321';
      await user.save();
    }

    // Check password
    let isMatch = false;
    if (user.password.startsWith('$2a$') || user.password.startsWith('$2b$')) {
      isMatch = await bcrypt.compare(password, user.password);
    } else {
      isMatch = (password === user.password);
    }
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid email, password, or role selection.' });
    }

    // generate JWT token
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

// @route   GET /api/auth/me
// @desc    retrieves the profile details of the currently authenticated user
// @access  private
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

// @route   POST /api/auth/google-login
// @desc    authenticates or registers a user via Google Sign-In with Firebase payload
// @access  public
router.post('/google-login', async (req, res) => {
  try {
    const { email, fullName, role } = req.body;

    if (!email || !fullName || !role) {
      return res.status(400).json({ message: 'Email, fullName, and role are required.' });
    }

    if (role !== 'buyer' && role !== 'farmer' && role !== 'user' && role !== 'retailer') {
      return res.status(400).json({ message: 'Invalid role selection.' });
    }

    // check if user already exists
    let user = await User.findOne({ email: email.toLowerCase() });
    
    if (user && user.role !== role) {
      return res.status(400).json({ message: 'Invalid email, password, or role selection.' });
    }
    
    if (!user) {
      // create user document with random/dummy password as they use Google Auth
      const dummyPassword = Math.random().toString(36).slice(-10);
      user = new User({
        fullName,
        email: email.toLowerCase(),
        phone: 'Google Auth User',
        role,
        password: dummyPassword
      });
      await user.save();
    }

    // generate JWT token
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
    console.error('Google login error:', error);
    res.status(500).json({ message: 'Internal Server Error.' });
  }
});

export default router;

