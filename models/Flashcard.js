const mongoose = require('mongoose');

const flashcardSchema = new mongoose.Schema({
  question: { type: String, required: true },
  options: { type: [String], required: true },
  correctAnswer: { type: Number, required: true },
  subject: { type: String, required: true },
  metrics: {
    timestamp: { type: Date, default: Date.now },
    responseCorrectness: { type: Boolean, default: false },
    consecutiveCorrectResponses: { type: Number, default: 0 },
    responseTime: { type: Number, default: 0 }, // Considered in milliseconds
    confidenceLevel: { type: Number, default: 0 }, // Scale of 1-5
    difficultyRating: { type: Number, default: 0 }, // Scale of 1-5
    sessionContext: { type: String, default: '' }
  }
}, { timestamps: true });

flashcardSchema.index({ subject: 1 });

const Flashcard = mongoose.model('Flashcard', flashcardSchema);

module.exports = Flashcard;