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
        if(flashcards.length === 0) {
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

        // Removed userId from the request payload as it's now set server-side
        fetch(`/api/flashcards/${flashcard._id}/interact`, { // Corrected endpoint to match server-side implementation
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                // Assuming the user's token is stored in localStorage after login
                'Authorization': `Bearer ${localStorage.getItem('token')}` // Ensure the token is sent with the request for authentication
            },
            body: JSON.stringify({ responseCorrectness: isCorrect, responseTime: 1200 }), // Adjusted to match the expected server-side format
        })
            .then(response => response.json())
            .then(result => {
                console.log(`Interaction submitted for flashcard ${flashcard._id}:`, result);
                nextFlashcard();
            })
            .catch(error => {
                console.error('Error submitting interaction:', error.message, error.stack);
            });
    }

    function nextFlashcard() {
        if(currentFlashcardIndex < flashcards.length - 1) {
            currentFlashcardIndex++;
            displayFlashcard();
        } else {
            console.log('Reached the end of flashcards.');
        }
    }

    nextButton.addEventListener('click', nextFlashcard);

    fetchFlashcards();
});