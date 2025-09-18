const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// DEBUG: Check if environment variables are loading
console.log('Environment variables:');
console.log('PORT:', process.env.PORT);
console.log('RESEND_API_KEY:', process.env.RESEND_API_KEY ? '***LOADED***' : 'MISSING!');
console.log('CONTACT_EMAIL:', process.env.CONTACT_EMAIL);

const contactRoutes = require('./routes/contact');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api', contactRoutes);

// Basic route for testing
app.get('/', (req, res) => {
  res.json({ message: 'Portfolio Backend API is running!' });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});