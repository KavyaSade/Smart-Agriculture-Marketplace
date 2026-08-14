import { Router } from 'express';
import Order from '../models/orders.js';
import Product from '../models/product.js';
import Coupon from '../models/Coupon.js';
import { authenticateToken } from '../middleware/auth.js';
import { sendPushNotification } from '../utils/fcm.js';
import User from '../models/User.js';
import { validateCouponForCart } from '../utils/couponHelper.js';

const router = Router();

const sendOrderStatusNotification = async (order) => {
  try {
    const buyer = await User.findOne({ email: order.buyerEmail.toLowerCase() });
    if (!buyer) return;

    let title = '';
    let body = '';
    let type = '';

    if (order.status === 'shipped') {
      await sendPushNotification(buyer._id, {
        title: 'Order Accepted',
        body: `Your order ${order.id} has been accepted by the farmer.`,
        type: 'order_accepted',
        referenceId: order._id.toString(),
        referenceType: 'Order'
      });

      title = 'Order Shipped';
      body = `Your order ${order.id} has been shipped. Tracking: ${order.trackingNumber || 'N/A'}`;
      type = 'order_shipped';
    } else if (order.status === 'Out for Delivery') {
      title = 'Order Out for Delivery';
      body = `Your order ${order.id} is out for delivery today.`;
      type = 'order_out_for_delivery';
    } else if (order.status === 'delivered') {
      title = 'Order Delivered';
      body = `Your order ${order.id} has been marked as delivered.`;
      type = 'order_delivered';
    } else if (order.status === 'cancelled') {
      title = 'Order Cancelled/Rejected';
      body = `Your order ${order.id} has been cancelled or rejected.`;
      type = 'order_cancelled';
    }

    if (title && body && type) {
      await sendPushNotification(buyer._id, {
        title,
        body,
        type,
        referenceId: order._id.toString(),
        referenceType: 'Order'
      });
    }
  } catch (err) {
    console.error('Error sending order status notification:', err);
  }
};

// Retrieve orders list (filtered by user role)
router.get('/', authenticateToken, async (req, res) => {
  try {
    let query = {};
    if (req.user.role === 'retailer') {
      query.seller = req.user.id;
    } else if (req.user.role === 'farmer') {
      query.farmerEmail = req.user.email;
    } else if (req.user.role === 'buyer') {
      query.buyerEmail = req.user.email;
    }
    // If admin, query stays empty (retrieves all orders)

    const orders = await Order.find(query).sort({ createdAt: -1 });
    res.status(200).json(orders);
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving orders.' });
  }
});

// Retrieve all the orders placed by the logged-in buyer.
router.get('/buyer', authenticateToken, async (req, res) => {
  try {
    const orders = await Order.find({ buyerEmail: req.user.email }).sort({ createdAt: -1 });
    res.status(200).json(orders);
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving buyer orders.' });
  }
});

// Retrieve all the orders received by the logged-in farmer.
router.get('/farmer', authenticateToken, async (req, res) => {
  try {
    const orders = await Order.find({ farmerEmail: req.user.email }).sort({ createdAt: -1 });
    res.status(200).json(orders);
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving farmer orders.' });
  }
});

