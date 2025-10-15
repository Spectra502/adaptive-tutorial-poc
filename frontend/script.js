document.addEventListener('DOMContentLoaded', () => {
    // --- Global Element References ---
    const assessmentContainer = document.getElementById('assessment-container');
    const assessmentForm = document.getElementById('assessment-form');
    const formQuestionsContainer = document.getElementById('form-questions');
    const chatContainer = document.getElementById('chat-container');
    const chatMessages = document.getElementById('chat-messages');
    const chatForm = document.getElementById('chat-form');
    const chatInput = document.getElementById('chat-input');

    // --- State Variables ---
    let sessionId = null;

    // --- Hardcoded Chapter Data for the Form ---
    const assessableChapters = {
        'Verkehrszeichenassistent': 'Verkehrszeichen',
        'Abstandsregeltempomat': 'Abstand',
        'Ampelerkennung': 'Ampelerkennung',
        'Spurführungsassistent': 'Spurführung',
        'Notbremsassistent': 'Notbremsung'
    };

    // --- Helper Functions ---

    /**
     * Creates the HTML for a single slider question.
     */
    function createSliderQuestion(chapterName, chapterId) {
        return `
            <div class="slider-wrapper" style="margin-bottom: 25px;">
                <h4>${chapterName}</h4>
                <div class="slider-container">
                    <input type="range" name="${chapterId}" id="${chapterId}" min="1" max="7" value="4" oninput="this.nextElementSibling.textContent = this.value">
                    <span class="slider-value">4</span>
                </div>
                <div class="slider-labels">
                    <span>Wenig Wissen</span>
                    <span>Viel Wissen</span>
                </div>
            </div>
        `;
    }

    /**
     * Builds the initial assessment form dynamically.
     */
    function buildAssessmentForm() {
        let formHTML = '';
        for (const [name, id] of Object.entries(assessableChapters)) {
            formHTML += createSliderQuestion(name, id);
        }
        formQuestionsContainer.innerHTML = formHTML;
    }

    /**
     * Appends a message to the chat window.
     * @param {string} text - The message content.
     * @param {string} sender - 'user' or 'assistant'.
     */
    function addMessage(text, sender) {
        // Remove any existing typing indicator
        const indicator = document.getElementById('typing-indicator');
        if (indicator) indicator.remove();

        const messageElement = document.createElement('div');
        messageElement.classList.add('message', `${sender}-message`);
        messageElement.textContent = text;
        chatMessages.appendChild(messageElement);

        // Scroll to the bottom
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    /**
     * Shows a "typing..." indicator in the chat.
     */
    function showTypingIndicator() {
        const indicator = document.createElement('div');
        indicator.id = 'typing-indicator';
        indicator.classList.add('message', 'typing-indicator');
        indicator.textContent = 'CIELO tippt...';
        chatMessages.appendChild(indicator);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    // --- Event Handlers ---

    /**
     * Handles the submission of the initial assessment form.
     */
    assessmentForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        const submitButton = document.getElementById('submit-button');
        submitButton.disabled = true;
        submitButton.textContent = 'Initialisiere...';

        const formData = new FormData(assessmentForm);
        const scores = {};
        for (const id of Object.values(assessableChapters)) {
            scores[id] = {
                capability: parseInt(formData.get(id), 10),
                limitation: 0 // Limitation is not used in this version
            };
        }

        try {
            const response = await fetch('/start-chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ scores }),
            });
            if (!response.ok) throw new Error('Could not start chat session.');

            const data = await response.json();
            sessionId = data.sessionId;

            // Transition to chat view
            assessmentContainer.style.display = 'none';
            chatContainer.style.display = 'flex';

            // Display the assistant's welcome message
            addMessage(data.message, 'assistant');

        } catch (error) {
            console.error('Error starting chat:', error);
            alert('Fehler beim Starten des Chats. Bitte versuchen Sie es erneut.');
            submitButton.disabled = false;
            submitButton.textContent = 'Chat starten';
        }
    });

    /**
     * Handles sending a new chat message.
     */
    chatForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        const messageText = chatInput.value.trim();

        if (!messageText || !sessionId) return;

        // Display user's message immediately
        addMessage(messageText, 'user');
        chatInput.value = '';
        showTypingIndicator();

        try {
            const response = await fetch('/chat-message', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ sessionId, message: messageText }),
            });
            if (!response.ok) throw new Error('Failed to get a response from the assistant.');

            const data = await response.json();
            addMessage(data.message, 'assistant');

        } catch (error) {
            console.error('Error sending message:', error);
            addMessage('Entschuldigung, ein Fehler ist aufgetreten. Bitte stellen Sie Ihre Frage erneut.', 'assistant');
        }
    });

    // --- Initial Setup ---
    buildAssessmentForm();
});