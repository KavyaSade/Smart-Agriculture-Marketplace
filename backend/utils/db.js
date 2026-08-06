import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import User from '../models/User.js';

// establishes a connection to the MongoDB Atlas database using the URI configured in the environment.
export async function connectDB() {
  const connUri = process.env.MONGODB_URI;
  if (!connUri) {
    console.error("MONGODB_URI is not defined in backend/.env!");
    return;
  }

  try {
    const conn = await mongoose.connect(connUri);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    
    // automatically seed default admin account on startup
    await seedDefaultData();
  } catch (error) {
    console.error(`MongoDB Connection Error: ${error.message}`);
  }
}

// checks for the existence of the default admin account, seeding it if not present.
async function seedDefaultData() {
  try {
    const adminEmail = 'admin@gmail.com';
    const adminExists = await User.findOne({ email: adminEmail });
    
    if (!adminExists) {
      const hashedPassword = await bcrypt.hash('admin123', 10);
      const defaultAdmin = new User({
        fullName: 'System Administrator',
        email: adminEmail,
        phone: '987654321',
        role: 'admin',
        password: hashedPassword
      });
      
      await defaultAdmin.save();
      console.log('Pre-seeded default admin account in MongoDB.');
    }

    // Force update all admin phone numbers to 987654321 to clear any stale records
    await User.updateMany({ role: 'admin' }, { phone: '987654321' });
    console.log('Force synced all admin phone numbers to 987654321 in MongoDB.');
  } catch (error) {
    console.error(`Error seeding default data: ${error.message}`);
  }
}
