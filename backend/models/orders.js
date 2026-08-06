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
    type: String,
    required: true
  },
  farmerName: {
    type: String,
    required: true
  },
  date: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'shipped', 'delivered', 'cancelled'],
    default: 'pending'
  }
}, {
  timestamps: true
});

const Order = mongoose.model('Order', orderSchema);

export default Order;
