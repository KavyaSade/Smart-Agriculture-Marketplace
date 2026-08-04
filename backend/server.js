import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.js';
import { connectDB } from './utils/db.js';

// load environment variables
dotenv.config();

// connect to database
connectDB();

const app = express();
const PORT = process.env.PORT || 5000;

// middleware
app.use(cors({
  origin: '*', // allows requests from any origin
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// routes
app.use('/api/auth', authRoutes);

// check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', message: 'Auth Service is running.' });
});

// start server
app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
  console.log(`http://localhost:${PORT}`);
});
