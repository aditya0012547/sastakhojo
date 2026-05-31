// models/Product.js
// Mongoose schema — ek product ka structure define karta hai MongoDB ke liye

const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,          // naam zaroori hai
  },
  platform: {
    type: String,
    required: true,
    enum: ['Amazon', 'Flipkart', 'Meesho'],  // sirf yeh teen platforms allowed
  },
  category: {
    type: String,
    required: true,          // jaise: chasma, earphones, shirt
    lowercase: true,
  },
  price: {
    type: Number,
    required: true,
  },
  originalPrice: {
    type: Number,
    required: true,
  },
  rating: {
    type: Number,
    min: 0,
    max: 5,
  },
  reviews: {
    type: String,            // jaise "12,400"
  },
  delivery: {
    type: String,            // jaise "Free delivery · 2 din"
  },
  url: {
    type: String,            // platform ka product/search link
  },
}, {
  timestamps: true,          // createdAt aur updatedAt automatically add hoga
});

// Export: server.js aur routes mein use hoga
module.exports = mongoose.model('Product', productSchema);
