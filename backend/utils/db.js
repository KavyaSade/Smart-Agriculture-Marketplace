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
    
    // automatically seed the default admin account on startup
    await seedDefaultAdmin();
    // Seed default products and farmer users.
    await seedDefaultProducts();
  } catch (error) {
    console.error(`MongoDB Connection Error: ${error.message}`);
  }
}

// checks for the existence of the default admin account and seeds it if it is not already present in the database.
async function seedDefaultAdmin() {
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
  } catch (error) {
    console.error(`Error seeding default admin: ${error.message}`);
  }
}

// Seed default farmers and crops using PNG format pictures.
async function seedDefaultProducts() {
  try {
    const productCount = await Product.countDocuments();
    if (productCount === 0) {
      const defaultFarmers = [
        { email: 'vikas@gmail.com', name: 'Vikas Patil', phone: '987654322' },
        { email: 'ramesh@gmail.com', name: 'Ramesh Negi', phone: '987654323' },
        { email: 'priya@gmail.com', name: 'Priya Sharma', phone: '987654324' },
        { email: 'gopal@gmail.com', name: 'Gopal Yadav', phone: '987654325' },
        { email: 'bashir@gmail.com', name: 'Bashir Ahmed', phone: '987654326' },
        { email: 'rajesh@gmail.com', name: 'Rajesh Patil', phone: '987654327' }
      ];

      const hashedPassword = await bcrypt.hash('farmer123', 10);
      for (const farmer of defaultFarmers) {
        const farmerExists = await User.findOne({ email: farmer.email });
        if (!farmerExists) {
          const newFarmer = new User({
            fullName: farmer.name,
            email: farmer.email,
            phone: farmer.phone,
            role: 'farmer',
            password: hashedPassword
          });
          await newFarmer.save();
        }
      }

      const defaultCrops = [
        {
          name: 'Organic Potatoes',
          category: 'grains',
          price: 45,
          priceUnit: 'Kg',
          stock: 450,
          stockUnit: 'Kg',
          location: 'Pune, Maharashtra',
          farmerEmail: 'vikas@gmail.com',
          farmerName: 'Vikas Patil',
          inStock: true,
          image: 'https://images.unsplash.com/photo-1518977676601-b53f82aba655?auto=format&fit=crop&q=80&w=400&fm=png',
          description: 'Freshly harvested organic yellow potatoes. Hand-picked, nutrient-rich, and pesticide free.'
        },
        {
          name: 'Royal Delicious Apples',
          category: 'fruits',
          price: 130,
          priceUnit: 'Kg',
          stock: 120,
          stockUnit: 'Kg',
          location: 'Shimla Orchards',
          farmerEmail: 'ramesh@gmail.com',
          farmerName: 'Ramesh Negi',
          inStock: true,
          image: 'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?auto=format&fit=crop&q=80&w=400&fm=png',
          description: 'Crispy, sweet, and freshly harvested royal apples.'
        },
        {
          name: 'Roma Tomatoes',
          category: 'fruits',
          price: 45,
          priceUnit: 'Kg',
          stock: 300,
          stockUnit: 'Kg',
          location: 'Sunfields Farm',
          farmerEmail: 'priya@gmail.com',
          farmerName: 'Priya Sharma',
          inStock: true,
          image: 'https://images.unsplash.com/photo-1595855759920-86582396756a?auto=format&fit=crop&q=80&w=400&fm=png',
          description: 'Firm and pulpy, ideal for home kitchens and ketchup production.'
        },
        {
          name: 'Pure Buffalo Ghee',
          category: 'dairy',
          price: 650,
          priceUnit: 'Litre',
          stock: 80,
          stockUnit: 'Litres',
          location: 'Krishna Dairy',
          farmerEmail: 'gopal@gmail.com',
          farmerName: 'Gopal Yadav',
          inStock: true,
          image: 'https://images.unsplash.com/photo-1635359739501-c80b2a8df80c?auto=format&fit=crop&q=80&w=400&fm=png',
          description: 'Prepared using traditional Bilona method. 100% natural.'
        },
        {
          name: 'Kashmiri Saffron (Kesar)',
          category: 'spices',
          price: 350,
          priceUnit: 'Gram',
          stock: 2,
          stockUnit: 'Kg',
          location: 'Pampore Fields',
          farmerEmail: 'bashir@gmail.com',
          farmerName: 'Bashir Ahmed',
          inStock: true,
          image: 'https://images.unsplash.com/photo-1615485290382-441e4d049cb5?auto=format&fit=crop&q=80&w=400&fm=png',
          description: 'Grade A+ original export quality saffron threads.'
        },
        {
          name: 'Basmati Rice',
          category: 'grains',
          price: 90,
          priceUnit: 'Kg',
          stock: 500,
          stockUnit: 'Kg',
          location: 'Nagpur, Maharashtra',
          farmerEmail: 'rajesh@gmail.com',
          farmerName: 'Rajesh Patil',
          inStock: true,
          image: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&q=80&w=600&fm=png',
          description: 'Aromatic, long-grain premium Basmati rice, aged to perfection.'
        }
      ];

      await Product.insertMany(defaultCrops);
      console.log('Pre-seeded default crops in MongoDB.');
    }
  } catch (error) {
    console.error('Error seeding default products:', error.message);
  }
}
