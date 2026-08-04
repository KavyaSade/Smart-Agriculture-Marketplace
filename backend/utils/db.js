import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import User from '../models/User.js';

/**
 * Connect to MongoDB Atlas
 */
export async function connectDB() {
  const connUri = process.env.MONGODB_URI;
  if (!connUri) {
    console.error("MONGODB_URI is not defined in backend/.env!");
    return;
  }

  try {
    const conn = await mongoose.connect(connUri);
    console.log(`📡 MongoDB Connected: ${conn.connection.host}`);
    
    // Seed default admin user
    await seedDefaultAdmin();
  } catch (error) {
    console.error(`❌ MongoDB Connection Error: ${error.message}`);
  }
}

/**
 * Seeds the default admin account if not already present
 */
async function seedDefaultAdmin() {
  try {
    const adminEmail = 'admin@agrimarket.com';
    const adminExists = await User.findOne({ email: adminEmail });
    
    if (!adminExists) {
      const hashedPassword = await bcrypt.hash('admin123', 10);
      const defaultAdmin = new User({
        fullName: 'System Administrator',
        email: adminEmail,
        phone: '+1-555-0199',
        role: 'admin',
        password: hashedPassword
      });
      
      await defaultAdmin.save();
      console.log('👤 Pre-seeded default admin account in MongoDB.');
    }
  } catch (error) {
    console.error(`❌ Error seeding default admin: ${error.message}`);
  }
}
