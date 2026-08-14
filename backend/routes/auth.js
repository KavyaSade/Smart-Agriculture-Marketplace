import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { authenticateToken } from '../middleware/auth.js';
import { sendOTPEmail } from '../utils/email.js';
import { sendPushNotification } from '../utils/fcm.js';

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_key_agri_market_2026';

// helper function to generate a JSON Web Token (JWT) for a user
const generateToken = (user) => {
  return jwt.sign(
    { id: user._id, email: user.email, role: user.role, fullName: user.fullName },
    JWT_SECRET,
    { expiresIn: '24h' }
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

    // Trigger FCM notification: "New user registration" to Admins
    try {
      const admins = await User.find({ role: 'admin' });
      for (const admin of admins) {
        await sendPushNotification(admin._id, {
          title: 'New User Registered',
          body: `A new user "${newUser.fullName}" has registered on the platform as a "${newUser.role}".`,
          type: 'new_user_registered',
          referenceId: newUser._id.toString(),
          referenceType: 'User'
        });
      }
    } catch (notifErr) {
      console.error('Error sending registration notification:', notifErr);
    }

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
        role: newUser.role,
        bio: newUser.bio,
        farmName: newUser.farmName,
        experience: newUser.experience,
        addressStreet: newUser.addressStreet,
        addressCity: newUser.addressCity,
        addressState: newUser.addressState,
        addressPin: newUser.addressPin,
        profilePhoto: newUser.profilePhoto,
        sector: newUser.sector,
        isTwoFactorEnabled: newUser.isTwoFactorEnabled
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
    console.log(`[Login Attempt] Email: "${email}", Role: "${role}"`);

    // basic validation
    if (!email || !password || !role) {
      console.log(`[Login Failed] Missing required fields`);
      return res.status(400).json({ message: 'Email, password, and role are required.' });
    }

    // find the user by email AND role
    const user = await User.findOne({ email: email.toLowerCase(), role });
    if (!user) {
      console.log(`[Login Failed] User not found with Email: "${email.toLowerCase()}" and Role: "${role}"`);
      // check if user exists with just email to help diagnose
      const emailOnlyUser = await User.findOne({ email: email.toLowerCase() });
      if (emailOnlyUser) {
        console.log(`[Login Diagnosis] User found with this email but different role: "${emailOnlyUser.role}"`);
      } else {
        console.log(`[Login Diagnosis] Email does not exist in database at all`);
      }
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
    console.log(`[Login Attempt] Password matched: ${isMatch}`);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid email, password, or role selection.' });
    }

    // Intercept with 2FA check (skip for admin)
    if (user.isTwoFactorEnabled && role !== 'admin') {
      const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
      user.twoFactorCode = otpCode;
      user.twoFactorExpires = new Date(Date.now() + 5 * 60 * 1000); // 5 mins
      await user.save();

      console.log(`[2FA OTP GENERATED (Login)] User: ${user.email} (${user.role})`);

      // send email to user
      await sendOTPEmail(user.email, otpCode);

      return res.status(200).json({
        require2FA: true,
        email: user.email,
        role: user.role
      });
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
        role: user.role,
        bio: user.bio,
        farmName: user.farmName,
        experience: user.experience,
        addressStreet: user.addressStreet,
        addressCity: user.addressCity,
        addressState: user.addressState,
        addressPin: user.addressPin,
        profilePhoto: user.profilePhoto,
        sector: user.sector,
        isTwoFactorEnabled: user.isTwoFactorEnabled
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
        role: user.role,
        bio: user.bio,
        farmName: user.farmName,
        experience: user.experience,
        addressStreet: user.addressStreet,
        addressCity: user.addressCity,
        addressState: user.addressState,
        addressPin: user.addressPin,
        profilePhoto: user.profilePhoto,
        sector: user.sector,
        isTwoFactorEnabled: user.isTwoFactorEnabled
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

      // Trigger FCM notification: "New user registration" to Admins
      try {
        const admins = await User.find({ role: 'admin' });
        for (const admin of admins) {
          await sendPushNotification(admin._id, {
            title: 'New User Registered',
            body: `A new user "${user.fullName}" has registered on the platform as a "${user.role}" via Google.`,
            type: 'new_user_registered',
            referenceId: user._id.toString(),
            referenceType: 'User'
          });
        }
      } catch (notifErr) {
        console.error('Error sending Google registration notification:', notifErr);
      }
    }

    // Intercept with 2FA check (skip for admin)
    if (user.isTwoFactorEnabled && role !== 'admin') {
      const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
      user.twoFactorCode = otpCode;
      user.twoFactorExpires = new Date(Date.now() + 5 * 60 * 1000); // 5 mins
      await user.save();

      console.log(`[2FA OTP GENERATED (Google Login)] User: ${user.email} (${user.role})`);

      // send email to user
      await sendOTPEmail(user.email, otpCode);

      return res.status(200).json({
        require2FA: true,
        email: user.email,
        role: user.role
      });
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
        role: user.role,
        bio: user.bio,
        farmName: user.farmName,
        experience: user.experience,
        addressStreet: user.addressStreet,
        addressCity: user.addressCity,
        addressState: user.addressState,
        addressPin: user.addressPin,
        profilePhoto: user.profilePhoto,
        sector: user.sector,
        isTwoFactorEnabled: user.isTwoFactorEnabled
      }
    });

  } catch (error) {
    console.error('Google login error:', error);
    res.status(500).json({ message: 'Internal Server Error.' });
  }
});

