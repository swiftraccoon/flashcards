// spacedRepetition.js

/**
 * Updates the spaced repetition metrics for a flashcard based on user interaction.
 * @param {Object} interactionData - The data from the user's interaction with the flashcard.
 * @param {Date} interactionData.timestamp - The timestamp of the interaction.
 * @param {boolean} interactionData.responseCorrectness - Whether the response was correct.
 * @param {number} interactionData.consecutiveCorrectResponses - The number of consecutive correct responses.
 * @param {number} interactionData.responseTime - The response time in milliseconds.
 * @param {number} interactionData.confidenceLevel - The user's reported confidence level (1-5).
 * @param {number} interactionData.difficultyRating - The difficulty rating of the flashcard (1-5).
 * @param {string} interactionData.sessionContext - A string representing the context of the study session.
 * @param {Object} currentMetrics - The current metrics for the flashcard.
 * @returns {Object} The updated metrics object.
 */
function calculateAndUpdateMetrics(interactionData, currentMetrics) {
  // Destructure the interaction data
  const {
    timestamp,
    responseCorrectness,
    consecutiveCorrectResponses,
    responseTime,
    confidenceLevel,
    difficultyRating,
    sessionContext,
  } = interactionData;

  // Update metrics based on interaction data
  let updatedMetrics = {
    ...currentMetrics,
    timestamp,
    responseCorrectness,
    consecutiveCorrectResponses: responseCorrectness ? consecutiveCorrectResponses + 1 : 0,
    responseTime,
    confidenceLevel,
    difficultyRating: responseCorrectness ? Math.max(1, difficultyRating - 1) : Math.min(5, difficultyRating + 1),
    sessionContext,
  };

  // Example of adjusting the next presentation timestamp based on difficulty rating
  const nextPresentationDelayHours = Math.pow(2, updatedMetrics.difficultyRating) * 4;
  const nextPresentationTimestamp = new Date(timestamp);
  nextPresentationTimestamp.setHours(nextPresentationTimestamp.getHours() + nextPresentationDelayHours);
  updatedMetrics.nextPresentationTimestamp = nextPresentationTimestamp;

  console.log(`Spaced Repetition Metrics Updated: Next presentation at ${nextPresentationTimestamp}, Difficulty Rating: ${updatedMetrics.difficultyRating}`);

  return updatedMetrics;
}

module.exports = { calculateAndUpdateMetrics };