// Placing a new order and deducting stock level.
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { productId, quantity, buyerPhone, buyerAddress, couponCode, checkoutId, cart } = req.body;


    if (!productId || !quantity || quantity <= 0) {
      return res.status(400).json({ message: 'Invalid product or quantity input.' });
    }


    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: 'Product listing not found.' });
    }


    if (product.stock < quantity) {
      return res.status(400).json({ message: 'Insufficient stock level.' });
    }


    // Deduct stock immediately
    product.stock = Math.max(0, product.stock - quantity);
    if (product.stock === 0) {
      product.inStock = false;
    }
    await product.save();

    // Calculate coupon discount
    let couponDetails = {
      couponCode: undefined,
      couponId: undefined,
      discountAmount: 0,
      originalAmount: product.price * quantity,
      finalAmount: product.price * quantity,
      checkoutId: checkoutId
    };

    if (couponCode) {
      const coupon = await Coupon.findOne({ code: couponCode.trim().toUpperCase() });
      if (!coupon) {
        return res.status(400).json({ message: 'Coupon not found' });
      }

      // Check if this checkout session already incremented the coupon count
      let alreadyConsumed = false;
      if (checkoutId) {
        alreadyConsumed = await Order.exists({ checkoutId, couponCode: coupon.code });
      }

      if (!alreadyConsumed) {
        // Automatic update to increment usedCount safely
        const updatedCoupon = await Coupon.findOneAndUpdate(
          {
            code: coupon.code,
            isActive: true,
            $or: [
              { usageLimit: { $exists: false } },
              { usageLimit: null },
              { $expr: { $lt: ["$usedCount", "$usageLimit"] } }
            ]
          },
          { $inc: { usedCount: 1 } },
          { new: true }
        );

        if (!updatedCoupon) {
          return res.status(400).json({ message: 'Coupon limit has been reached or is inactive' });
        }
      }

      // Re-validate the cart to determine discount
      const itemsToValidate = cart && Array.isArray(cart) ? cart : [{ id: productId, quantity }];
      const validation = await validateCouponForCart(coupon, itemsToValidate, req.user.email);
      
      const currentItemSubtotal = product.price * quantity;
      const currentItem = validation.eligibleItems.find(item => item.id === productId.toString());

      if (currentItem) {
        // Proportional discount distribution
        const proportionalDiscount = validation.discountAmount * (currentItem.subtotal / validation.eligibleSubtotal);
        const roundedProportionalDiscount = Math.round(proportionalDiscount * 100) / 100;
        
        couponDetails.couponCode = coupon.code;
        couponDetails.couponId = coupon._id;
        couponDetails.discountAmount = roundedProportionalDiscount;
        couponDetails.finalAmount = Math.max(0, currentItemSubtotal - roundedProportionalDiscount);
      }
    }

    // order invoice.
    const trackingNumber = 'AGRI-TRK-' + Math.floor(100000 + Math.random() * 900000);
    const order = new Order({
      id: 'ORD-' + Math.floor(1000 + Math.random() * 9000),
      productName: product.name || product.title,
      productId: product._id,
      quantity,
      unit: product.stockUnit || product.unit || 'kg',
      amount: couponDetails.finalAmount,
      buyerEmail: req.user.email,
      buyerName: req.user.fullName || 'Buyer User',
      buyerPhone,
      buyerAddress,
      farmerEmail: product.farmerEmail || 'seller@gmail.com',
      farmerName: product.farmerName || 'Seller User',
      seller: product.seller,
      // Format current date
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }),
      status: 'pending',
      trackingNumber,
      deliveryStatus: 'placed',
      
      checkoutId: couponDetails.checkoutId,
      couponCode: couponDetails.couponCode,
      couponId: couponDetails.couponId,
      discountAmount: couponDetails.discountAmount,
      originalAmount: couponDetails.originalAmount,
      finalAmount: couponDetails.finalAmount
    });

    await order.save();

    // Trigger FCM notifications for new order
    try {
      const buyer = await User.findOne({ email: req.user.email.toLowerCase() });
      const seller = product.seller 
        ? await User.findById(product.seller) 
        : await User.findOne({ email: product.farmerEmail.toLowerCase() });

      if (buyer) {
        await sendPushNotification(buyer._id, {
          title: 'Payment Successful',
          body: `Payment of ₹${order.amount.toLocaleString()} was verified successfully.`,
          type: 'payment_success',
          referenceId: order._id.toString(),
          referenceType: 'Order'
        });
        await sendPushNotification(buyer._id, {
          title: 'Order Placed Successfully',
          body: `Your order ${order.id} for "${order.productName}" has been successfully placed.`,
          type: 'order_placed',
          referenceId: order._id.toString(),
          referenceType: 'Order'
        });
      }

      if (seller) {
        await sendPushNotification(seller._id, {
          title: 'New Order Received',
          body: `You received a new order ${order.id} for ${order.quantity} ${order.unit} of "${order.productName}" from ${order.buyerName}.`,
          type: 'order_received',
          referenceId: order._id.toString(),
          referenceType: 'Order'
        });
        await sendPushNotification(seller._id, {
          title: 'Payment Captured',
          body: `Verification completed for order ${order.id} payment. Payout will trigger upon completion.`,
          type: 'payment_success',
          referenceId: order._id.toString(),
          referenceType: 'Order'
        });

        // Trigger Low Stock alert if stock is low (e.g. <= 10)
        if (product.stock <= 10) {
          await sendPushNotification(seller._id, {
            title: 'Low Stock Alert',
            body: `Low stock alert: Only ${product.stock} ${product.stockUnit || 'Kg'} remaining for "${product.name || product.title}".`,
            type: 'low_stock',
            referenceId: product._id.toString(),
            referenceType: 'Product'
          });
        }
      }
    } catch (notifErr) {
      console.error('Error triggering order placement notifications:', notifErr);
    }

    res.status(201).json(order);
  } catch (error) {
    res.status(500).json({ message: 'Error placing order.' });
  }
});

