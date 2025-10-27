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

    // --- Full Handbook Data (from handbook.js) ---
    // This fixes the "stuck screen" problem
    const handbookData = {
      "Aktivierung": {
        "texts": [
          "Der Status der Automation wird durch das Automationssymbol im Display angezeigt. Erscheint das Symbol grau, ist das teilautomatisierte Fahren nicht verfügbar.",
          "Wenn das Automationssymbol weiß im Display aufleuchtet, ist das teilautomatisierte Fahren verfügbar. Bei Bedingungen, wie zum Beispiel schlechtem Wetter, kann es unter Umständen nicht verfügbar sein.",
          "Drücken Sie die Aktivierungstaste, um das teilautomatisierte Fahren zu aktivieren.",
          "Bei erfolgreicher Aktivierung, leuchtet das Automationssymbol grün im Display auf.",
          "Zudem leuchten die Lenkradlichter grün.",
          "Es sind nun alle Fahrerassistenzsysteme aktiv und das Fahrzeug fährt teilautomatisiert. Richten Sie Ihren Blick weiterhin auf die Straße und nehmen Sie die Füße von den Pedalen. Ihre Hände können Sie während der automatisierten Fahrt vom Lenkrad nehmen oder am Lenkrad belassen, ohne zu lenken."
        ],
        "media": [
          { "variable": "daGIF1", "path": "/HMI_GIFs/1neu1.gif" },
          { "variable": "daGIF1_neu", "path": "/HMI_GIFs/1neu2.gif" },
          { "variable": "daGIF2", "path": "/HMI_GIFs/1-2.gif" },
          { "variable": "daGIF3", "path": "/HMI_GIFs/1neu3.gif" },
          { "variable": "daGIF4", "path": "/HMI_GIFs/1-4.gif" },
          { "variable": "daJPG5", "path": "/HMI_GIFs/4-3.jpg" }
        ],
        "questions": [] // Using empty array to prevent syntax errors
      },
      "Verkehrszeichen": {
        "texts": [
          "Das Fahrzeug erkennt Tempolimits.",
          "Das erkannte Tempolimit wird im Display angezeigt. Bei einem neuen Tempolimit wird die erkannte Geschwindigkeit automatisch übernommen.",
          "Drücken Sie den Hebel nach oben oder unten, um die Geschwindigkeit individuell zu erhöhen (oben) oder zu verringern (unten)",
          "Ihre individuell eingestellte Geschwindigkeit wird im Display angezeigt."
        ],
        "media": [
          { "variable": "vzGIF1", "path": "/HMI_GIFs/2neu1.gif" },
          { "variable": "vzGIF2", "path": "/HMI_GIFs/2neu2.gif" },
          { "variable": "vzGIF3", "path": "/HMI_GIFs/2-4.gif" },
          { "variable": "vzGIF4", "path": "/HMI_GIFs/2neu3.gif" }
        ],
        "questions": []
      },
      "Abstand": {
        "texts": [
          "Das Fahrzeug hält den Abstand zum Vorderfahrzeug automatisch. Es bremst oder beschleunigt, falls nötig.",
          "Drücken Sie die Abstandstasten, um den Abstand zum Vorderfahrzeug individuell zu erhöhen (rechts) oder zu verringern (links).",
          "Der individuell eingestellte Abstand wird im Display symbolisch angezeigt. Die Striche vor dem Fahrzeug visualisieren den Abstand – je mehr Striche, desto größer der eingestellte Abstand."
        ],
        "media": [
          { "variable": "accGIF2", "path": "/HMI_GIFs/3-2.gif" },
          { "variable": "accGIF3", "path": "/HMI_GIFs/3-3.gif" },
          { "variable": "accGIF1", "path": "/HMI_GIFs/3neu1.gif" }
        ],
        "questions": []
      },
       "Ampelerkennung": {
        "texts": [
          "Das Fahrzeug erkennt Ampeln und bremst bei roten Ampeln automatisch bis zum Stillstand ab.",
          "Im Stillstand müssen Sie übernehmen und manuell anfahren. Das teilautomatisierte Fahren kann wieder aktiviert werden, sobald das Symbol weiß im Display aufleuchtet."
        ],
        "media": [
          { "variable": "ampGIF1", "path": "/HMI_GIFs/4neu1.gif" },
          { "variable": "ampGIF2", "path": "/HMI_GIFs/4neu2.gif" }
        ],
        "questions": []
      },
      "Spurführung": {
        "texts": [
          "Das Fahrzeug hält automatisch die Spur, wenn das teilautomatisierte Fahren aktiv ist.",
          "Das Fahrzeug wechselt auf mehrspurigen Straßen automatisch die Spur, wenn Sie den Blinker antippen und es der Verkehr zulässt. Es beobachtet dabei selbstständig die Umgebung."
        ],
        "media": [
          { "variable": "spGIF1", "path": "/HMI_GIFs/6-2.gif" },
          { "variable": "spGIF2", "path": "/HMI_GIFs/1-2.gif" },
          { "variable": "spGIF3", "path": "/HMI_GIFs/9-3.gif" }
        ],
        "questions": []
      },
      "Notbremsung": {
        "texts": [
          "Das Fahrzeug erkennt Hindernisse. Bevor es zum Zusammenstoß mit einem Hindernis, einer Person oder einem weiteren Fahrzeug kommt, bremst das Fahrzeug bis zum Stillstand ab",
          "Im Stillstand müssen Sie übernehmen und manuell anfahren. Das teilautomatisierte Fahren kann wieder aktiviert werden, sobald das Symbol weiß im Display aufleuchtet."
        ],
        "media": [
          { "variable": "nbGIF1", "path": "/HMI_GIFs/8-2.gif" },
          { "variable": "nbGIF2", "path": "/HMI_GIFs/6neu1.gif" }
        ],
        "questions": []
      },
      "Deaktivierung": {
        "texts": [
          "Drücken Sie die Aktivierungstaste erneut, um das teilautomatisierte Fahren zu beenden.",
          "Es wird auch beendet, wenn Sie manuell Lenken oder das Bremspedal drücken.",
          "Bei erfolgreicher Deaktivierung, erlöschen die Lenkradlichter und das Automationssymbol im Display erscheint wieder weiß."
        ],
        "media": [
          { "variable": "decGIF1", "path": "/HMI_GIFs/1-2.gif" },
          { "variable": "decGIF2", "path": "/HMI_GIFs/9-2.gif" },
          { "variable": "decGIF3", "path": "/HMI_GIFs/9-3.gif" },
          { "variable": "decGIF4", "path": "/HMI_GIFs/7neu1.gif" }
        ],
        "questions": []
      },
       "Risiken/Verantwortung": {
        "texts": [
          "Das teilautomatisierte Fahren entbindet Sie nicht von der Verantwortung als Fahrer*in. Es funktioniert in den meisten Fällen sehr gut, kann jedoch nicht alle Fahrsituationen abdecken. Kommt das System an seine Grenzen, warnt es Sie und fordert zur Übernahme auf.",
          "Es kann jedoch vorkommen, dass das Fahrzeug Fehler macht, ohne vorher zu warnen. Achten Sie deshalb immer auf den Verkehr und die Umgebung. Sie müssen jederzeit sofort eingreifen können. Im Folgenden einige Beispiele für mögliche Fehler:",
          "Das Fahrzeug erkennt einen Kreisverkehr nicht und lenkt falsch.",
          "Das Fahrzeug erkennt die Fahrspur nicht wegen einer Baustelle.",
          "Das Fahrzeug bremst bei einer roten Ampel trotz Betätigung der SET-Taste nicht ab.",
          "Das Fahrzeug erkennt beim Spurwechsel umliegende Fahrzeuge nicht."
        ],
        "media": [
          { "variable": "riskGIF1", "path": "/HMI_GIFs/8neu1.gif" },
          { "variable": "riskGIF2", "path": "/HMI_GIFs/10-1_anim.gif" },
          { "variable": "riskGIF3", "path": "/GIFs/10-2.gif" },
          { "variable": "riskGIF4", "path": "/GIFs/10-3.gif" },
          { "variable": "riskGIF5", "path": "/GIFs/10-4.gif" }
        ],
        "questions": []
      }
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

    /**
     * NEW: Appends a media (GIF) element to the chat.
     * @param {string} chapterName - The key from handbookData (e.g., "Spurführung").
     */
    function addMedia(chapterName) {
        const chapter = handbookData[chapterName];
        // Check if the chapter and its media exist, and take the first media item
        if (chapter && chapter.media && chapter.media.length > 0) {
            const mediaPath = chapter.media[0].path;
            
            const mediaElement = document.createElement('img');
            mediaElement.src = mediaPath;
            mediaElement.classList.add('message', 'media-message');
            mediaElement.style.width = '100%'; // Or any style you prefer
            mediaElement.style.marginTop = '10px';
            mediaElement.style.borderRadius = '12px';

            chatMessages.appendChild(mediaElement);
            chatMessages.scrollTop = chatMessages.scrollHeight;
        } else {
            console.warn(`No media found for chapter: ${chapterName}`);
        }
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
        // This is the user's message, it's a 'const'
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
                cache: 'no-store' // Keep this to prevent caching
            });
            
            if (!response.ok) throw new Error('Failed to get a response from the assistant.');

            const data = await response.json();
            // This is the AI's response, it's a 'let' so we can change it
            let aiResponseText = data.message;

            console.log("Raw response from AI:", aiResponseText);

            // Check for our special media tag
            const chapterTagRegex = /\[SHOW_CHAPTER: (.*?)\]/;
            // Run the regex on the AI's response, not the user's message
            const match = aiResponseText.match(chapterTagRegex);

            console.log("Regex match object:", match);

            // This logic is now correct: if (match) means "if the tag was found"
            if (match) {
                console.log("Tag found!");

                // 1. Get the chapter name (e.g., "Spurführung")
                const chapterName = match[1];
                console.log("Chapter name:", chapterName);

                // 2. Remove the tag from the text
                aiResponseText = aiResponseText.replace(chapterTagRegex, '').trim();
                console.log("Cleaned message text:", aiResponseText);
                
                // 3. Add the clean text message
                addMessage(aiResponseText, 'assistant');
                // 4. Add the media
                addMedia(chapterName);

            } else {
                console.log("No tag found. Displaying regular message.");
                
                // No tag found, just add the original AI message
                addMessage(aiResponseText, 'assistant');
            }

        } catch (error) {
            console.error('Error sending message:', error);
            addMessage('Entschuldigung, ein Fehler ist aufgetreten. Bitte stellen Sie Ihre Frage erneut.', 'assistant');
        }
    });

    // --- Initial Setup ---
    buildAssessmentForm();
});