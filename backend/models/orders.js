import mongoose from 'mongoose';

const orderSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true
  },
  productName: {
    type: String,
    required: true
  },
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product'
  },
  quantity: {
    type: Number,
    required: true,
    min: 1
  },
  unit: {
    type: String,
    required: true
  },
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  buyerEmail: {
    type: String,
    required: true
  },
  buyerName: {
    type: String,
    required: true
  },
  buyerPhone: {
    type: String
  },
  buyerAddress: {
    type: String
  },
  farmerEmail: {
    type: String
  },
  farmerName: {
    type: String
  },
  date: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'shipped', 'Out for Delivery', 'delivered', 'cancelled'],
    default: 'pending'
  },
  trackingNumber: {
    type: String
  },
  deliveryStatus: {
    type: String,
    enum: ['placed', 'shipped', 'Out for Delivery', 'delivered', 'cancelled'],
    default: 'placed'
  },
  seller: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  checkoutId: {
    type: String
  },
  couponCode: {
    type: String
  },
  couponId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Coupon'
  },
  discountAmount: {
    type: Number,
    default: 0
  },
  originalAmount: {
    type: Number
  },
  finalAmount: {
    type: Number
  }
}, {
  timestamps: true
});

// Add database indexes for high-speed order queries
orderSchema.index({ farmerEmail: 1 });
orderSchema.index({ buyerEmail: 1 });
orderSchema.index({ seller: 1 });
orderSchema.index({ status: 1 });

const Order = mongoose.model('Order', orderSchema);

export default Order;
