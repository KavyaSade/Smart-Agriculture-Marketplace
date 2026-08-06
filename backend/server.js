import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.js';
import productRoutes from './routes/products.js';
import orderRoutes from './routes/orders.js';
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
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);

// check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', message: 'Auth Service is running.' });
});

// start server
app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
  console.log(`http://localhost:${PORT}`);
});
