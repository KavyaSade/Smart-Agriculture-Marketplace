import { Router } from 'express';
import Coupon from '../models/Coupon.js';
import Order from '../models/orders.js';
import Product from '../models/product.js';
import User from '../models/User.js';
import { authenticateToken } from '../middleware/auth.js';
import { validateCouponForCart } from '../utils/couponHelper.js';

const router = Router();

// Middleware to restrict access to Sellers (Farmers or Retailers) and Admins
const verifySellerOrAdmin = (req, res, next) => {
  if (req.user && (req.user.role === 'admin' || req.user.role === 'farmer' || req.user.role === 'retailer')) {
    next();
  } else {
    res.status(403).json({ message: 'Access denied. Sellers and administrators only.' });
  }
};

// Retrieve all coupons (filtered by user role)
router.get('/', authenticateToken, async (req, res) => {
  try {
    let query = {};
    if (req.user.role === 'farmer' || req.user.role === 'retailer') {
      // Farmers only see their own coupons
      query.createdBy = req.user.id;
    } else if (req.user.role === 'buyer') {
      // Buyers only see active and valid coupons
      const now = new Date();
      query = {
        isActive: true,
        $and: [
          { $or: [{ startDate: { $exists: false } }, { startDate: null }, { startDate: { $lte: now } }] },
          { $or: [{ expiryDate: { $exists: false } }, { expiryDate: null }, { expiryDate: { $gte: now } }] }
        ]
      };
    }

    const coupons = await Coupon.find(query)
      .populate('applicableProducts', 'name title price')
      .populate('applicableFarmers', 'fullName email')
      .sort({ createdAt: -1 });

    res.status(200).json(coupons);
  } catch (error) {
    console.error('Error fetching coupons:', error);
    res.status(500).json({ message: 'Error retrieving coupons.' });
  }
});

// Create a new coupon
router.post('/', authenticateToken, verifySellerOrAdmin, async (req, res) => {
  try {
    const {
      code,
      description,
      discountType,
      discountValue,
      minimumOrderAmount,
      maximumDiscountAmount,
      startDate,
      expiryDate,
      usageLimit,
      perUserLimit,
      applicableProducts,
      applicableCategories,
      applicableFarmers
    } = req.body;

    if (!code || !discountType || !discountValue) {
      return res.status(400).json({ message: 'Missing required coupon fields (code, discountType, discountValue).' });
    }


    const formattedCode = code.trim().toUpperCase();

    // Check if code is unique
    const existing = await Coupon.findOne({ code: formattedCode });
    if (existing) {
      return res.status(400).json({ message: `Coupon with code "${formattedCode}" already exists.` });
    }

    const couponData = {
      code: formattedCode,
      description,
      discountType,
      discountValue: parseFloat(discountValue),
      minimumOrderAmount: minimumOrderAmount ? parseFloat(minimumOrderAmount) : 0,
      maximumDiscountAmount: maximumDiscountAmount ? parseFloat(maximumDiscountAmount) : 0,
      startDate: startDate ? new Date(startDate) : undefined,
      expiryDate: expiryDate ? new Date(expiryDate) : undefined,
      usageLimit: usageLimit ? parseInt(usageLimit) : null,
      perUserLimit: perUserLimit ? parseInt(perUserLimit) : 1,
      applicableProducts,
      applicableCategories,
      createdBy: req.user.id
    };

    // Role-based restrictions on applicableFarmers
    if (req.user.role === 'admin') {
      couponData.applicableFarmers = applicableFarmers;
    } else {
      couponData.applicableFarmers = [req.user.id];
    }

    const coupon = new Coupon(couponData);
    await coupon.save();
    res.status(201).json(coupon);
  } catch (error) {
    console.error('Error creating coupon:', error);
    res.status(500).json({ message: 'Error creating coupon: ' + error.message });
  }
});

