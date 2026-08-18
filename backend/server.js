import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import http from 'http';
import { Server } from 'socket.io';
import authRoutes from './routes/auth.js';
import productRoutes from './routes/products.js';
import orderRoutes from './routes/orders.js';
import userRoutes from './routes/users.js';
import paymentRoutes from './payment/payment.js';
import notificationRoutes from './routes/notifications.js';
import couponRoutes from './routes/coupons.js';
import chatRoutes from './routes/chat.js';
import botRoutes from './routes/bot.js';
import Message from './models/Message.js';
import User from './models/User.js';
import { sendPushNotification } from './utils/fcm.js';
import { connectDB } from './utils/db.js';

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
app.use('/api/users', userRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/coupons', couponRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/bot', botRoutes);

// check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', message: 'Auth Service is running.' });
});

// wrap server with http and socket.io
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH']
  },
  maxHttpBufferSize: 5e7, // 50MB limit
  pingTimeout: 60000 // 60s timeout
});

// socket.io connection logic
io.on('connection', (socket) => {
  // join a private room for the user
  socket.on('join', (userId) => {
    socket.join(userId);
  });

  // handle sending a message
  socket.on('sendMessage', async ({ senderId, receiverId, text, image, file, fileName, fileType }) => {
    try {
      const message = new Message({
        sender: senderId,
        receiver: receiverId,
        text: text || '',
        image: image || null,
        file: file || null,
        fileName: fileName || null,
        fileType: fileType || null
      });
      await message.save();

      // broadcast the message to both sender and receiver rooms
      io.to(receiverId).emit('newMessage', message);
      io.to(senderId).emit('newMessage', message);

      // trigger dashboard notification for the receiver
      try {
        const senderUser = await User.findById(senderId);
        const senderName = senderUser ? senderUser.fullName : 'Someone';
        let notificationText = text ? text : 'sent an image';
        if (!text && file) {
          notificationText = `sent a file: ${fileName}`;
        }
        
        await sendPushNotification(receiverId, {
          title: `New Message from ${senderName}`,
          body: notificationText,
          type: 'new_chat_message',
          referenceId: senderId,
          referenceType: 'User',
          senderId: senderId
        });
      } catch (err) {
        console.error('failed to send chat notification:', err);
      }
    } catch (err) {
      console.error('socket error saving message:', err);
    }
  });

  // handle deleting an individual message
  socket.on('deleteMessage', async ({ messageId, senderId, receiverId }) => {
    try {
      await Message.findByIdAndDelete(messageId);
      // broadcast deletion notice to both rooms
      io.to(receiverId).emit('messageDeleted', { messageId });
      io.to(senderId).emit('messageDeleted', { messageId });
    } catch (err) {
      console.error('socket error deleting message:', err);
    }
  });

  // handle deleting an entire conversation
  socket.on('deleteConversation', async ({ senderId, receiverId }) => {
    try {
      await Message.deleteMany({
        $or: [
          { sender: senderId, receiver: receiverId },
          { sender: receiverId, receiver: senderId }
        ]
      });
      // broadcast conversation deleted status
      io.to(receiverId).emit('conversationDeleted', { partnerId: senderId });
      io.to(senderId).emit('conversationDeleted', { partnerId: receiverId });
    } catch (err) {
      console.error('socket error deleting conversation:', err);
    }
  });

  socket.on('disconnect', () => {
    // client disconnected
  });
});

// start server
server.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
  console.log(`http://localhost:${PORT}`);
});
