import mongoose from 'mongoose';
import Product from '../models/product.js';
import Order from '../models/orders.js';
import User from '../models/User.js';

/**
 * Validates a coupon code against the cart and buyer details.
 * Re-fetches products from the DB to prevent price tampering from React.
 * 
 * @param {Object} coupon
 * @param {Array} cartItems
 * @param {string} buyerEmail
 * @returns {Promise<Object>}
 */
export async function validateCouponForCart(coupon, cartItems, buyerEmail) {
  if (!coupon) {
    throw new Error('Coupon does not exist');
  }

  if (!coupon.isActive) {
    throw new Error('Coupon is not active');
  }

  const now = new Date();
  if (coupon.startDate && now < new Date(coupon.startDate)) {
    throw new Error('Coupon is not active yet');
  }

  if (coupon.expiryDate && now > new Date(coupon.expiryDate)) {
    throw new Error('Coupon has expired');
  }

  // Check overall usage limit
  if (coupon.usageLimit !== null && coupon.usageLimit !== undefined) {
    if (coupon.usedCount >= coupon.usageLimit) {
      throw new Error('Coupon usage limit has been reached');
    }
  }

  // Check user-specific limit
  if (buyerEmail) {
    const distinctCheckouts = await Order.distinct('checkoutId', {
      buyerEmail: buyerEmail.toLowerCase(),
      couponCode: coupon.code,
      status: { $ne: 'cancelled' }
    });

    if (distinctCheckouts.length >= coupon.perUserLimit) {
      throw new Error('You have already used this coupon');
    }
  }

  // Re-fetch products from db to get reliable prices, category and seller
  const productIds = cartItems.map(item => item._id || item.id);
  const dbProducts = await Product.find({ _id: { $in: productIds } });
  
  const productMap = new Map(dbProducts.map(p => [p._id.toString(), p]));

  let eligibleSubtotal = 0;
  let hasEligibleItems = false;
  const eligibleItems = [];

  for (const item of cartItems) {
    const itemId = (item._id || item.id).toString();
    const dbProd = productMap.get(itemId);
    if (!dbProd) continue;

    // Check product eligibility
    const isProductEligible = coupon.applicableProducts && coupon.applicableProducts.length > 0
      ? coupon.applicableProducts.some(p => {
          const pId = p && typeof p === 'object' && p._id ? p._id.toString() : p.toString();
          return pId === itemId;
        })
      : true;

    // Check category eligibility
    const isCategoryEligible = coupon.applicableCategories && coupon.applicableCategories.length > 0
      ? coupon.applicableCategories.includes(dbProd.category)
      : true;

    // Check farmer/seller eligibility
    let sellerId = dbProd.seller?.toString();
    if (!sellerId && dbProd.farmerEmail) {
      const farmerUser = await User.findOne({ email: dbProd.farmerEmail.toLowerCase() });
      if (farmerUser) {
        sellerId = farmerUser._id.toString();
      }
    }

    const isFarmerEligible = coupon.applicableFarmers && coupon.applicableFarmers.length > 0
      ? coupon.applicableFarmers.some(f => {
          const fId = f && typeof f === 'object' && f._id ? f._id.toString() : f.toString();
          return fId === sellerId;
        })
      : true;

    if (isProductEligible && isCategoryEligible && isFarmerEligible) {
      hasEligibleItems = true;
      const itemSubtotal = dbProd.price * item.quantity;
      eligibleSubtotal += itemSubtotal;
      eligibleItems.push({
        id: itemId,
        quantity: item.quantity,
        price: dbProd.price,
        subtotal: itemSubtotal
      });
    }
  }

  if (!hasEligibleItems) {
    throw new Error('Coupon is not applicable to these products');
  }

  if (eligibleSubtotal < coupon.minimumOrderAmount) {
    throw new Error(`Minimum order amount is ₹${coupon.minimumOrderAmount.toLocaleString()}`);
  }

  // Calculate discount
  let discountAmount = 0;
  if (coupon.discountType === 'percentage') {
    discountAmount = eligibleSubtotal * (coupon.discountValue / 100);
    if (coupon.maximumDiscountAmount > 0 && discountAmount > coupon.maximumDiscountAmount) {
      discountAmount = coupon.maximumDiscountAmount;
    }
  } else if (coupon.discountType === 'fixed') {
    discountAmount = coupon.discountValue;
  }

  // Prevent discount from exceeding the eligible subtotal
  discountAmount = Math.min(discountAmount, eligibleSubtotal);
  // Round to nearest integer or 2 decimal places
  discountAmount = Math.round(discountAmount * 100) / 100;

  return {
    discountAmount,
    eligibleSubtotal,
    eligibleItems,
    productMap
  };
}