// Edit a coupon
router.put('/:id', authenticateToken, verifySellerOrAdmin, async (req, res) => {
  try {
    const coupon = await Coupon.findById(req.params.id);
    if (!coupon) {
      return res.status(404).json({ message: 'Coupon not found.' });
    }

    //farmers can only edit their own coupons
    if (req.user.role !== 'admin' && coupon.createdBy.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Forbidden. You can only edit your own coupons.' });
    }

    const {
      description,
      discountType,
      discountValue,
      minimumOrderAmount,
      maximumDiscountAmount,
      startDate,
      expiryDate,
      usageLimit,
      perUserLimit,
      applicableProducts,
      applicableCategories,
      applicableFarmers,
      isActive
    } = req.body;

    coupon.description = description !== undefined ? description : coupon.description;
    coupon.discountType = discountType !== undefined ? discountType : coupon.discountType;
    coupon.discountValue = discountValue !== undefined ? parseFloat(discountValue) : coupon.discountValue;
    coupon.minimumOrderAmount = minimumOrderAmount !== undefined ? parseFloat(minimumOrderAmount) : coupon.minimumOrderAmount;
    coupon.maximumDiscountAmount = maximumDiscountAmount !== undefined ? parseFloat(maximumDiscountAmount) : coupon.maximumDiscountAmount;
    coupon.startDate = startDate !== undefined ? (startDate ? new Date(startDate) : null) : coupon.startDate;
    coupon.expiryDate = expiryDate !== undefined ? (expiryDate ? new Date(expiryDate) : null) : coupon.expiryDate;
    coupon.usageLimit = usageLimit !== undefined ? (usageLimit ? parseInt(usageLimit) : null) : coupon.usageLimit;
    coupon.perUserLimit = perUserLimit !== undefined ? parseInt(perUserLimit) : coupon.perUserLimit;
    coupon.applicableProducts = applicableProducts !== undefined ? applicableProducts : coupon.applicableProducts;
    coupon.applicableCategories = applicableCategories !== undefined ? applicableCategories : coupon.applicableCategories;
    coupon.isActive = isActive !== undefined ? isActive : coupon.isActive;

    if (req.user.role === 'admin') {
      coupon.applicableFarmers = applicableFarmers !== undefined ? applicableFarmers : coupon.applicableFarmers;
    } else {
      // Force farmer restrictions
      coupon.applicableFarmers = [req.user.id];
    }

    await coupon.save();
    res.status(200).json(coupon);
  } catch (error) {
    console.error('Error updating coupon:', error);
    res.status(500).json({ message: 'Error updating coupon: ' + error.message });
  }
});

// Delete a coupon
router.delete('/:id', authenticateToken, verifySellerOrAdmin, async (req, res) => {
  try {
    const coupon = await Coupon.findById(req.params.id);
    if (!coupon) {
      return res.status(404).json({ message: 'Coupon not found.' });
    }

    //farmers can only delete their own coupons
    if (req.user.role !== 'admin' && coupon.createdBy.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Forbidden. You can only delete your own coupons.' });
    }

    await Coupon.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: 'Coupon deleted successfully.' });
  } catch (error) {
    console.error('Error deleting coupon:', error);
    res.status(500).json({ message: 'Error deleting coupon: ' + error.message });
  }
});

// Validate a coupon for cart items
router.post('/validate', authenticateToken, async (req, res) => {
  try {
    const { code, cart } = req.body;
    if (!code || !cart || !Array.isArray(cart)) {
      return res.status(400).json({ message: 'Missing coupon code or cart items.' });
    }

    const coupon = await Coupon.findOne({ code: code.trim().toUpperCase() }).populate('applicableFarmers', 'fullName');
    if (!coupon) {
      return res.status(404).json({ message: 'Coupon not found' });
    }

    const validation = await validateCouponForCart(coupon, cart, req.user.email);
    res.status(200).json({
      success: true,
      coupon: {
        code: coupon.code,
        description: coupon.description,
        discountType: coupon.discountType,
        discountValue: coupon.discountValue
      },
      discountAmount: validation.discountAmount,
      eligibleSubtotal: validation.eligibleSubtotal
    });
  } catch (error) {
    res.status(400).json({ message: error.message || 'Validation failed' });
  }
});

