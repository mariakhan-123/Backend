const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const userRoutes = require('./routes/userRoutes');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// 🟢 Enable CORS (allow requests from frontend)
app.use(cors({
  origin: 'http://localhost:3000', // frontend URL
  credentials: true // if you're sending cookies (optional)
}));

// 🟢 Only use express.json() for JSON. Multipart/form-data needs multer, not this.
app.use(express.json());

// 🟢 Mount user routes
app.use('/users', userRoutes);

// 🟢 Connect MongoDB
mongoose.connect('mongodb://localhost:27017/Database')
  .then(() => {
    console.log('MongoDB connected successfully');
  })
  .catch((err) => {
    console.error('MongoDB connection error:', err);
  });

// 🟢 Start the server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
