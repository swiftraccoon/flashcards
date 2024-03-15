document.addEventListener('DOMContentLoaded', function () {
    const nextButton = document.getElementById('next-flashcard');
    let currentFlashcardIndex = 0;
    let flashcards = [];

    function fetchFlashcards() {
        fetch('/api/flashcards') // Using the provided endpoint for fetching flashcards
            .then(response => response.json())
            .then(data => {
                flashcards = data.flashcards;
                displayFlashcard();
            })
            .catch(error => {
                console.error('Error fetching flashcards:', error.message, error.stack);
            });
    }

    function displayFlashcard() {
        if (flashcards.length === 0) {
            console.log('No flashcards fetched.');
            return;
        }
        const flashcard = flashcards[currentFlashcardIndex];
        document.getElementById('flashcard-question').innerText = flashcard.question;
        const optionsContainer = document.getElementById('flashcard-options');
        optionsContainer.innerHTML = '';
        flashcard.options.forEach((option, index) => {
            const button = document.createElement('button');
            button.innerText = option;
            button.classList.add('btn', 'btn-primary', 'answer-button', 'm-2');
            button.dataset.index = index;
            button.onclick = submitAnswer;
            optionsContainer.appendChild(button);
        });
    }

    function submitAnswer(event) {
        const selectedOptionIndex = event.target.dataset.index;
        const flashcard = flashcards[currentFlashcardIndex];
        const isCorrect = selectedOptionIndex == flashcard.correctAnswer;

        fetch(`/api/flashcards/${flashcard._id}/interact`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify({ responseCorrectness: isCorrect, responseTime: 1200 }),
        })
            .then(response => response.json())
            .then(result => {
                console.log(`Interaction submitted for flashcard ${flashcard._id}:`, result);
                displayFeedback(result.correct, event.target);
                setTimeout(nextFlashcard, 2000); // Add a delay before moving to the next question
            })
            .catch(error => {
                console.error('Error submitting interaction:', error.message, error.stack);
            });
    }

    function displayFeedback(isCorrect, selectedButton) {
        const feedbackMessageElement = document.createElement('div');
        feedbackMessageElement.classList.add('feedback-message');
        feedbackMessageElement.textContent = isCorrect ? 'Correct!' : 'Incorrect!';
        feedbackMessageElement.style.color = isCorrect ? 'green' : 'red';

        const optionsContainer = document.getElementById('flashcard-options');
        optionsContainer.childNodes.forEach(button => {
            button.disabled = true; // Disable all options after an answer is selected
            if (button.dataset.index == selectedButton.dataset.index) {
                button.style.backgroundColor = isCorrect ? 'lightgreen' : 'lightcoral';
            }
        });
        optionsContainer.appendChild(feedbackMessageElement); // Append the feedback message
    }

    function nextFlashcard() {
        if (currentFlashcardIndex < flashcards.length - 1) {
            currentFlashcardIndex++;
            displayFlashcard();
        } else {
            console.log('Reached the end of flashcards.');
        }
    }

    nextButton.addEventListener('click', nextFlashcard);

    fetchFlashcards();
});