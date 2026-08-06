import { Router } from 'express';
import Order from '../models/orders.js';
import Product from '../models/product.js';
import { authenticateToken } from '../middleware/auth.js';

const router = Router();

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
    const { productId, quantity, buyerPhone, buyerAddress } = req.body;

   
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


    //order invoice.
    const order = new Order({
      id: 'ORD-' + Math.floor(1000 + Math.random() * 9000),
      productName: product.name,
      productId: product._id,
      quantity,
      unit: product.stockUnit,
      amount: product.price * quantity,
      buyerEmail: req.user.email,
      buyerName: req.user.fullName || 'Buyer User',
      buyerPhone,
      buyerAddress,
      farmerEmail: product.farmerEmail,
      farmerName: product.farmerName,
      seller: product.seller,
      // Format current date
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }),
      status: 'pending'
    });

    await order.save();
    res.status(201).json(order);
  } catch (error) {
    res.status(500).json({ message: 'Error placing order.' });
  }
});

// Updating the status of an order.
router.put('/:id/status', authenticateToken, async (req, res) => {
  try {
    const { status } = req.body;

    
    if (!status || !['pending', 'shipped', 'delivered', 'cancelled'].includes(status)) {
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

    // Deducting product stock when the order is marked as delivered.
    if (status === 'delivered' && order.status !== 'delivered') {
      const product = await Product.findById(order.productId);
      if (product) {
        product.stock = Math.max(0, product.stock - order.quantity);
        if (product.stock === 0) {
          product.inStock = false;
        }
        await product.save();
      }
    }

    //order status.
    order.status = status;
    await order.save();
    res.status(200).json(order);
  } catch (error) {
    res.status(500).json({ message: 'Error updating order status.' });
  }
});

// Fallback status override endpoint (without /status suffix) used by dashboards
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { status } = req.body;
    if (!status || !['pending', 'shipped', 'delivered', 'cancelled'].includes(status)) {
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

    // Deducting product stock when the order is marked as delivered.
    if (status === 'delivered' && order.status !== 'delivered') {
      const product = await Product.findById(order.productId);
      if (product) {
        product.stock = Math.max(0, product.stock - order.quantity);
        if (product.stock === 0) {
          product.inStock = false;
        }
        await product.save();
      }
    }

    order.status = status;
    await order.save();
    res.status(200).json(order);
  } catch (error) {
    console.error('Error updating order status:', error);
    res.status(500).json({ message: 'Error updating order status.' });
  }
});

export default router;
