const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
const PORT = process.env.PORT || 5000;

// CORS Configuration
const corsOptions = {
  origin: ['http://localhost:5173', 'http://localhost:3000'], // Add your frontend URLs
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
};

app.use(cors(corsOptions));

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// In-memory storage for demo purposes (replace with database in production)
let users = [];

// Users endpoint
app.post('/users', (req, res) => {
  try {
    const { name, email, companyName } = req.body;

    // Validate required fields
    if (!name || !email || !companyName) {
      return res.status(400).json({
        error: 'Missing required fields',
        message: 'Name, email, and companyName are required'
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        error: 'Invalid email format',
        message: 'Please provide a valid email address'
      });
    }

    // Check if user already exists
    const existingUser = users.find(user => user.email === email);
    if (existingUser) {
      return res.status(409).json({
        error: 'User already exists',
        message: 'A user with this email already exists'
      });
    }

    // Create new user with company info
    const newUser = {
      id: Date.now().toString(),
      name: name.trim(),
      email: email.toLowerCase().trim(),
      companyName: companyName.trim(),
      createdAt: new Date().toISOString()
    };

    // Save user (in production, save to database)
    users.push(newUser);

    console.log('New user created:', newUser);

    res.status(201).json({
      message: 'User created successfully',
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        companyName: newUser.companyName
      }
    });

  } catch (error) {
    console.error('Server error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Something went wrong on the server'
    });
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    message: 'Server is running',
    timestamp: new Date().toISOString()
  });
});

// Get all users (for debugging - remove in production)
app.get('/users', (req, res) => {
  res.json({
    users: users,
    count: users.length
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on http://192.168.0.89:${PORT}`);
  console.log(`Health check: http://192.168.0.89:${PORT}/health`);
});