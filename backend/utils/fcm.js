import { initializeApp } from 'firebase-admin/app';
import { cert } from 'firebase-admin/app';
import { getMessaging } from 'firebase-admin/messaging';
import User from '../models/User.js';
import Notification from '../models/Notification.js';
import fs from 'fs';
import path from 'path';

let firebaseApp = null;
let messaging = null;

const initFirebaseAdmin = () => {
  if (firebaseApp) return;

  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  let privateKey = process.env.FIREBASE_PRIVATE_KEY;

  if (privateKey) {
    privateKey = privateKey.replace(/\\n/g, '\n');
  }

  try {
    if (projectId && clientEmail && privateKey) {
      firebaseApp = initializeApp({
        credential: cert({
          projectId,
          clientEmail,
          privateKey
        })
      });
      messaging = getMessaging(firebaseApp);
      console.log('Firebase Admin initialized successfully using individual env credentials.');
    } else if (process.env.FIREBASE_SERVICE_ACCOUNT_JSON) {
      const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_JSON);
      firebaseApp = initializeApp({
        credential: cert(serviceAccount)
      });
      messaging = getMessaging(firebaseApp);
      console.log('Firebase Admin initialized successfully using SERVICE_ACCOUNT_JSON.');
    } else {
      // Check if service account file exists locally in backend folder
      const localKeyPath = path.resolve(process.cwd(), 'firebase-service-account.json');
      if (fs.existsSync(localKeyPath)) {
        firebaseApp = initializeApp({
          credential: cert(localKeyPath)
        });
        messaging = getMessaging(firebaseApp);
        console.log('Firebase Admin initialized successfully using local firebase-service-account.json file.');
      } else {
        console.warn('Firebase Admin credentials are not fully configured in the environment. Push notifications will be stored in the DB only, and FCM delivery will be skipped.');
      }
    }
  } catch (error) {
    console.error('Failed to initialize Firebase Admin SDK:', error);
  }
};

// Initialize on load
initFirebaseAdmin();

/**
 * Sends a real-time push notification and saves it to MongoDB.
 * 
 * @param {string} recipientId 
 * @param {object} notificationData 
 * @param {string} notificationData.title 
 * @param {string} notificationData.body
 * @param {string} notificationData.type 
 * @param {string} [notificationData.referenceId] 
 * @param {string} [notificationData.referenceType] 
 * @param {object} [notificationData.metadata] 
 * @param {string} [notificationData.senderId] 
 */
export async function sendPushNotification(recipientId, {
  title,
  body,
  type,
  referenceId = null,
  referenceType = null,
  metadata = {},
  senderId = null
}) {
  try {
    // 1. Create and save the Notification record in MongoDB
    const notification = new Notification({
      recipient: recipientId,
      sender: senderId,
      type,
      title,
      message: body,
      referenceId,
      referenceType,
      metadata: metadata || {},
      isRead: false
    });
    await notification.save();

    // 2. Load the recipient to fetch their registered FCM tokens
    const recipient = await User.findById(recipientId);
    if (!recipient || !recipient.fcmTokens || recipient.fcmTokens.length === 0) {
      
      return notification;
    }

    // 3. Make sure Firebase Admin is initialized
    initFirebaseAdmin();

    if (!messaging) {
      // FCM not initialized/configured, notification is saved in DB only
      return notification;
    }

    const tokens = recipient.fcmTokens;
    const tokensToRemove = [];

    // Send push notification to each registered device token
    const sendPromises = tokens.map(async (token) => {
      try {
        let calculatedClickAction = '/';
        const role = recipient.role;

        if (referenceType === 'Order' && referenceId) {
          if (role === 'buyer') {
            calculatedClickAction = `/buyer-dashboard?tab=orders&id=${referenceId}`;
          } else if (role === 'farmer' || role === 'retailer') {
            calculatedClickAction = `/farmer-dashboard?tab=orders&id=${referenceId}`;
          }
        } else if (referenceType === 'Product') {
          if (role === 'farmer' || role === 'retailer') {
            if (type === 'new_product_review') {
              calculatedClickAction = `/farmer-dashboard?tab=reviews`;
            } else {
              calculatedClickAction = `/farmer-dashboard?tab=products`;
            }
          } else if (role === 'admin') {
            calculatedClickAction = `/admin-dashboard?tab=products`;
          }
        } else if (referenceType === 'User') {
          if (type === 'new_chat_message' && referenceId) {
            if (role === 'buyer') {
              calculatedClickAction = `/buyer-dashboard?tab=chat&partnerId=${referenceId}`;
            } else if (role === 'farmer' || role === 'retailer') {
              calculatedClickAction = `/farmer-dashboard?tab=chat&partnerId=${referenceId}`;
            }
          } else {
            if (role === 'admin') {
              calculatedClickAction = `/admin-dashboard?tab=users`;
            } else if (role === 'buyer') {
              calculatedClickAction = `/buyer-dashboard?tab=profile`;
            } else if (role === 'farmer' || role === 'retailer') {
              calculatedClickAction = `/farmer-dashboard?tab=profile`;
            }
          }
        }

        const message = {
          token,
          notification: {
            title,
            body
          },
          webpush: {
            fcm_options: {
              link: calculatedClickAction
            }
          },
          data: {
            type,
            referenceId: referenceId || '',
            referenceType: referenceType || '',
            click_action: calculatedClickAction
          }
        };
        await messaging.send(message);
      } catch (err) {
        console.warn(`Failed to deliver push notification to token: ${token}`, err.code || err.message);
        // If token is invalid or expired, queue it for removal
        if (
          err.code === 'messaging/registration-token-not-registered' ||
          err.code === 'messaging/invalid-registration-token' ||
          err.message.includes('not-registered') ||
          err.message.includes('invalid')
        ) {
          tokensToRemove.push(token);
        }
      }
    });

    await Promise.all(sendPromises);

    
    if (tokensToRemove.length > 0) {
      recipient.fcmTokens = recipient.fcmTokens.filter(t => !tokensToRemove.includes(t));
      await recipient.save();
    }

    return notification;
  } catch (error) {
    console.error('Error sending notification:', error);
  }
}
