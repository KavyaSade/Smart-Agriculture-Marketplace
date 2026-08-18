import { Router } from 'express';
import jwt from 'jsonwebtoken';
import { GoogleGenerativeAI } from '@google/generative-ai';
import Product from '../models/product.js';
import User from '../models/User.js';

const router = Router();

// Helper to optionally authenticate and return user info
const getOptionalUser = async (req) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return null;
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'super_secret_key_agri_market_2026');
    // Fetch latest user details from DB
    if (decoded && decoded.id) {
      return await User.findById(decoded.id);
    }
  } catch (err) {
  }
  return null;
};

// Local fallback logic when Gemini API key is not configured
const getRuleBasedResponse = (query, user, approvedProducts) => {
  let reply = '';
  let matchedProduct = null;
  for (const prod of approvedProducts) {
    if (prod.name && query.includes(prod.name.toLowerCase())) {
      matchedProduct = prod;
      break;
    }
  }

  if (matchedProduct) {
    return `Yes! We have "${matchedProduct.name}" (Category: ${matchedProduct.category}) listed by farmer ${matchedProduct.farmerName || 'Verified Farmer'} at ₹${matchedProduct.price}/${matchedProduct.priceUnit || 'Kg'}, located in ${matchedProduct.location}. You can purchase it from your buyer dashboard!`;
  }
  
  if (query.includes('sell') || query.includes('crop') || query.includes('list')) {
    if (user) {
      if (user.role === 'farmer') {
        reply = `Hello ${user.fullName}, since you are registered as a Farmer, you can sell your crops by going to your Farmer Dashboard and clicking on "Add Product". You can list grains, vegetables, and fruits.`;
      } else {
        reply = `Hello ${user.fullName}, currently you are registered as a ${user.role}. To sell crops, you need to register with a Farmer account and use the Farmer Dashboard to list products.`;
      }
    } else {
      reply = 'To sell your crops, register/login as a Farmer, go to your Farmer Dashboard, and click on "Add Product". You can list grains, vegetables, fruits, and other agricultural products.';
    }
  } else if (query.includes('price') || query.includes('rate') || query.includes('cost') || query.includes('market')) {
    if (approvedProducts.length > 0) {
      const uniqueProducts = [];
      const seenNames = new Set();
      for (const prod of approvedProducts) {
        if (prod.name && !seenNames.has(prod.name.toLowerCase())) {
          seenNames.add(prod.name.toLowerCase());
          uniqueProducts.push(prod);
        }
        if (uniqueProducts.length >= 4) break;
      }
      const ratesList = uniqueProducts.map(p => `${p.name}: ₹${p.price}/${p.priceUnit || 'Kg'}`).join(', ');
      reply = `Current market rates from our listings: ${ratesList}. Check your dashboard trends for historical data and price comparisons.`;
    } else {
      reply = 'Current market rates are updated daily. Wheat is trading around 2100 per quintal, chili at 7500, and grapes at 4500. Check the market trends on your dashboard.';
    }
  } else if (query.includes('weather') || query.includes('rain') || query.includes('forecast') || query.includes('sky')) {
    reply = 'Our weather advisory tool shows clear skies for the next three days. Ideal for harvesting grains. You can check detailed forecasts in the dashboard.';
  } else if (query.includes('pay') || query.includes('payment') || query.includes('secure') || query.includes('money')) {
    reply = 'Payments are processed securely through our verified gateway system (Razorpay escrow). Funds are safely held and only released to sellers once the buyer confirms delivery.';
  } else {
    const greetingName = user ? ` ${user.fullName}` : '';
    reply = `Hello${greetingName}! I am AgriBot, your smart agricultural assistant. How can I help you today? You can ask me about selling crops, current market prices, weather advisories, secure payments, or search for a specific crop directly by name (e.g., 'wheat').`;
  }
  return reply;
};

// POST /api/bot
router.post('/', async (req, res) => {
  try {
    const { message } = req.body;
    if (!message) {
      return res.status(400).json({ message: 'Message is required' });
    }

    const user = await getOptionalUser(req);
    const query = message.toLowerCase().trim();

    // Fetch approved products to use as database context (RAG)
    const approvedProducts = await Product.find({ status: 'approved' })
      .select('name category price priceUnit location farmerName')
      .limit(20);

    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      console.warn('GEMINI_API_KEY not configured. Falling back to rule-based response.');
      const reply = getRuleBasedResponse(query, user, approvedProducts);
      return res.status(200).json({ reply });
    }

    // Initialize Gemini AI
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-3.6-flash' });

    // Format product context
    const productsContext = approvedProducts.length > 0
      ? approvedProducts.map(p => `- ${p.name} (${p.category}): ₹${p.price}/${p.priceUnit || 'Kg'} located in ${p.location} (Listed by: ${p.farmerName || 'Farmer'})`).join('\n')
      : 'No products currently listed on the marketplace.';

    // Construct detailed RAG system prompt
    const systemPrompt = `
You are AgriBot, a smart AI agricultural assistant for the Smart Agriculture Marketplace app.
You must be helpful, professional, friendly, and knowledgeable about farming, crops, and agricultural trade.
Your response must be based on the user's question, using the real-time marketplace database context provided below where appropriate.

Platform Context:
- Current Session User: ${user ? `${user.fullName} (Role: ${user.role}, Email: ${user.email})` : 'Guest User (Not logged in)'}
- Real-time Product Listings on Marketplace:
${productsContext}

Key Features Guidelines:
1. Selling Crops: Farmers sell via their Farmer Dashboard > "Add Product". Buyers/retailers cannot list crops directly (must create a Farmer account). Guests must register/login.
2. Escrow Payments: Payments are securely held via Razorpay gateway and released only after delivery confirmation.
3. Weather: Forecast shows clear skies for the next 3 days. Recommend harvesting/listing crops.
4. Product Search: Check the "Real-time Product Listings" above. If the crop is listed, guide the user on its price, seller, and location. If not listed, suggest checking back or search for other crops.

Generate a natural, helpful response to the user's message. Keep it concise.
`;

    const fullPrompt = `${systemPrompt}\n\nUser Query: "${message}"\nAgriBot Reply:`;

    const result = await model.generateContent(fullPrompt);
    let reply = result.response.text().trim();

    // Clean up markdown formatting if the model wrapped the response text unnecessarily
    if (reply.startsWith('`') || reply.endsWith('`')) {
      reply = reply.replace(/^`+|`+$/g, '');
    }

    res.status(200).json({ reply });
  } catch (error) {
    console.error('Error in bot router with Gemini:', error);
    try {
      // Graceful fallback to rule-based response in case of API limits or errors
      const user = await getOptionalUser(req);
      const approvedProducts = await Product.find({ status: 'approved' })
        .select('name category price priceUnit location farmerName')
        .limit(20);
      const fallbackReply = getRuleBasedResponse(req.body.message.toLowerCase(), user, approvedProducts);
      res.status(200).json({ reply: fallbackReply });
    } catch (fallbackError) {
      res.status(500).json({ message: 'Internal server error inside chatbot' });
    }
  }
});

export default router;
