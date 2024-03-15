const mongoose = require('mongoose');

const explanationSchema = new mongoose.Schema({
  flashcardId: { type: mongoose.Schema.Types.ObjectId, ref: 'Flashcard', required: true },
  content: { type: String, required: true },
}, { timestamps: true });

const Explanation = mongoose.model('Explanation', explanationSchema);

module.exports = Explanation;