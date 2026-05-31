// routes/search.js — No MongoDB, pure in-memory data + live API
const express = require('express');
const router  = express.Router();
const { fetchRealPrices } = require('../services/priceService');

// ── Built-in demo data (fallback when no API key) ──────────────────
const DEMO_DATA = [
  // Chasma
  { name: 'Fastrack UV Protected Wayfarer Sunglasses', platform: 'Amazon',   category: 'chasma', price: 349,  originalPrice: 799,  rating: 4.2, reviews: '12,400', delivery: 'Free · 2 din',   url: 'https://www.amazon.in/s?k=sunglasses' },
  { name: 'Vincent Chase Rectangular Sunglasses',      platform: 'Flipkart', category: 'chasma', price: 449,  originalPrice: 999,  rating: 4.0, reviews: '8,100',  delivery: 'Free · 3 din',   url: 'https://www.flipkart.com/search?q=chasma' },
  { name: 'Stylish UV400 Chasma for Men and Women',   platform: 'Meesho',   category: 'chasma', price: 179,  originalPrice: 499,  rating: 3.8, reviews: '22,000', delivery: 'Free · 5-7 din', url: 'https://www.meesho.com/search?q=chasma' },
  // Earphones
  { name: 'Boat BassHeads 100 Bass Wired Earphones',  platform: 'Meesho',   category: 'earphones', price: 249, originalPrice: 699,  rating: 3.9, reviews: '41,000', delivery: 'Free · 5-7 din', url: 'https://www.meesho.com/search?q=earphones' },
  { name: 'Boat BassHeads 100 In-Ear Wired Earphones',platform: 'Flipkart', category: 'earphones', price: 349, originalPrice: 699,  rating: 4.3, reviews: '5,200',  delivery: 'Free · 2 din',   url: 'https://www.flipkart.com/search?q=earphones' },
  { name: 'Boat BassHeads 102 Wired Earphones',       platform: 'Amazon',   category: 'earphones', price: 499, originalPrice: 999,  rating: 4.4, reviews: '18,000', delivery: 'Free · 1 din',   url: 'https://www.amazon.in/s?k=earphones' },
  // Shirt
  { name: "Men's Casual Cotton Printed Shirt",        platform: 'Meesho',   category: 'shirt', price: 249,  originalPrice: 799,  rating: 3.7, reviews: '33,000', delivery: 'Free · 5-7 din', url: 'https://www.meesho.com/search?q=shirt' },
  { name: 'Arrow Men Regular Fit Solid Formal Shirt', platform: 'Flipkart', category: 'shirt', price: 599,  originalPrice: 1499, rating: 4.1, reviews: '9,400',  delivery: 'Free · 3 din',   url: 'https://www.flipkart.com/search?q=shirt' },
  { name: "Amazon Brand Men's Regular Fit Shirt",     platform: 'Amazon',   category: 'shirt', price: 649,  originalPrice: 1299, rating: 4.2, reviews: '7,800',  delivery: 'Free · 2 din',   url: 'https://www.amazon.in/s?k=shirt' },
  // Mixer Grinder
  { name: '3-in-1 Powerful Mixer Grinder 500W',       platform: 'Meesho',   category: 'mixer grinder', price: 999,  originalPrice: 2499, rating: 3.6, reviews: '11,000', delivery: 'Free · 6-8 din', url: 'https://www.meesho.com/search?q=mixer+grinder' },
  { name: 'Bajaj Rex 500W Mixer Grinder 3 Jars',      platform: 'Flipkart', category: 'mixer grinder', price: 1499, originalPrice: 2999, rating: 4.2, reviews: '18,000', delivery: 'Free · 3 din',   url: 'https://www.flipkart.com/search?q=mixer+grinder' },
  { name: 'Prestige Iris 550W Mixer Grinder 3 Jars',  platform: 'Amazon',   category: 'mixer grinder', price: 1799, originalPrice: 3500, rating: 4.4, reviews: '22,000', delivery: 'Free · 2 din',   url: 'https://www.amazon.in/s?k=mixer+grinder' },
  // Running Shoes
  { name: 'Sports Running Shoes Lightweight',          platform: 'Meesho',   category: 'running shoes', price: 399,  originalPrice: 1299, rating: 3.7, reviews: '56,000', delivery: 'Free · 5-7 din', url: 'https://www.meesho.com/search?q=running+shoes' },
  { name: "Sparx Men's Running Shoes SM-630",          platform: 'Flipkart', category: 'running shoes', price: 699,  originalPrice: 1499, rating: 4.1, reviews: '14,000', delivery: 'Free · 3 din',   url: 'https://www.flipkart.com/search?q=running+shoes' },
  { name: "Puma Men's Running Shoes Soft Foam+",       platform: 'Amazon',   category: 'running shoes', price: 1199, originalPrice: 2499, rating: 4.3, reviews: '9,100',  delivery: 'Free · 2 din',   url: 'https://www.amazon.in/s?k=running+shoes' },
  // Phone Cover
  { name: 'Transparent Shockproof Silicone Cover',    platform: 'Meesho',   category: 'phone cover', price: 79,  originalPrice: 299, rating: 3.8, reviews: '88,000', delivery: 'Free · 5-7 din', url: 'https://www.meesho.com/search?q=phone+cover' },
  { name: 'Flipkart Smartbuy Back Cover Case',         platform: 'Flipkart', category: 'phone cover', price: 149, originalPrice: 399, rating: 4.0, reviews: '31,000', delivery: 'Free · 3 din',   url: 'https://www.flipkart.com/search?q=phone+cover' },
  { name: 'Spigen Liquid Air Armor Phone Case',        platform: 'Amazon',   category: 'phone cover', price: 499, originalPrice: 999, rating: 4.5, reviews: '12,000', delivery: 'Free · 2 din',   url: 'https://www.amazon.in/s?k=phone+cover' },
  // Laptop
  { name: 'HP 15s Ryzen 5 8GB RAM 512GB SSD',         platform: 'Flipkart', category: 'laptop', price: 42990, originalPrice: 55000, rating: 4.3, reviews: '3,200', delivery: 'Free · 3 din', url: 'https://www.flipkart.com/search?q=laptop' },
  { name: 'Lenovo IdeaPad Slim 3 Intel i5 16GB',      platform: 'Amazon',   category: 'laptop', price: 44990, originalPrice: 58000, rating: 4.4, reviews: '2,800', delivery: 'Free · 2 din', url: 'https://www.amazon.in/s?k=laptop' },
  { name: 'Acer Aspire Lite AMD Ryzen 5 8GB',         platform: 'Meesho',   category: 'laptop', price: 38999, originalPrice: 52000, rating: 3.9, reviews: '1,100', delivery: 'Free · 6-8 din', url: 'https://www.meesho.com/search?q=laptop' },
  // Mobile
  { name: 'Redmi 13C 4GB RAM 128GB Storage',          platform: 'Flipkart', category: 'mobile', price: 8499,  originalPrice: 10999, rating: 4.2, reviews: '45,000', delivery: 'Free · 2 din',   url: 'https://www.flipkart.com/search?q=mobile' },
  { name: 'Samsung Galaxy M15 6GB 128GB',             platform: 'Amazon',   category: 'mobile', price: 10999, originalPrice: 14999, rating: 4.1, reviews: '22,000', delivery: 'Free · 1 din',   url: 'https://www.amazon.in/s?k=mobile+phone' },
  { name: 'Tecno Spark Go 2024 4GB 64GB',             platform: 'Meesho',   category: 'mobile', price: 6799,  originalPrice: 9999,  rating: 3.8, reviews: '18,000', delivery: 'Free · 5-7 din', url: 'https://www.meesho.com/search?q=mobile' },
  // Watch
  { name: 'Noise ColorFit Pro 4 Smartwatch',          platform: 'Flipkart', category: 'watch', price: 1499, originalPrice: 4999, rating: 4.1, reviews: '28,000', delivery: 'Free · 3 din',   url: 'https://www.flipkart.com/search?q=smartwatch' },
  { name: 'boAt Wave Sigma Smartwatch',               platform: 'Amazon',   category: 'watch', price: 1299, originalPrice: 3999, rating: 4.0, reviews: '19,000', delivery: 'Free · 2 din',   url: 'https://www.amazon.in/s?k=smartwatch' },
  { name: 'Fire-Boltt Ninja Call Pro Smartwatch',     platform: 'Meesho',   category: 'watch', price: 999,  originalPrice: 3499, rating: 3.7, reviews: '35,000', delivery: 'Free · 5-7 din', url: 'https://www.meesho.com/search?q=smartwatch' },
];

