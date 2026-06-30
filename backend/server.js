const express = require('express');
const cors = require('cors');
require('dotenv').config();

const { initializeDatabase } = require('./config/db');
const { initModels } = require('./models');

const app = express();
const PORT = process.env.PORT || 5000;

// Enable CORS for frontend connection (Vite default is 5173, but we can allow all in local development)
app.use(cors({
  origin: '*', // In production, replace with specific domain
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

// Routes
const authRoutes = require('./routes/authRoutes');
app.use('/api/auth', authRoutes);

// Health Check / Welcome Route
app.get('/', (req, res) => {
  res.json({ message: 'MailBox-Client Backend API is running.' });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: 'Something went wrong on the server!'
  });
});

async function startServer() {
  try {
    // 1. Check and initialize database
    await initializeDatabase();
    
    // 2. Initialize Models and Sync
    const { sequelize } = initModels();
    
    // Sync models (creates tables if they do not exist)
    await sequelize.sync({ alter: true });
    console.log('Database synchronized successfully.');

    // 3. Start server
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();