// @route   POST /api/auth/verify-2fa
// @desc    verifies the 2FA code and issues a JWT token
// @access  public
router.post('/verify-2fa', async (req, res) => {
  try {
    const { email, role, code } = req.body;

    if (!email || !role || !code) {
      return res.status(400).json({ message: 'Email, role, and verification code are required.' });
    }

    const user = await User.findOne({ email: email.toLowerCase(), role });
    if (!user) {
      return res.status(400).json({ message: 'User not found.' });
    }

    if (!user.isTwoFactorEnabled) {
      return res.status(400).json({ message: 'Two-factor authentication is not enabled for this user.' });
    }

    // Check code matches and not expired
    if (!user.twoFactorCode || user.twoFactorCode !== code || new Date() > user.twoFactorExpires) {
      return res.status(400).json({ message: 'Invalid or expired verification code.' });
    }

    // Clear code and save
    user.twoFactorCode = null;
    user.twoFactorExpires = null;
    await user.save();

    // generate JWT token
    const token = generateToken(user);

    res.status(200).json({
      token,
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        phone: user.phone,
        role: user.role,
        bio: user.bio,
        farmName: user.farmName,
        experience: user.experience,
        addressStreet: user.addressStreet,
        addressCity: user.addressCity,
        addressState: user.addressState,
        addressPin: user.addressPin,
        profilePhoto: user.profilePhoto,
        sector: user.sector,
        isTwoFactorEnabled: user.isTwoFactorEnabled
      }
    });
  } catch (error) {
    console.error('2FA verification error:', error);
    res.status(500).json({ message: 'Internal Server Error.' });
  }
});

// @route   POST /api/auth/resend-2fa
// @desc    regenerates and resends/returns a new 2FA code
// @access  public
router.post('/resend-2fa', async (req, res) => {
  try {
    const { email, role } = req.body;

    if (!email || !role) {
      return res.status(400).json({ message: 'Email and role are required.' });
    }

    const user = await User.findOne({ email: email.toLowerCase(), role });
    if (!user) {
      return res.status(400).json({ message: 'User not found.' });
    }

    if (!user.isTwoFactorEnabled) {
      return res.status(400).json({ message: 'Two-factor authentication is not enabled for this user.' });
    }

    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    user.twoFactorCode = otpCode;
    user.twoFactorExpires = new Date(Date.now() + 5 * 60 * 1000); // 5 mins
    await user.save();

    console.log(`[2FA OTP RESENT] User: ${user.email} (${user.role})`);

    // send email to user
    await sendOTPEmail(user.email, otpCode);

    res.status(200).json({
      message: 'Verification code resent successfully.'
    });
  } catch (error) {
    console.error('2FA resend error:', error);
    res.status(500).json({ message: 'Internal Server Error.' });
  }
});

export default router;

