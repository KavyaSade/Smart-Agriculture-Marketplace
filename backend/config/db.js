import mongoose from 'mongoose';

// connect to the mongodb database
const connectDB = async () => {
  const MONGODB_URI = process.env.MONGODB_URI;

  // check if the database link is configured
  if (!MONGODB_URI || MONGODB_URI.trim() === '') {
    console.warn('Warning: MONGODB_URI is not configured in your .env file. Skipping database connection.');
    return;
  }

  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Successfully connected to MongoDB Atlas!');
  } catch (error) {
    console.error('Failed to connect to MongoDB Atlas:', error.message);
  }
};

export default connectDB;
