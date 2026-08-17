import { Router } from 'express';
import mongoose from 'mongoose';
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
    const userIdObj = new mongoose.Types.ObjectId(userId);

    // Fetch conversations list
    const conversations = await Message.aggregate([
      {
        $match: {
          $or: [
            { sender: userIdObj },
            { receiver: userIdObj }
          ]
        }
      },
      {
        $sort: { createdAt: -1 }
      },
      {
        $group: {
          _id: {
            $cond: [
              { $eq: [ "$sender", userIdObj ] },
              "$receiver",
              "$sender"
            ]
          },
          lastMessageText: { $first: "$text" },
          lastMessageImage: { $first: "$image" },
          lastMessageFile: { $first: "$file" },
          lastMessageTime: { $first: "$createdAt" },
          unreadCount: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $eq: [ "$receiver", userIdObj ] },
                    { $eq: [ "$isRead", false ] }
                  ]
                },
                1,
                0
              ]
            }
          }
        }
      }
    ]);

    const partnerIds = conversations.map(c => c._id);
    const partners = await User.find({ _id: { $in: partnerIds } }, 'fullName email profilePhoto role');

    const partnerMap = {};
    partners.forEach(p => {
      partnerMap[p._id.toString()] = p;
    });

    const result = conversations
      .map(c => {
        const partner = partnerMap[c._id.toString()];
        if (!partner) return null;

        let lastMsgText = '';
        if (c.lastMessageText) lastMsgText = c.lastMessageText;
        else if (c.lastMessageImage) lastMsgText = 'photo';
        else if (c.lastMessageFile) lastMsgText = 'document';

        return {
          partner,
          unreadCount: c.unreadCount,
          lastMessage: lastMsgText,
          lastMessageTime: c.lastMessageTime
        };
      })
      .filter(Boolean);

    result.sort((a, b) => (b.lastMessageTime || 0) - (a.lastMessageTime || 0));
    res.status(200).json(result);
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
    })
    .sort({ createdAt: -1 })
    .limit(50);

    // Use stream URLs for attachments
    const optimized = messages.map(msg => {
      const obj = msg.toObject();
      if (obj.file) {
        obj.file = `http://localhost:5000/api/chat/messages/${obj._id}/file`;
      }
      if (obj.image) {
        obj.image = `http://localhost:5000/api/chat/messages/${obj._id}/image`;
      }
      return obj;
    });

    res.status(200).json(optimized.reverse());
  } catch (error) {
    res.status(500).json({ message: 'failed to fetch messages' });
  }
});

// Stream file attachment
router.get('/messages/:messageId/file', async (req, res) => {
  try {
    const message = await Message.findById(req.params.messageId);
    if (!message || !message.file) {
      return res.status(404).json({ message: 'file not found' });
    }
    const base64Data = message.file.split(';base64,').pop();
    const fileBuffer = Buffer.from(base64Data, 'base64');
    res.setHeader('Content-Type', message.fileType || 'application/octet-stream');
    res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(message.fileName || 'file')}"`);
    res.send(fileBuffer);
  } catch (error) {
    res.status(500).json({ message: 'error retrieving file' });
  }
});

// Stream image attachment
router.get('/messages/:messageId/image', async (req, res) => {
  try {
    const message = await Message.findById(req.params.messageId);
    if (!message || !message.image) {
      return res.status(404).json({ message: 'image not found' });
    }
    const base64Data = message.image.split(';base64,').pop();
    const imageBuffer = Buffer.from(base64Data, 'base64');
    const mimeType = message.image.split(';')[0].split(':')[1] || 'image/jpeg';
    res.setHeader('Content-Type', mimeType);
    res.send(imageBuffer);
  } catch (error) {
    res.status(500).json({ message: 'error retrieving image' });
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
    const { receiver, text, image, file, fileName, fileType } = req.body;
    if (!receiver) {
      return res.status(400).json({ message: 'receiver is required' });
    }
    if (!text && !image && !file) {
      return res.status(400).json({ message: 'text, image or file is required' });
    }
    const message = new Message({
      sender,
      receiver,
      text,
      image,
      file,
      fileName,
      fileType
    });
    await message.save();

    // trigger push and database notification
    try {
      const senderUser = await User.findById(sender);
      const senderName = senderUser ? senderUser.fullName : 'Someone';
      let notificationText = text ? text : 'sent an image';
      if (!text && file) {
        notificationText = `sent a file: ${fileName}`;
      }
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
