import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    trim: true
  },
  title: {
    type: String,
    trim: true
  },
  category: {
    type: String,
    required: true,
    default: 'grains'
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  priceUnit: {
    type: String,
    default: 'Kg'
  },
  stock: {
    type: Number,
    required: true,
    min: 0
  },
  stockUnit: {
    type: String,
    default: 'Kg'
  },
  unit: {
    type: String
  },
  location: {
    type: String,
    required: true
  },
  image: {
    type: String
  },
  description: {
    type: String
  },
  inStock: {
    type: Boolean,
    default: true
  },
  farmerEmail: {
    type: String
  },
  farmerName: {
    type: String
  },
  seller: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  averageRating: {
    type: Number,
    default: 0
  },
  totalReviews: {
    type: Number,
    default: 0
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'approved'
  }
}, {
  timestamps: true
});

const Product = mongoose.model('Product', productSchema);

export default Product;
