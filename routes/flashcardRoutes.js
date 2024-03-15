const express = require('express');
const mongoose = require('mongoose');
const Flashcard = require('../models/Flashcard');
const Analytics = require('../models/Analytics');
const { isAuthenticated } = require('./middleware/authMiddleware');
const { calculateAndUpdateMetrics } = require('../utils/spacedRepetition');
const router = express.Router();

// POST /api/flashcards - Create a new flashcard
router.post('/api/flashcards', isAuthenticated, async (req, res) => {
  try {
    const flashcard = await Flashcard.create(req.body);
    console.log(`Flashcard created: ${flashcard.id}`);
    res.status(201).json(flashcard);
  } catch (error) {
    console.error(`Error creating flashcard: ${error.message}`, error);
    res.status(400).json({ error: error.message });
  }
});

// PUT /api/flashcards/:id - Update a flashcard
router.put('/api/flashcards/:id', isAuthenticated, async (req, res) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    console.log(`Invalid flashcard ID format: ${req.params.id}`);
    return res.status(400).json({ error: 'Invalid flashcard ID format. Please provide a valid ObjectId.' });
  }
  try {
    const flashcard = await Flashcard.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!flashcard) {
      console.log(`Flashcard not found with ID: ${req.params.id}`);
      return res.status(404).json({ error: 'Flashcard not found' });
    }
    console.log(`Flashcard updated: ${flashcard.id}`);
    res.json(flashcard);
  } catch (error) {
    console.error(`Error updating flashcard: ${error.message}`, error);
    res.status(400).json({ error: error.message });
  }
});

// DELETE /api/flashcards/:id - Delete a flashcard
router.delete('/api/flashcards/:id', isAuthenticated, async (req, res) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    console.log(`Invalid flashcard ID format: ${req.params.id}`);
    return res.status(400).json({ error: 'Invalid flashcard ID format. Please provide a valid ObjectId.' });
  }
  try {
    const flashcard = await Flashcard.findByIdAndDelete(req.params.id);
    if (!flashcard) {
      console.log(`Flashcard not found with ID: ${req.params.id}`);
      return res.status(404).json({ error: 'Flashcard not found' });
    }
    console.log(`Flashcard deleted: ${req.params.id}`);
    res.status(204).send();
  } catch (error) {
    console.error(`Error deleting flashcard: ${error.message}`, error);
    res.status(400).json({ error: error.message });
  }
});

// GET /api/flashcards - Fetch flashcards with optional subject filter and pagination
router.get('/api/flashcards', isAuthenticated, async (req, res) => {
  const { subject, page = 1, limit = 10 } = req.query;
  const query = subject ? { subject } : {};
  
  try {
    const flashcards = await Flashcard.find(query)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec();
    const count = await Flashcard.countDocuments(query);
    console.log(`Flashcards fetched. Count: ${flashcards.length}`);
    res.json({
      flashcards,
      totalPages: Math.ceil(count / limit),
      currentPage: page
    });
  } catch (error) {
    console.error(`Error fetching flashcards: ${error.message}`, error);
    res.status(400).json({ error: error.message });
  }
});

// POST /api/flashcards/:id/interact - User interacts with a flashcard
router.post('/api/flashcards/:id/interact', isAuthenticated, async (req, res) => {
  try {
    const { id } = req.params;
    const { responseCorrectness, responseTime, confidenceLevel } = req.body;
    const userId = req.session.userId;

    let flashcard = await Flashcard.findById(id);

    if (!flashcard) {
      console.log(`Flashcard not found with ID: ${req.params.id}`);
      return res.status(404).json({ error: 'Flashcard not found' });
    }

    // Extract current metrics from the flashcard
    const currentMetrics = flashcard.metrics;
    // Call the calculateAndUpdateMetrics function to get updated metrics
    const updatedMetrics = calculateAndUpdateMetrics({
      timestamp: new Date(),
      responseCorrectness,
      consecutiveCorrectResponses: currentMetrics.consecutiveCorrectResponses,
      responseTime,
      confidenceLevel,
      difficultyRating: currentMetrics.difficultyRating,
      sessionContext: '' // This can be expanded based on additional context if needed
    }, currentMetrics);

    flashcard.metrics = updatedMetrics;
    await flashcard.save();
    
    console.log(`Flashcard metrics updated successfully for ID: ${flashcard.id}`);
    // Record analytics data
    const analyticsData = {
      userId,
      flashcardId: flashcard._id,
      interactionTimestamp: new Date(),
      performanceMetrics: {
        responseTime,
        correctness: responseCorrectness,
      }
    };
    await Analytics.create(analyticsData);
    console.log('Analytics data recorded:', analyticsData);

    res.json({ message: 'Flashcard interaction recorded successfully', correct: responseCorrectness });
  } catch (error) {
    console.error(`Error updating flashcard metrics: ${error.message}`, error.stack);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;