import { Router } from 'express';
import Product from '../models/product.js';
import { authenticateToken } from '../middleware/auth.js';

const router = Router();

// Retrieve all crop listings with optional search and filters.
router.get('/', async (req, res) => {
  try {
    const { search, category, minPrice, maxPrice, inStock, location, seller } = req.query;
    
   
    const query = {};

    if (seller) {
      query.seller = seller;
    }

    // Filtering by name, location, or farmer name.
    if (search) {
      const searchRegex = new RegExp(search, 'i');
      query.$or = [
        { name: searchRegex },
        { location: searchRegex },
        { farmerName: searchRegex }
      ];
    }

    // Filter by category.
    if (category && category !== 'all') {
      query.category = category;
    }

    // Filter by minimum price.
    if (minPrice) {
      query.price = { ...query.price, $gte: parseFloat(minPrice) };
    }

    // Filter by maximum price.
    if (maxPrice) {
      query.price = { ...query.price, $lte: parseFloat(maxPrice) };
    }

    // Filter by availability.
    if (inStock === 'true') {
      query.inStock = true;
      query.stock = { $gt: 0 };
    }

    // Filter by location.
    if (location) {
      query.location = new RegExp(location, 'i');
    }

    // Fetch matching products from database.
    const products = await Product.find(query);
    res.status(200).json(products);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching products.' });
  }
});

// Retrieving of inventory owned by the authenticated seller.
router.get('/my-inventory', authenticateToken, async (req, res) => {
  try {
    
    if (req.user.role !== 'farmer' && req.user.role !== 'retailer') {
      return res.status(403).json({ message: 'Forbidden. Seller role required.' });
    }

    
    const products = await Product.find({
      $or: [
        { farmerEmail: req.user.email },
        { seller: req.user.id }
      ]
    });
    res.status(200).json(products);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching farmer inventory.' });
  }
});


router.post('/', authenticateToken, async (req, res) => {
  try {
   
    if (req.user.role !== 'farmer' && req.user.role !== 'retailer') {
      return res.status(403).json({ message: 'Forbidden. Seller role required.' });
    }

    const { name, category, price, priceUnit, stock, stockUnit, location, image, description } = req.body;

   
    if (!name || !price || stock === undefined || !location) {
      return res.status(400).json({ message: 'Missing required product fields.' });
    }


    const product = new Product({
      name,
      category,
      price,
      priceUnit,
      stock,
      stockUnit,
      location,
      image,
      description,
      inStock: stock > 0,
      farmerEmail: req.user.email,
      farmerName: req.user.fullName || 'Farmer User',
      seller: req.user.id
    });

    await product.save();
    res.status(201).json(product);
  } catch (error) {
    res.status(500).json({ message: 'Error creating product listing.' });
  }
});


router.put('/:id', authenticateToken, async (req, res) => {
  try {
   
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product listing not found.' });
    }

    
    const isOwner = product.farmerEmail === req.user.email || (product.seller && product.seller.toString() === req.user.id);
    const isAdmin = req.user.role === 'admin';
    if (!isOwner && !isAdmin) {
      return res.status(403).json({ message: 'Forbidden. Ownership verification failed.' });
    }

    const { name, category, price, priceUnit, stock, stockUnit, location, image, description } = req.body;

    
    product.name = name ?? product.name;
    product.category = category ?? product.category;
    product.price = price !== undefined ? parseFloat(price) : product.price;
    product.priceUnit = priceUnit ?? product.priceUnit;
    product.stock = stock !== undefined ? parseFloat(stock) : product.stock;
    product.stockUnit = stockUnit ?? product.stockUnit;
    product.location = location ?? product.location;
    product.image = image ?? product.image;
    product.description = description ?? product.description;
    product.inStock = product.stock > 0;

    await product.save();
    res.status(200).json(product);
  } catch (error) {
    res.status(500).json({ message: 'Error updating product listing.' });
  }
});


router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product listing not found.' });
    }

    
    const isOwner = product.farmerEmail === req.user.email || (product.seller && product.seller.toString() === req.user.id);
    const isAdmin = req.user.role === 'admin';
    if (!isOwner && !isAdmin) {
      return res.status(403).json({ message: 'Forbidden. Ownership verification failed.' });
    }

    
    await Product.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: 'Product listing deleted successfully.' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting product listing.' });
  }
});

// Toggle stock status of a crop listing.
router.patch('/:id/toggle-stock', authenticateToken, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product listing not found.' });
    }

  
    const isOwner = product.farmerEmail === req.user.email || (product.seller && product.seller.toString() === req.user.id);
    const isAdmin = req.user.role === 'admin';
    if (!isOwner && !isAdmin) {
      return res.status(403).json({ message: 'Forbidden. Ownership verification failed.' });
    }

    
    product.inStock = !product.inStock;
    if (product.inStock && product.stock === 0) {
      product.stock = 100;
    } else if (!product.inStock) {
      product.stock = 0;
    }

    await product.save();
    res.status(200).json(product);
  } catch (error) {
    res.status(500).json({ message: 'Error toggling product stock.' });
  }
});

export default router;