// Updating the status of an order.
router.put('/:id/status', authenticateToken, async (req, res) => {
  try {
    const { status } = req.body;


    if (!status || !['pending', 'shipped', 'Out for Delivery', 'delivered', 'cancelled'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status target.' });
    }


    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ message: 'Order document not found.' });
    }

    const isFarmer = req.user.email === order.farmerEmail;
    const isBuyer = req.user.email === order.buyerEmail;


    if (!isFarmer && !isBuyer) {
      return res.status(403).json({ message: 'Forbidden. No authority on this order.' });
    }


    if (status === 'cancelled') {
      if (order.status !== 'pending') {
        return res.status(400).json({ message: 'Cannot cancel non-pending order.' });
      }
    }

    // Restore stock if order is cancelled
    if (status === 'cancelled' && order.status !== 'cancelled') {
      const product = await Product.findById(order.productId);
      if (product) {
        product.stock = product.stock + order.quantity;
        product.inStock = true;
        await product.save();
      }

      // Restore coupon usage count if all items in the checkout session are cancelled
      if (order.couponCode && order.checkoutId) {
        const activeOrdersCount = await Order.countDocuments({
          checkoutId: order.checkoutId,
          status: { $ne: 'cancelled' },
          _id: { $ne: order._id }
        });
        if (activeOrdersCount === 0) {
          await Coupon.updateOne({ code: order.couponCode }, { $inc: { usedCount: -1 } });
        }
      }
    }

    // Update order status and deliveryStatus.
    order.status = status;
    if (status === 'pending') order.deliveryStatus = 'placed';
    else if (status === 'shipped') order.deliveryStatus = 'shipped';
    else if (status === 'Out for Delivery') order.deliveryStatus = 'Out for Delivery';
    else if (status === 'delivered') order.deliveryStatus = 'delivered';
    else if (status === 'cancelled') order.deliveryStatus = 'cancelled';

    await order.save();
    await sendOrderStatusNotification(order);
    res.status(200).json(order);
  } catch (error) {
    res.status(500).json({ message: 'Error updating order status.' });
  }
});

// Fallback status override endpoint used by dashboards
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { status } = req.body;
    if (!status || !['pending', 'shipped', 'Out for Delivery', 'delivered', 'cancelled'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status target.' });
    }

    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ message: 'Order document not found.' });
    }

    const isFarmer = req.user.email === order.farmerEmail;
    const isRetailer = req.user.id === (order.seller && order.seller.toString());
    const isAdmin = req.user.role === 'admin';

    if (!isFarmer && !isRetailer && !isAdmin) {
      return res.status(403).json({ message: 'Forbidden. No authority on this order.' });
    }

    if (status === 'cancelled') {
      if (order.status !== 'pending' && !isAdmin) {
        return res.status(400).json({ message: 'Cannot cancel non-pending order.' });
      }
    }

    // Restore stock if order is cancelled
    if (status === 'cancelled' && order.status !== 'cancelled') {
      const product = await Product.findById(order.productId);
      if (product) {
        product.stock = product.stock + order.quantity;
        product.inStock = true;
        await product.save();
      }

      // Restore coupon usage count if all items in the checkout session are cancelled
      if (order.couponCode && order.checkoutId) {
        const activeOrdersCount = await Order.countDocuments({
          checkoutId: order.checkoutId,
          status: { $ne: 'cancelled' },
          _id: { $ne: order._id }
        });
        if (activeOrdersCount === 0) {
          await Coupon.updateOne({ code: order.couponCode }, { $inc: { usedCount: -1 } });
        }
      }
    }

    order.status = status;
    if (status === 'pending') order.deliveryStatus = 'placed';
    else if (status === 'shipped') order.deliveryStatus = 'shipped';
    else if (status === 'Out for Delivery') order.deliveryStatus = 'Out for Delivery';
    else if (status === 'delivered') order.deliveryStatus = 'delivered';
    else if (status === 'cancelled') order.deliveryStatus = 'cancelled';

    await order.save();
    await sendOrderStatusNotification(order);
    res.status(200).json(order);
  } catch (error) {
    console.error('Error updating order status:', error);
    res.status(500).json({ message: 'Error updating order status.' });
  }
});

export default router;
