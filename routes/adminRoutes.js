const express = require('express');
const Flashcard = require('../models/Flashcard');
const { isAuthenticated } = require('./middleware/authMiddleware');
const router = express.Router();

// Middleware to check if user is an admin
const isAdmin = (req, res, next) => {
  // Implement logic to verify if the logged-in user is an admin.
  // For now, it allows all authenticated users as a placeholder.
  console.log("Admin check passed.");
  next();
};

// GET route for admin panel
router.get('/admin/panel', isAuthenticated, isAdmin, async (req, res) => {
  try {
    const flashcards = await Flashcard.find({});
    res.render('adminPanel', { flashcards });
    console.log("Admin Panel accessed.");
  } catch (error) {
    console.error('Fetching flashcards for admin panel error:', error.message, error.stack);
    res.status(500).send('Internal Server Error');
  }
});

// POST route to create a new flashcard
router.post('/admin/flashcards', isAuthenticated, isAdmin, async (req, res) => {
  const { question, options, correctAnswer, subject } = req.body;
  
  // Splitting the options by comma and trimming whitespace
  const optionsArray = options.split(',').map(option => option.trim());

  try {
    // Creating the flashcard using the Flashcard model
    await Flashcard.create({
      question,
      options: optionsArray,
      correctAnswer: parseInt(correctAnswer),
      subject
    });
    // Redirecting to the admin panel with a success message
    req.flash('success', 'Flashcard created successfully');
    res.redirect('/admin/panel');
  } catch (error) {
    // Logging the error and redirecting back with an error message
    console.error('Error creating flashcard:', error.message, error.stack);
    req.flash('error', 'Failed to create flashcard');
    res.redirect('/admin/flashcards/create');
  }
});

// GET route to display the flashcard creation form
router.get('/admin/flashcards/create', isAuthenticated, isAdmin, (req, res) => {
  res.render('createFlashcard', { csrfToken: req.csrfToken() });
  console.log("Flashcard creation form displayed.");
});

// GET route to edit flashcard form
router.get('/admin/flashcards/:id/edit', isAuthenticated, isAdmin, async (req, res) => {
  try {
    const flashcard = await Flashcard.findById(req.params.id);
    if (!flashcard) {
      console.log(`Flashcard not found with ID: ${req.params.id}`);
      return res.status(404).send('Flashcard not found');
    }
    res.render('editFlashcard', { flashcard });
    console.log(`Editing flashcard with ID: ${req.params.id}`);
  } catch (error) {
    console.error('Fetching flashcard for edit error:', error.message, error.stack);
    res.status(500).send('Internal Server Error');
  }
});

// POST route to update a flashcard
router.post('/admin/flashcards/:id', isAuthenticated, isAdmin, async (req, res) => {
  try {
    await Flashcard.findByIdAndUpdate(req.params.id, req.body);
    console.log(`Flashcard updated with ID: ${req.params.id}`);
    res.redirect('/admin/panel');
  } catch (error) {
    console.error('Updating flashcard error:', error.message, error.stack);
    res.status(400).send('Error updating flashcard');
  }
});

// POST route to delete a flashcard
router.post('/admin/flashcards/:id/delete', isAuthenticated, isAdmin, async (req, res) => {
  try {
    await Flashcard.findByIdAndDelete(req.params.id);
    console.log(`Flashcard deleted with ID: ${req.params.id}`);
    res.redirect('/admin/panel');
  } catch (error) {
    console.error('Deleting flashcard error:', error.message, error.stack);
    res.status(500).send('Internal Server Error');
  }
});

module.exports = router;