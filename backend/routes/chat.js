import { Router } from 'express';
import Message from '../models/Message.js';
import User from '../models/User.js';
import { authenticateToken } from '../middleware/auth.js';
import { sendPushNotification } from '../utils/fcm.js';

// express router setup
const router = Router();

// get list of contacts (farmers for buyers, buyers for farmers) to start a new chat
router.get('/contacts', authenticateToken, async (req, res) => {
  try {
    const userRole = req.user.role;
    const query = userRole === 'farmer' ? { role: 'buyer' } : { role: 'farmer' };
    const contacts = await User.find(query, 'fullName email profilePhoto role');
    res.status(200).json(contacts);
  } catch (error) {
    res.status(500).json({ message: 'failed to fetch contacts' });
  }
});

// get unique conversations list for logged in user
router.get('/conversations', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    // find unique receivers/senders we chatted with
    const senders = await Message.distinct('sender', { receiver: userId });
    const receivers = await Message.distinct('receiver', { sender: userId });

    // simple array merge and deduplication
    const allPartners = senders.concat(receivers).map(id => id.toString());
    const partnerIds = allPartners.filter((id, index) => allPartners.indexOf(id) === index);

    const partners = await User.find({ _id: { $in: partnerIds } }, 'fullName email profilePhoto role');

    const conversations = await Promise.all(partners.map(async (partner) => {
      const lastMsg = await Message.findOne({
        $or: [
          { sender: userId, receiver: partner._id },
          { sender: partner._id, receiver: userId }
        ]
      }).sort({ createdAt: -1 });

      const unreadCount = await Message.countDocuments({
        sender: partner._id,
        receiver: userId,
        isRead: false
      });

      return {
        partner,
        unreadCount,
        lastMessage: lastMsg ? (lastMsg.text || 'photo') : '',
        lastMessageTime: lastMsg ? lastMsg.createdAt : null
      };
    }));

    conversations.sort((a, b) => (b.lastMessageTime || 0) - (a.lastMessageTime || 0));
    res.status(200).json(conversations);
  } catch (error) {
    res.status(500).json({ message: 'failed to fetch conversations' });
  }
});

// get message list between current user and other user
router.get('/messages/:otherUserId', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { otherUserId } = req.params;
    // mark messages as read
    await Message.updateMany(
      { sender: otherUserId, receiver: userId, isRead: false },
      { $set: { isRead: true } }
    );

    const messages = await Message.find({
      $or: [
        { sender: userId, receiver: otherUserId },
        { sender: otherUserId, receiver: userId }
      ]
    }).sort({ createdAt: 1 });
    res.status(200).json(messages);
  } catch (error) {
    res.status(500).json({ message: 'failed to fetch messages' });
  }
});

// get unread chat messages count for current user
router.get('/unread-count', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const count = await Message.countDocuments({ receiver: userId, isRead: false });
    res.status(200).json({ unreadCount: count });
  } catch (error) {
    res.status(500).json({ message: 'failed to fetch unread count' });
  }
});

// create new chat message
router.post('/messages', authenticateToken, async (req, res) => {
  try {
    const sender = req.user.id;
    const { receiver, text, image } = req.body;
    if (!receiver) {
      return res.status(400).json({ message: 'receiver is required' });
    }
    if (!text && !image) {
      return res.status(400).json({ message: 'text or image is required' });
    }
    const message = new Message({
      sender,
      receiver,
      text,
      image
    });
    await message.save();

    // trigger push and database notification
    try {
      const senderUser = await User.findById(sender);
      const senderName = senderUser ? senderUser.fullName : 'Someone';
      const notificationText = text ? text : 'sent an image';
      await sendPushNotification(receiver, {
        title: `New Message from ${senderName}`,
        body: notificationText,
        type: 'new_chat_message',
        referenceId: sender,
        referenceType: 'User',
        senderId: sender
      });
    } catch (err) {
      console.error('failed to send chat notification:', err);
    }

    res.status(201).json(message);
  } catch (error) {
    res.status(500).json({ message: 'failed to save message' });
  }
});

// delete an individual message by id
router.delete('/messages/:messageId', authenticateToken, async (req, res) => {
  try {
    const { messageId } = req.params;
    const userId = req.user.id;
    // find the message first
    const message = await Message.findById(messageId);
    if (!message) {
      return res.status(404).json({ message: 'message not found' });
    }
    // verify sender is the current user
    if (message.sender.toString() !== userId) {
      return res.status(403).json({ message: 'unauthorized to delete this message' });
    }
    await message.deleteOne();
    res.status(200).json({ message: 'message deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'failed to delete message' });
  }
});

// delete entire conversation with another user
router.delete('/conversations/:otherUserId', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { otherUserId } = req.params;
    // delete all messages between the two users
    await Message.deleteMany({
      $or: [
        { sender: userId, receiver: otherUserId },
        { sender: otherUserId, receiver: userId }
      ]
    });
    res.status(200).json({ message: 'conversation deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'failed to delete conversation' });
  }
});

export default router;
