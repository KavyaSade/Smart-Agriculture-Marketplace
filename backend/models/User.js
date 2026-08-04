import mongoose from 'mongoose';

// define the user profile schema
const userSchema = new mongoose.Schema({
  uid: {
    type: String,
    required: true,
    unique: true
  },
  fullName: {
    type: String,
    default: ''
  },
  email: {
    type: String,
    required: true
  },
  password: {
    type: String,
    default: ''
  },
  phone: {
    type: String,
    default: ''
  },
  role: {
    type: String,
    enum: ['buyer', 'farmer', 'admin'],
    default: 'buyer'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// create the user model
const User = mongoose.model('User', userSchema);

export default User;
