// seed.js
// Yeh file MongoDB mein sample products insert karti hai
// Run: node seed.js

const mongoose = require('mongoose');
const Product  = require('./models/Product');

// MongoDB connection string (local)
const MONGO_URI = 'mongodb://localhost:27017/sastakhojo';

// ===== SAMPLE PRODUCTS DATA =====
const products = [
  // --- Chasma ---
  { name: 'Fastrack UV Protected Wayfarer Sunglasses Unisex', platform: 'Amazon',   category: 'chasma', price: 349,  originalPrice: 799,  rating: 4.2, reviews: '12,400', delivery: 'Free delivery · 2 din',   url: 'https://www.amazon.in/s?k=sunglasses' },
  { name: 'Vincent Chase Rectangular Polycarbonate Sunglasses', platform: 'Flipkart', category: 'chasma', price: 449,  originalPrice: 999,  rating: 4.0, reviews: '8,100',  delivery: 'Free delivery · 3 din',   url: 'https://www.flipkart.com/search?q=chasma' },
  { name: 'Stylish UV400 Chasma for Men and Women',            platform: 'Meesho',   category: 'chasma', price: 179,  originalPrice: 499,  rating: 3.8, reviews: '22,000', delivery: 'Free delivery · 5-7 din', url: 'https://www.meesho.com/search?q=chasma' },

  // --- Earphones ---
  { name: 'Boat BassHeads 100 Bass Wired Earphones',           platform: 'Meesho',   category: 'earphones', price: 249, originalPrice: 699,  rating: 3.9, reviews: '41,000', delivery: 'Free delivery · 5-7 din', url: 'https://www.meesho.com/search?q=earphones' },
  { name: 'Boat BassHeads 100 In-Ear Wired Earphones',         platform: 'Flipkart', category: 'earphones', price: 349, originalPrice: 699,  rating: 4.3, reviews: '5,200',  delivery: 'Free delivery · 2 din',   url: 'https://www.flipkart.com/search?q=earphones' },
  { name: 'Boat BassHeads 102 Wired Earphones with Mic',       platform: 'Amazon',   category: 'earphones', price: 499, originalPrice: 999,  rating: 4.4, reviews: '18,000', delivery: 'Free delivery · 1 din',   url: 'https://www.amazon.in/s?k=earphones' },

  // --- Shirt ---
  { name: "Men's Casual Cotton Printed Shirt Full Sleeve",     platform: 'Meesho',   category: 'shirt', price: 249,  originalPrice: 799,  rating: 3.7, reviews: '33,000', delivery: 'Free delivery · 5-7 din', url: 'https://www.meesho.com/search?q=shirt' },
  { name: 'Arrow Men Regular Fit Solid Formal Shirt',          platform: 'Flipkart', category: 'shirt', price: 599,  originalPrice: 1499, rating: 4.1, reviews: '9,400',  delivery: 'Free delivery · 3 din',   url: 'https://www.flipkart.com/search?q=shirt' },
  { name: "Amazon Brand Men's Regular Fit Casual Shirt",       platform: 'Amazon',   category: 'shirt', price: 649,  originalPrice: 1299, rating: 4.2, reviews: '7,800',  delivery: 'Free delivery · 2 din',   url: 'https://www.amazon.in/s?k=shirt' },

  // --- Mixer Grinder ---
  { name: '3-in-1 Powerful Mixer Grinder 500W 3 Jars',        platform: 'Meesho',   category: 'mixer grinder', price: 999,  originalPrice: 2499, rating: 3.6, reviews: '11,000', delivery: 'Free delivery · 6-8 din', url: 'https://www.meesho.com/search?q=mixer+grinder' },
  { name: 'Bajaj Rex 500W Mixer Grinder with 3 Jars',          platform: 'Flipkart', category: 'mixer grinder', price: 1499, originalPrice: 2999, rating: 4.2, reviews: '18,000', delivery: 'Free delivery · 3 din',   url: 'https://www.flipkart.com/search?q=mixer+grinder' },
  { name: 'Prestige Iris 550W Mixer Grinder, 3 Jars',          platform: 'Amazon',   category: 'mixer grinder', price: 1799, originalPrice: 3500, rating: 4.4, reviews: '22,000', delivery: 'Free delivery · 2 din',   url: 'https://www.amazon.in/s?k=mixer+grinder' },

  // --- Running Shoes ---
  { name: 'Sports Running Shoes Men Lightweight Breathable',   platform: 'Meesho',   category: 'running shoes', price: 399,  originalPrice: 1299, rating: 3.7, reviews: '56,000', delivery: 'Free delivery · 5-7 din', url: 'https://www.meesho.com/search?q=running+shoes' },
  { name: "Sparx Men's Running Shoes SM-630",                  platform: 'Flipkart', category: 'running shoes', price: 699,  originalPrice: 1499, rating: 4.1, reviews: '14,000', delivery: 'Free delivery · 3 din',   url: 'https://www.flipkart.com/search?q=running+shoes' },
  { name: "Puma Men's Running Shoes Soft Foam+ Cushion",       platform: 'Amazon',   category: 'running shoes', price: 1199, originalPrice: 2499, rating: 4.3, reviews: '9,100',  delivery: 'Free delivery · 2 din',   url: 'https://www.amazon.in/s?k=running+shoes' },

  // --- Phone Cover ---
  { name: 'Transparent Shockproof Silicone Phone Cover',       platform: 'Meesho',   category: 'phone cover', price: 79,  originalPrice: 299, rating: 3.8, reviews: '88,000', delivery: 'Free delivery · 5-7 din', url: 'https://www.meesho.com/search?q=phone+cover' },
  { name: 'Flipkart Smartbuy Back Cover Silicon Case',         platform: 'Flipkart', category: 'phone cover', price: 149, originalPrice: 399, rating: 4.0, reviews: '31,000', delivery: 'Free delivery · 3 din',   url: 'https://www.flipkart.com/search?q=phone+cover' },
  { name: 'Spigen Liquid Air Armor Phone Cover Case',          platform: 'Amazon',   category: 'phone cover', price: 499, originalPrice: 999, rating: 4.5, reviews: '12,000', delivery: 'Free delivery · 2 din',   url: 'https://www.amazon.in/s?k=phone+cover' },
];

// ===== DATABASE CONNECT + INSERT =====
async function seedDB() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('✅ MongoDB se connect ho gaya');

    // Pehle sab delete karo (fresh start)
    await Product.deleteMany({});
    console.log('🗑️  Purana data delete ho gaya');

    // Naya data insert karo
    await Product.insertMany(products);
    console.log(`✅ ${products.length} products successfully insert ho gaye!`);

    // Done — connection band karo
    await mongoose.disconnect();
    console.log('🔌 MongoDB connection band ho gaya');
    process.exit(0);
  } catch (err) {
    console.error('❌ Error:', err.message);
    process.exit(1);
  }
}

seedDB();
