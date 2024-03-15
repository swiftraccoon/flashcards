// spacedRepetition.js

/**
 * Calculates the next presentation timestamp for a flashcard based on user's interaction data
 * and updates the flashcard's spaced repetition metrics.
 * @param {Object} interactionData - User interaction data with the flashcard.
 * @param {Object} currentMetrics - Current spaced repetition metrics of the flashcard.
 * @returns {Object} Updated metrics including next presentation timestamp.
 */
const updateMetrics = (interactionData, currentMetrics) => {
  const { responseCorrectness, responseTime } = interactionData;

  // Example logic for updating metrics based on user's response correctness and response time
  let { consecutiveCorrectResponses, difficultyRating, sessionContext } = currentMetrics;

  if (responseCorrectness) {
    consecutiveCorrectResponses += 1;
    difficultyRating = Math.max(1, difficultyRating - 1);
  } else {
    consecutiveCorrectResponses = 0;
    difficultyRating = Math.min(5, difficultyRating + 1);
  }

  // Example calculation for next presentation timestamp based on difficulty rating
  const nextPresentationDelayHours = Math.pow(2, difficultyRating) * 4;
  const nextPresentationTimestamp = new Date();
  nextPresentationTimestamp.setHours(nextPresentationTimestamp.getHours() + nextPresentationDelayHours);

  // Update session context or other metrics as needed
  sessionContext = `Updated on ${new Date().toISOString()}`;

  console.log(`Spaced Repetition Metrics Updated: Next presentation at ${nextPresentationTimestamp}, Difficulty Rating: ${difficultyRating}`);

  return {
    ...currentMetrics,
    consecutiveCorrectResponses,
    difficultyRating,
    sessionContext,
    nextPresentationTimestamp, // Assuming this field is added to the metrics to track when to present the flashcard next
  };
};

module.exports = { updateMetrics };