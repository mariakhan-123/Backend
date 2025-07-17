const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require("path");
const userRoutes = require('./routes/userRoutes');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true
}));

app.use(express.json());

app.use('/users', userRoutes);

// Static file serving
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use('/defaults', express.static(path.join(__dirname, 'public/defaults')));

mongoose.connect('mongodb://localhost:27017/Database')
  .then(() => {
    console.log('MongoDB connected successfully');
  })
  .catch((err) => {
    console.error('MongoDB connection error:', err);
  });

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
