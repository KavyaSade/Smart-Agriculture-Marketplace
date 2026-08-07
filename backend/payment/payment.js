import { Router } from 'express';
import { authenticateToken } from '../middleware/auth.js';
import crypto from 'crypto';

const router = Router();

// create a razorpay order
router.post('/create-razorpay-order', authenticateToken, async (req, res) => {
  try {
    const { amount } = req.body;

    // check if amount is valid
    if (!amount || amount <= 0) {
      return res.status(400).json({ message: 'invalid amount input' });
    }

    // get razorpay keys from .env
    const keyid = process.env.RAZORPAY_KEY_ID;
    const keysecret = process.env.RAZORPAY_KEY_SECRET;

    // create a dummy order if keys are not available
    if (!keyid || !keysecret) {
      const dummyid = 'order_dummy_' + Math.floor(100000 + Math.random() * 900000);

      return res.status(200).json({
        id: dummyid,
        amount: amount * 100,
        currency: 'INR',
        isDummy: true
      });
    }

    // send request to razorpay
    const auth = Buffer.from(`${keyid}:${keysecret}`).toString('base64');

    const response = await fetch('https://api.razorpay.com/v1/orders', {
      method: 'POST',
      headers: {
        authorization: `Basic ${auth}`,
        'content-type': 'application/json'
      },
      body: JSON.stringify({
        amount: Math.round(amount * 100),
        currency: 'INR',
        receipt: 'receipt_' + Date.now()
      })
    });

    const data = await response.json();

    // return the created order
    if (response.ok) {
      res.status(200).json({
        id: data.id,
        amount: data.amount,
        currency: data.currency,
        isDummy: false
      });
    } else {
      res.status(400).json({
        message: data.error
          ? data.error.description
          : 'failed to create order'
      });
    }
  } catch (error) {
    res.status(500).json({ message: 'failed to create order' });
  }
});

// verify the payment
router.post('/verify-razorpay-payment', authenticateToken, async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature
    } = req.body;

    // accept dummy payment
    if (
      razorpay_order_id &&
      razorpay_order_id.startsWith('order_dummy_')
    ) {
      return res.status(200).json({
        success: true,
        status: 'verified',
        isDummy: true
      });
    }

    // check required fields
    if (
      !razorpay_order_id ||
      !razorpay_payment_id ||
      !razorpay_signature
    ) {
      return res.status(400).json({
        message: 'missing parameters for verification'
      });
    }

    // get razorpay secret key
    const keysecret = process.env.RAZORPAY_KEY_SECRET;

    // accept payment if secret key is missing
    if (!keysecret) {
      return res.status(200).json({
        success: true,
        status: 'verified',
        isDummy: true
      });
    }

    // create signature
    const hmac = crypto.createHmac('sha256', keysecret);
    hmac.update(razorpay_order_id + '|' + razorpay_payment_id);

    const generated = hmac.digest('hex');

    // compare signatures
    if (generated === razorpay_signature) {
      res.status(200).json({
        success: true,
        status: 'verified',
        isDummy: false
      });
    } else {
      res.status(400).json({
        success: false,
        message: 'signature verification failed'
      });
    }
  } catch (error) {
    res.status(500).json({
      message: 'failed to verify signature'
    });
  }
});

export default router;