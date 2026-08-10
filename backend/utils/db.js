import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import Product from '../models/product.js';

// connect to mongodb using the uri from the .env file
export async function connectDB() {
  const connUri = process.env.MONGODB_URI;

  // check if the mongodb uri is available
  if (!connUri) {
    console.error("MONGODB_URI is not defined in backend/.env!");
    return;
  }

  try {
    // connect to the database
    const conn = await mongoose.connect(connUri);
    console.log(`MongoDB Connected: ${conn.connection.host}`);

    // create the default admin account if it does not exist
    await seedDefaultData();

    //placeholder farmer names
    await updatePlaceholderFarmerNames();
  } catch (error) {
    // show an error if the connection fails
    console.error(`MongoDB Connection Error: ${error.message}`);
  }
}

// create the default admin account
async function seedDefaultData() {
  try {
    const adminEmail = 'admin@gmail.com';

    // check if the admin account already exists
    const adminExists = await User.findOne({ email: adminEmail });

    if (!adminExists) {
      // hash the admin password
      const hashedPassword = await bcrypt.hash('admin123', 10);

      // create the admin account
      const defaultAdmin = new User({
        fullName: 'System Administrator',
        email: adminEmail,
        phone: '987654321',
        role: 'admin',
        password: hashedPassword
      });

      // save the admin account
      await defaultAdmin.save();
      console.log('Default admin account created.');
    }

    // update all admin phone numbers
    await User.updateMany({ role: 'admin' }, { phone: '987654321' });
    console.log('Admin phone numbers updated.');
  } catch (error) {
    // show an error if something goes wrong
    console.error(`Error seeding default data: ${error.message}`);
  }
}

// Update any products with their seller's real name
async function updatePlaceholderFarmerNames() {
  try {
    const productsToUpdate = await Product.find({ farmerName: 'Farmer User' });
    let count = 0;
    for (const prod of productsToUpdate) {
      let sellerUser = null;
      if (prod.seller) {
        sellerUser = await User.findById(prod.seller);
      } else if (prod.farmerEmail) {
        sellerUser = await User.findOne({ email: prod.farmerEmail.toLowerCase() });
      }
      if (sellerUser) {
        prod.farmerName = sellerUser.fullName;
        await prod.save();
        count++;
      }
    }
    if (count > 0) {
      console.log(`Successfully migrated ${count} product placeholder farmer names.`);
    }
  } catch (error) {
    console.error('Error migrating placeholder farmer names:', error);
  }
}