import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  fullName: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  phone: {
    type: String,
    required: true,
    trim: true
  },
  role: {
    type: String,
    required: true,
    enum: ['buyer', 'farmer', 'admin', 'user', 'retailer'],
    default: 'farmer'
  },
  password: {
    type: String,
    required: true
  },
  bio: {
    type: String,
    default: ''
  },
  farmName: {
    type: String,
    default: ''
  },
  experience: {
    type: String,
    default: ''
  },
  addressStreet: {
    type: String,
    default: ''
  },
  addressCity: {
    type: String,
    default: ''
  },
  addressState: {
    type: String,
    default: ''
  },
  addressPin: {
    type: String,
    default: ''
  },
  profilePhoto: {
    type: String,
    default: null
  },
  sector: {
    type: String,
    default: 'grains'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const User = mongoose.model('User', userSchema);

export default User;
