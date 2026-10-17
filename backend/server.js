const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const seedDatabase = require('./seed');

const app = express();
const PORT = process.env.PORT || 5000;

// Universal bulletproof CORS: reflects request origin & handles preflight OPTIONS
app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (origin) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Accept, Origin');
    res.setHeader('Vary', 'Origin');
  } else {
    res.setHeader('Access-Control-Allow-Origin', '*');
  }

  // Fast preflight resolution for browser fetch/axios
  if (req.method === 'OPTIONS') {
    return res.sendStatus(204);
  }
  next();
});

app.use(express.json({ limit: '15mb' }));
app.use(express.urlencoded({ extended: true, limit: '15mb' }));

// MongoDB Connection URI via environment variable
const MONGO_URI = process.env.MONGO_URI;

if (!MONGO_URI) {
  console.error('❌ CRITICAL: MONGO_URI is not defined in environment variables.');
  console.error('Please configure MONGO_URI in your .env file or Render dashboard.');
} else {
  // Connect to MongoDB Atlas
  mongoose
    .connect(MONGO_URI, { serverSelectionTimeoutMS: 5000 })
    .then(async () => {
      console.log('✅ Successfully connected to MongoDB Atlas (gebeta_qr)');
      // Auto-seed initial data if collections are empty
      await seedDatabase();
    })
    .catch((err) => {
      console.error('❌ MongoDB Connection Error:', err.message);
    });
}

// Root route for Render service healthcheck
app.get('/', (req, res) => {
  res.json({
    status: 'ok',
    service: 'GebetaQR Backend API',
    version: '1.0.0',
    documentation: '/api/health',
    timestamp: new Date()
  });
});

// API Routes
app.use('/api/categories', require('./routes/categories'));
app.use('/api/menu', require('./routes/menu'));
app.use('/api/tables', require('./routes/tables'));
app.use('/api/orders', require('./routes/orders'));
app.use('/api/payments', require('./routes/payments'));
app.use('/api/staff', require('./routes/staff'));
app.use('/api/settings', require('./routes/settings'));
app.use('/api/upload', require('./routes/upload'));

// Detailed Healthcheck
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'GebetaQR Backend API',
    mongoConnected: mongoose.connection.readyState === 1,
    timestamp: new Date()
  });
});

app.listen(PORT, () => {
  console.log(`🚀 GebetaQR Backend Server running on port ${PORT}`);
});

module.exports = app;

