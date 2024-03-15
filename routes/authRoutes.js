const express = require('express');
const User = require('../models/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const router = express.Router();

// {JWT_SECRET_KEY} - Set your JWT secret key in the .env file and use it here
const JWT_SECRET_KEY = process.env.JWT_SECRET_KEY;

router.get('/auth/register', (req, res) => {
  res.render('register', { csrfToken: req.csrfToken() });
});

router.post('/auth/register', async (req, res) => {
  try {
    const { username, password } = req.body;
    // User model will automatically hash the password using bcrypt
    await User.create({ username, password });
    req.flash('success', 'Registration successful. Please log in.');
    res.redirect('/auth/login');
  } catch (error) {
    console.error('Registration error:', error.message, error.stack);
    req.flash('error', 'Registration failed');
    res.status(500).redirect('/auth/register');
  }
});

router.get('/auth/login', (req, res) => {
  res.render('login', { csrfToken: req.csrfToken() });
});

router.post('/auth/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username });
    if (!user) {
      req.flash('error', 'User not found');
      return res.status(400).redirect('/auth/login');
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (isMatch) {
      // Maintain session-based authentication for web use
      req.session.userId = user._id;
      // Generate a token for API use
      const token = jwt.sign({ userId: user._id }, JWT_SECRET_KEY, { expiresIn: '1h' });
      console.log(`Login successful for user: ${username}. Token generated.`);
      console.log("Token: ", token);

      // Provide token for API use but also continue with the standard web session flow
      req.session.token = token; // Optionally store token in session for web clients to use in API requests
      req.flash('success', 'Login successful');
      res.redirect('/');
    } else {
      req.flash('error', 'Password is incorrect');
      return res.status(400).redirect('/auth/login');
    }
  } catch (error) {
    console.error('Login error:', error.message, error.stack);
    req.flash('error', 'Failed to log in');
    return res.status(500).redirect('/auth/login');
  }
});

router.get('/auth/logout', (req, res) => {
  try {
    req.flash('success', 'You have been logged out successfully'); // Set flash message before session destruction
    req.session.destroy(err => {
      if (err) {
        console.error('Error during session destruction:', err.message, err.stack);
        req.flash('error', 'Error logging out'); // Preserve error feedback for user experience
        return res.status(500).redirect('/auth/login');
      }
      res.clearCookie('connect.sid'); // Clear the session cookie
      res.redirect('/auth/login');
    });
  } catch (error) {
    console.error('Unexpected error during logout:', error.message, error.stack);
    req.flash('error', 'Unexpected error logging out');
    res.status(500).redirect('/auth/login');
  }
});

module.exports = router;