// Check eligibility of all active coupons for a checkout cart
router.post('/check-eligibility', authenticateToken, async (req, res) => {
  try {
    const { cart } = req.body;
    if (!cart || !Array.isArray(cart)) {
      return res.status(400).json({ message: 'Missing cart items.' });
    }

    // Find all active coupons
    const coupons = await Coupon.find({ isActive: true }).populate('applicableFarmers', 'fullName');
    const results = [];

    for (const coupon of coupons) {
      try {
        const validation = await validateCouponForCart(coupon, cart, req.user.email);
        results.push({
          coupon: {
            _id: coupon._id,
            code: coupon.code,
            description: coupon.description,
            discountType: coupon.discountType,
            discountValue: coupon.discountValue,
            minimumOrderAmount: coupon.minimumOrderAmount,
            maximumDiscountAmount: coupon.maximumDiscountAmount,
            expiryDate: coupon.expiryDate
          },
          eligible: true,
          discountAmount: validation.discountAmount,
          eligibleSubtotal: validation.eligibleSubtotal
        });
      } catch (error) {
        // Collect ineligibility reason
        results.push({
          coupon: {
            _id: coupon._id,
            code: coupon.code,
            description: coupon.description,
            discountType: coupon.discountType,
            discountValue: coupon.discountValue,
            minimumOrderAmount: coupon.minimumOrderAmount,
            maximumDiscountAmount: coupon.maximumDiscountAmount,
            expiryDate: coupon.expiryDate
          },
          eligible: false,
          message: error.message
        });
      }
    }

    res.status(200).json(results);
  } catch (error) {
    console.error('Error checking coupons eligibility:', error);
    res.status(500).json({ message: 'Error checking coupons eligibility.' });
  }
});

// Retrieve coupon usage analytics
router.get('/analytics/usage', authenticateToken, verifySellerOrAdmin, async (req, res) => {
  try {
    let query = {};
    if (req.user.role === 'farmer' || req.user.role === 'retailer') {
      // Find coupons created by this seller
      const myCoupons = await Coupon.find({ createdBy: req.user.id });
      const codes = myCoupons.map(c => c.code);
      query = { couponCode: { $in: codes } };
    } else {
      // Admin sees all coupon usages
      query = { couponCode: { $exists: true, $ne: null } };
    }

    // Find all orders that utilized these coupons
    const orders = await Order.find(query).sort({ createdAt: -1 });

    // Group analytics by coupon code
    const analytics = {};
    let totalDiscountAll = 0;
    let totalSalesAll = 0;

    orders.forEach(order => {
      const code = order.couponCode;
      if (!analytics[code]) {
        analytics[code] = {
          code: code,
          usageCount: 0,
          totalDiscount: 0,
          totalSales: 0,
          orders: []
        };
      }
      
      const discount = order.discountAmount || 0;
      const sales = order.amount || 0; // finalAmount
      
      analytics[code].usageCount += 1;
      analytics[code].totalDiscount += discount;
      analytics[code].totalSales += sales;
      analytics[code].orders.push({
        orderId: order.id,
        buyerName: order.buyerName,
        buyerEmail: order.buyerEmail,
        productName: order.productName,
        originalAmount: order.originalAmount,
        discountAmount: discount,
        finalAmount: sales,
        date: order.date,
        status: order.status
      });

      totalDiscountAll += discount;
      totalSalesAll += sales;
    });

    res.status(200).json({
      summary: {
        totalUsage: orders.length,
        totalDiscountGiven: totalDiscountAll,
        totalSalesGenerated: totalSalesAll
      },
      coupons: Object.values(analytics)
    });
  } catch (error) {
    console.error('Error fetching coupon usage analytics:', error);
    res.status(500).json({ message: 'Error retrieving coupon usage analytics.' });
  }
});

export default router;