function searchDemo(query, maxPrice) {
  const q = query.toLowerCase();
  let results = DEMO_DATA.filter(p =>
    p.name.toLowerCase().includes(q) || p.category.toLowerCase().includes(q)
  );
  if (maxPrice) results = results.filter(p => p.price <= Number(maxPrice));
  return results
    .sort((a, b) => a.price - b.price)
    .map(p => ({
      ...p,
      discountPct: Math.round((1 - p.price / p.originalPrice) * 100),
      thumbnail: null,
      source: 'db',
    }));
}

function calcSavings(products) {
  if (products.length < 2) return null;
  const cheapest  = products[0];
  const costliest = products[products.length - 1];
  const saved     = costliest.price - cheapest.price;
  if (saved <= 0) return null;
  return {
    cheapestPlatform:  cheapest.platform,
    costliestPlatform: costliest.platform,
    savedAmount:       saved,
    savedPercent:      Math.round((saved / costliest.price) * 100),
  };
}

router.get('/', async (req, res) => {
  try {
    const { q, maxPrice } = req.query;
    if (!q || !q.trim()) {
      return res.status(400).json({ success: false, message: 'Search term zaroori hai' });
    }

    const query    = q.trim();
    const rapidKey = process.env.RAPIDAPI_KEY;
    const hasLive  = rapidKey && !rapidKey.includes('your_');

    let products   = [];
    let dataSource = 'db';

    // Try live API first
    if (hasLive) {
      try {
        const { results, source } = await fetchRealPrices(query, maxPrice);
        if (results && results.length > 0) {
          products   = results.map(p => ({ ...p, discountPct: Math.round((1 - p.price / p.originalPrice) * 100) }));
          dataSource = source;
        }
      } catch (e) {
        console.warn('Live fetch failed, using demo data:', e.message);
      }
    }

    // Fallback to built-in demo data
    if (products.length === 0) {
      products   = searchDemo(query, maxPrice);
      dataSource = 'db';
    }

    res.json({
      success:    true,
      query,
      count:      products.length,
      dataSource,
      isLive:     dataSource !== 'db',
      savings:    calcSavings(products),
      products,
    });

  } catch (err) {
    console.error('Search error:', err.message);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
