import { Router } from 'express';
import mongoose from 'mongoose';
import User from '../models/User.js';
import Product from '../models/product.js';
import Review from '../models/Review.js';
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

// Retrieve the authenticated user's own profile
router.get('/profile/me', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User profile not found.' });
    }
    res.status(200).json(user);
  } catch (error) {
    console.error('Error fetching user profile:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update user profile details
router.put('/profile', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    const { 
      fullName, 
      phone, 
      bio, 
      farmName, 
      experience, 
      addressStreet, 
      addressCity, 
      addressState, 
      addressPin, 
      profilePhoto, 
      sector 
    } = req.body;

    if (fullName) user.fullName = fullName;
    if (phone) user.phone = phone;
    user.bio = bio !== undefined ? bio : user.bio;
    user.farmName = farmName !== undefined ? farmName : user.farmName;
    user.experience = experience !== undefined ? experience : user.experience;
    user.addressStreet = addressStreet !== undefined ? addressStreet : user.addressStreet;
    user.addressCity = addressCity !== undefined ? addressCity : user.addressCity;
    user.addressState = addressState !== undefined ? addressState : user.addressState;
    user.addressPin = addressPin !== undefined ? addressPin : user.addressPin;
    user.profilePhoto = profilePhoto !== undefined ? profilePhoto : user.profilePhoto;
    user.sector = sector !== undefined ? sector : user.sector;

    await user.save();

    res.status(200).json({
      message: 'Profile updated successfully.',
      user
    });
  } catch (error) {
    console.error('Error updating user profile:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Toggle two-factor authentication
router.put('/profile/2fa', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    const { enabled } = req.body;
    if (enabled === undefined) {
      return res.status(400).json({ message: 'enabled state is required.' });
    }

    user.isTwoFactorEnabled = !!enabled;
    // If disabling, clear active 2fa code
    if (!enabled) {
      user.twoFactorCode = null;
      user.twoFactorExpires = null;
    }
    await user.save();

    res.status(200).json({
      message: `Two-factor authentication ${enabled ? 'enabled' : 'disabled'} successfully.`,
      isTwoFactorEnabled: user.isTwoFactorEnabled
    });
  } catch (error) {
    console.error('Error toggling 2FA:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Retrieve a farmer's profile including their listings and average rating (Public)
router.get('/farmer/:email', async (req, res) => {
  try {
    const farmer = await User.findOne({ email: req.params.email.toLowerCase(), role: 'farmer' });
    if (!farmer) {
      return res.status(404).json({ message: 'Farmer not found.' });
    }

    const listings = await Product.find({ farmerEmail: farmer.email });


    let totalReviews = 0;
    let sumRatings = 0;
    listings.forEach(listing => {
      if (listing.totalReviews && listing.totalReviews > 0) {
        totalReviews += listing.totalReviews;
        sumRatings += (listing.averageRating || 0) * listing.totalReviews;
      }
    });
    const averageRating = totalReviews > 0 ? (sumRatings / totalReviews) : 0;

    res.status(200).json({
      farmer: {
        id: farmer._id,
        fullName: farmer.fullName,
        email: farmer.email,
        phone: farmer.phone,
        role: farmer.role,
        bio: farmer.bio,
        farmName: farmer.farmName,
        experience: farmer.experience,
        addressStreet: farmer.addressStreet,
        addressCity: farmer.addressCity,
        addressState: farmer.addressState,
        addressPin: farmer.addressPin,
        profilePhoto: farmer.profilePhoto,
        sector: farmer.sector,
        averageRating,
        totalReviews
      },
      listings
    });
  } catch (error) {
    console.error('Error fetching farmer profile:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Retrieve all reviews for a farmer's products (Public/Farmer)
router.get('/farmer/:email/reviews', async (req, res) => {
  try {
    const products = await Product.find({ farmerEmail: req.params.email.toLowerCase() });
    const productIds = products.map(p => p._id);
    
    const reviews = await Review.find({ product: { $in: productIds } })
      .populate('product', 'name title image price')
      .sort({ createdAt: -1 });

    res.status(200).json(reviews);
  } catch (error) {
    console.error('Error fetching farmer reviews:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
