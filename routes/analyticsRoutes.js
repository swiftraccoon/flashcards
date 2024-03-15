const express = require('express');
const Analytics = require('../models/Analytics');
const { isAuthenticated } = require('./middleware/authMiddleware');
const router = express.Router();

// Endpoint to record user interactions
router.post('/api/analytics', isAuthenticated, async (req, res) => {
  try {
    const userId = req.session.userId;
    if (!userId) {
      console.log('Session userId is missing');
      return res.status(401).send('User authentication required');
    }
    const analyticsData = await Analytics.create({...req.body, userId});
    console.log('Analytics data recorded:', analyticsData);
    res.status(201).json({ message: 'Analytics data recorded successfully', analyticsData });
  } catch (error) {
    console.error('Error recording analytics:', error.message, error.stack);
    res.status(500).send('Failed to record analytics data');
  }
});

// Endpoint to retrieve user analytics data
router.get('/api/analytics', isAuthenticated, async (req, res) => {
  try {
    const userId = req.session.userId;
    if (!userId) {
      console.log('Session userId is missing');
      return res.status(401).send('User authentication required');
    }
    const analytics = await Analytics.find({ userId }).lean();
    console.log('Analytics data fetched for user:', userId);
    res.json({ analytics });
  } catch (error) {
    console.error('Error fetching analytics:', error.message, error.stack);
    res.status(500).send('Failed to fetch analytics data');
  }
});

// Updated route for the dashboard page
router.get('/dashboard', isAuthenticated, async (req, res) => {
  try {
    const userId = req.session.userId;
    const analytics = await Analytics.find({ userId }).lean();
    if (!analytics || analytics.length === 0) {
      console.log(`No analytics data found for user: ${userId}`);
      res.render('dashboard', { analyticsData: JSON.stringify([]), message: 'No data available' });
      return;
    }
    const analyticsData = analytics.map(analytic => ({
      interactionTimestamp: analytic.interactionTimestamp,
      correctness: analytic.performanceMetrics.correctness ? 'Correct' : 'Incorrect',
      responseTime: analytic.performanceMetrics.responseTime
    }));
    res.render('dashboard', { analyticsData: JSON.stringify(analyticsData) });
    console.log(`Dashboard data prepared for user: ${userId}`);
  } catch (error) {
    console.error('Error loading dashboard page:', error.message, error.stack);
    res.status(500).send('Internal Server Error');
  }
});

module.exports = router;