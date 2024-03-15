const mongoose = require('mongoose');

const analyticsSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  flashcardId: { type: mongoose.Schema.Types.ObjectId, ref: 'Flashcard', required: true },
  interactionTimestamp: { type: Date, default: Date.now },
  performanceMetrics: {
    responseTime: { type: Number, required: true },
    correctness: { type: Boolean, required: true }
  }
});

analyticsSchema.pre('save', function(next) {
  console.log(`Recording analytics for user: ${this.userId} and flashcard: ${this.flashcardId}`);
  next();
});

analyticsSchema.post('save', function(doc) {
  console.log(`Successfully recorded analytics for user: ${doc.userId} and flashcard: ${doc.flashcardId}`);
});

const Analytics = mongoose.model('Analytics', analyticsSchema);

module.exports = Analytics;