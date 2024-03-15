const express = require('express');
const mongoose = require('mongoose');
const Flashcard = require('../models/Flashcard');
const { isAuthenticated } = require('./middleware/authMiddleware');
const { updateMetrics } = require('../utils/spacedRepetition');
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
    const { responseCorrectness, responseTime } = req.body;

    let flashcard = await Flashcard.findById(id);

    if (!flashcard) {
      console.log(`Flashcard not found with ID: ${req.params.id}`);
      return res.status(404).json({ error: 'Flashcard not found' });
    }

    const updatedMetrics = updateMetrics({ responseCorrectness, responseTime }, flashcard.metrics);

    flashcard.metrics = updatedMetrics;
    await flashcard.save();
    
    console.log(`Flashcard metrics updated successfully for ID: ${flashcard.id}`);
    res.json({ message: 'Flashcard metrics updated successfully', flashcard });
  } catch (error) {
    console.error(`Error updating flashcard metrics: ${error.message}`, error.stack);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;