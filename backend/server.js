import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './config/db.js';
import User from './models/User.js';

// load the values from the .env file
dotenv.config();

// create the express app
const app = express();

// enable CORS middleware so React frontend on Port 5173 can send requests
app.use(cors());

// enable JSON body parser middleware to parse request payload objects
app.use(express.json());

// connect to the database
connectDB();

// receive Firebase auth details and save them to MongoDB Atlas
app.post('/api/users/sync', async (req, res) => {
  const { uid, fullName, email, password, phone, role } = req.body;

  if (!uid || !email) {
    return res.status(400).json({ error: 'uid and email are required to sync user profile data' });
  }

  try {
    // find user by uid, update fields if matched, or insert new record (upsert)
    const userProfile = await User.findOneAndUpdate(
      { uid },
      { 
        $set: { 
          fullName: fullName || '', 
          email, 
          password: password || '', 
          phone: phone || '', 
          role: role || 'buyer' 
        } 
      },
      { new: true, upsert: true }
    );

    console.log(`Synced user login data: ${email} (${role})`);
    res.status(200).json({ success: true, user: userProfile });
  } catch (error) {
    console.error('Failed to sync user login data with MongoDB Atlas:', error.message);
    res.status(500).json({ error: 'Failed to sync user profile details' });
  }
});

// get the port number from the env file
const PORT = process.env.PORT || 5000;

// start the server
app.listen(PORT, () => {
  console.log(`Server is running successfully on port ${PORT}`);
});
