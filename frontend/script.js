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
    // --- NEW: Quiz State ---
    let inQuizMode = false;


    // --- Hardcoded Chapter Data for the Form ---
    const assessableChapters = {
        'Verkehrszeichenassistent': 'Verkehrszeichen',
        'Abstandsregeltempomat': 'Abstand',
        'Ampelerkennung': 'Ampelerkennung',
        'Spurführungsassistent': 'Spurführung',
        'Notbremsassistent': 'Notbremsung',
        //'Aktivierung': 'Aktivierung',
        //'Risiken und Verantwortung': 'Risiken/Verantwortung'
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
    "questions": [
      {
        "questionText": "Wie können Sie als Fahrer*in das teilautomatisierte Fahren aktivieren?",
        "possibleAnswers": [
          "Durch das Drücken des Bremspedals",
          "Durch das Drücken der Aktivierungstaste",
          "Durch das Loslassen des Lenkrads",
          "Durch einen Doppelklick auf die Set-Taste"
        ],
        "correctAnswerIndex": 1
      },
      {
        "questionText": "Leuchtet das Automationssymbol in weiß, ist das teilautomatisierte Fahren verfügbar.",
        "possibleAnswers": ["Richtig", "Falsch"],
        "correctAnswerIndex": 0
      },
      {
        "questionText": "In welcher Farbe leuchtet das Automationssymbol bei erfolgreicher Aktivierung des teilautomatisierten Fahrens?",
        "possibleAnswers": ["Blau", "Rot", "Gelb", "Grün"],
        "correctAnswerIndex": 3
      }
    ]
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
    "questions": [
       {
        "questionText": "Bei einem neuen Tempolimit wird die erkannte Geschwindigkeit automatisch übernommen.",
        "possibleAnswers": ["Richtig", "Falsch"],
        "correctAnswerIndex": 0
      },
      {
        "questionText": "Wo wird Ihnen als Fahrer*in das erkannte Tempolimit angezeigt?",
        "possibleAnswers": [
          "Im Seitenspiegel",
          "Im Display ",
          "Auf dem Lenkrad",
          "Im Rückspiegel"
        ],
        "correctAnswerIndex": 1
      },
      {
        "questionText": "Können Sie als Fahrer*in die Geschwindigkeit während der teilautomatisierten Fahrt (nach der Übernahme) manuell anpassen?",
        "possibleAnswers": ["Ja", "Nein"],
        "correctAnswerIndex": 0
      }
    ]
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
    "questions": [
       {
        "questionText": "Ist das teilautomatisierte Fahren aktiviert, hält das Fahrzeug automatisch den Abstand zum Vorderfahrzeug.",
        "possibleAnswers": ["Richtig", "Falsch"],
        "correctAnswerIndex": 0
      },
      {
        "questionText": "Für Sie als Fahrer*in ist es nicht möglich, den Abstand zum Vorderfahrzeug individuell anzupassen.",
        "possibleAnswers": ["Richtig", "Falsch"],
        "correctAnswerIndex": 1
      },
      {
        "questionText": "Wie wird der eingestellte Abstand zum Vorderfahrzeug im Display symbolisch dargestellt?",
        "possibleAnswers": [
          "Durch ein rotes Lenkrad",
          "Durch Blinken des Automationssymbols",
          "Durch Striche vor dem Fahrzeug",
          "Durch ein weißes Dreieck"
        ],
        "correctAnswerIndex": 2
      }
    ]
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
    "questions": [
      {
        "questionText": "Erkennt das Fahrzeug Ampeln, wenn das teilautomatisierte Fahren aktiv ist?",
        "possibleAnswers": ["Richtig", "Falsch"],
        "correctAnswerIndex": 0
      },
      {
        "questionText": "Das Fahrzeug bremst automatisch, wenn es eine rote Ampel erkannt hat.",
        "possibleAnswers": ["Richtig", "Falsch"],
        "correctAnswerIndex": 0
      },
      {
        "questionText": "Im Stillstand erkennt das Fahrzeug grüne Ampeln und fährt automatisch wieder los.",
        "possibleAnswers": ["Richtig", "Falsch"],
        "correctAnswerIndex": 1
      }
    ]
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
    "questions": [
      {
        "questionText": "Ist das teilautomatisierte Fahren aktiv, hält das Fahrzeug die Spur selbstständig.",
        "possibleAnswers": ["Richtig", "Falsch"],
        "correctAnswerIndex": 0
      },
      {
        "questionText": "Können Sie als Fahrer*in das Lenkrad loslassen, wenn das teilautomatisierte Fahren aktiv ist?",
        "possibleAnswers": ["Ja", "Nein"],
        "correctAnswerIndex": 0
      },
      {
        "questionText": "Das Fahrzeug schlägt eigenständig Spurwechsel vor, auch wenn es die Verkehrssituation nicht zulässt.",
        "possibleAnswers": ["Richtig", "Falsch"],
        "correctAnswerIndex": 1
      }
    ]
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
    "questions": [
      {
        "questionText": "Funktioniert der Notbremsassistent nur bei statischen Hindernissen?",
        "possibleAnswers": ["Ja", "Nein"],
        "correctAnswerIndex": 1
      },
      {
        "questionText": "In welcher Situation greift der Notbremsassistent ein?",
        "possibleAnswers": [
          "Wenn der Fahrer eine Warnung durch die Set-Taste bestätigt",
          "Nur in bestimmten Verkehrssituationen",
          "Wenn eine Kollision mit einem Hindernis, einer Person oder einem Fahrzeug droht",
          "Nur bei niedrigen Geschwindigkeiten unter 30 km/h"
        ],
        "correctAnswerIndex": 2
      },
      {
        "questionText": "Was passiert, wenn der Notbremsassistent eine Kollisionsgefahr registriert?",
        "possibleAnswers": [
          "Der Fahrer wird dazu aufgefordert, selbst zu bremsen",
          "Das Fahrzeug bremst automatisch bis zum Stillstand",
          "Das Fahrzeug reagiert gar nicht.",
          "Der Fahrer erhält nur eine visuelle Warnung"
        ],
        "correctAnswerIndex": 1
      }
    ]
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
    "questions": [
      {
        "questionText": "Wie kann das teilautomatisierte Fahren deaktiviert werden?",
        "possibleAnswers": [
          "Durch langes Drücken der Set-Taste",
          "Durch kurzes Antippen des Blinkers",
          "Durch erneutes Drücken der Aktivierungstaste",
          "Durch manuelles Einstellen des Abstands über die Abstandstasten"
        ],
        "correctAnswerIndex": 2
      },
      {
        "questionText": "Kann das teilautomatisierte Fahren durch manuelles Eingreifen (z.B. Lenken oder Bremsen) durch Sie als Fahrer*in deaktiviert werden?",
        "possibleAnswers": ["Ja", "Nein"],
        "correctAnswerIndex": 0
      },
      {
        "questionText": "Wie wird angezeigt, dass das teilautomatisierte Fahren deaktiviert wurde?",
        "possibleAnswers": [
          "Durch ein rotes Ausrufezeichen im Display",
          "Durch ein akustisches Signal und eine Vibration im Lenkrad",
          "Durch das Erlöschen der Lenkradlichter und das weiße Automationssymbol",
          "Durch eine Warnmeldung im Head-Up-Display"
        ],
        "correctAnswerIndex": 2
      }
    ]
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
    "questions": [
      {
        "questionText": "Das teilautomatisierte Fahren entbindet Sie als Fahrer*in von der Verantwortung, sodass Sie nicht mehr aufmerksam sein müssen.",
        "possibleAnswers": ["Richtig", "Falsch"],
        "correctAnswerIndex": 1
      },
      {
        "questionText": "Müssen Sie als Fahrer*in jederzeit auf unvorhersehbare Situationen vorbereitet sein?",
        "possibleAnswers": ["Ja", "Nein"],
        "correctAnswerIndex": 0
      },
      {
        "questionText": "Warum dürfen Sie sich als Fahrer*in nicht vollständig auf die Assistenzsysteme verlassen?",
        "possibleAnswers": [
          "Weil die Systeme zu langsam reagieren",
          "Weil das teilautomatisierte Fahrzeug immer 10 km/h schneller fährt als erlaubt",
          "Weil die Systeme Fehler machen können, ohne Sie als Fahrer*in zu warnen",
          "Weil das teilautomatisierte Fahren nur auf Autobahnen nutzbar ist"
        ],
        "correctAnswerIndex": 2
      }
    ]
  }
}

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
     * Appends a media (GIF) element to the chat.
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
            mediaElement.style.marginTop = '5px';
            mediaElement.style.borderRadius = '12px';

            chatMessages.appendChild(mediaElement);
            chatMessages.scrollTop = chatMessages.scrollHeight;
        } else {
            console.warn(`No media found for chapter: ${chapterName}`);
        }
    }
    
    // --- NEW: Quiz Functions ---
    
    /**
     * Starts a quiz for a specific chapter.
     * @param {string} chapterKey - The key from handbookData (e.g., "Verkehrszeichen").
     */
    async function startQuiz(chapterKey) {
        if (inQuizMode) return; // Don't start a quiz if one is active
        
        inQuizMode = true;
        chatInput.disabled = true;
        chatInput.placeholder = "Bitte beantworte die Quizfrage...";
        
        try {
            const response = await fetch('/start-quiz', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ sessionId, chapterName: chapterKey }),
            });
            
            if (!response.ok) {
                const err = await response.json();
                throw new Error(err.error || 'Failed to start quiz');
            }
            
            const questionData = await response.json();
            renderQuestion(questionData);
            
        } catch (error) {
            console.error('Error starting quiz:', error);
            addMessage(`Fehler beim Starten des Quiz: ${error.message}`, 'assistant');
            stopQuiz(); // Reset the UI
        }
    }
    
    /**
     * Renders a question and its answer buttons.
     * @param {object} questionData - { questionText, possibleAnswers }
     */
    function renderQuestion(questionData) {
        // Add question as a message
        addMessage(questionData.questionText, 'assistant');
        
        // Create a container for the answer buttons
        const buttonContainer = document.createElement('div');
        buttonContainer.classList.add('message', 'quiz-options');
        buttonContainer.style.alignSelf = 'flex-start'; // Align with assistant messages
        buttonContainer.style.display = 'flex';
        buttonContainer.style.flexDirection = 'column';
        buttonContainer.style.gap = '8px';
        buttonContainer.style.width = '80%'; // Match message width
        
        questionData.possibleAnswers.forEach((answer, index) => {
            const button = document.createElement('button');
            button.textContent = answer;
            button.classList.add('quiz-button'); // For styling
            button.style.width = '100%';
            button.style.padding = '10px';
            button.style.textAlign = 'left';
            
            // Add click handler to submit the answer
            button.onclick = () => {
                // Disable all buttons in this group after one is clicked
                buttonContainer.querySelectorAll('.quiz-button').forEach(btn => btn.disabled = true);
                submitAnswer(index);
            };
            buttonContainer.appendChild(button);
        });
        
        chatMessages.appendChild(buttonContainer);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }
    
    /**
     * Submits an answer to the backend.
     * @param {number} answerIndex - The index of the chosen answer.
     */
    async function submitAnswer(answerIndex) {
        try {
            const response = await fetch('/submit-answer', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ sessionId, answerIndex }),
            });
            
            if (!response.ok) throw new Error('Failed to submit answer');
            
            const data = await response.json();
            
            // 1. Show feedback for the answer
            addMessage(data.feedback, 'assistant');
            
            // 2. Check if quiz is over
            if (data.quizComplete) {
                addMessage(data.finalMessage, 'assistant');
                stopQuiz(); // Reset UI
            } else {
                // 3. Render the next question
                renderQuestion(data.nextQuestion);
            }
            
        } catch (error) {
            console.error('Error submitting answer:', error);
            addMessage('Ein Fehler ist aufgetreten. Bitte versuche, das Quiz mit "stop quiz" neu zu starten.', 'assistant');
        }
    }
    
    /**
     * Resets the UI from quiz mode back to chat mode.
     */
    function stopQuiz() {
        inQuizMode = false;
        chatInput.disabled = false;
        chatInput.placeholder = "Fragen Sie mich etwas...";
        
        // Remove any leftover quiz buttons
        document.querySelectorAll('.quiz-options').forEach(el => el.remove());
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
     * --- MODIFIED to be smarter about starting quizzes ---
     */
    chatForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        const messageText = chatInput.value.trim();

        if (!messageText || !sessionId) return;
        
        // --- NEW: Smarter Quiz Router Logic ---
        
        // 1. Define our triggers
        const quizTriggerRegex = /(quiz|test|wissen testen|frag mich)/i;
        
        // 2. Build a regex from all known chapter names (keys AND friendly names)
        const chapterKeys = Object.values(assessableChapters); // e.g., ['Verkehrszeichen', 'Abstand']
        const chapterFriendlyNames = Object.keys(assessableChapters); // e.g., ['Verkehrszeichenassistent', 'Abstandsregeltempomat']
        const allPossibleNames = [...chapterKeys, ...chapterFriendlyNames];
        const chapterRegex = new RegExp(`(${allPossibleNames.join('|')})`, 'i');

        // 3. Test the user's message
        const hasQuizTrigger = quizTriggerRegex.test(messageText);
        const chapterMatch = messageText.match(chapterRegex);
        
        // 4. If we have BOTH a trigger AND a chapter, start the quiz
        if (hasQuizTrigger && chapterMatch) {
            const matchedName = chapterMatch[1]; // This is what the regex found, e.g., "Ampelerkennung" or "Abstandsregeltempomat"
            
            // Resolve to the *actual* chapter key (e.g., 'Abstandsregeltempomat' -> 'Abstand')
            let chapterKey = assessableChapters[matchedName]; // Check if it was a friendly name
            if (!chapterKey) {
                 chapterKey = matchedName; // It was already a key
            }

            // 5. Check if that chapter *actually* has questions
            if (handbookData[chapterKey] && handbookData[chapterKey].questions && handbookData[chapterKey].questions.length > 0) {
                addMessage(messageText, 'user'); // Show user's trigger message
                addMessage(`Natürlich! Ich starte das Quiz für: ${chapterKey}. Sag einfach 'stop quiz', um aufzuhören.`, 'assistant');
                chatInput.value = ''; // Clear input
                startQuiz(chapterKey); // Call the one-by-one quiz function
                return; // Stop further execution
            } else {
                 // The chapter exists, but has no questions in handbook.js
                 addMessage(messageText, 'user');
                 addMessage(`Entschuldigung, ich habe zwar das Kapitel "${chapterKey}" gefunden, aber es sind keine Quizfragen dafür hinterlegt.`, 'assistant');
                 chatInput.value = '';
                 return;
            }
        }
        
        // Check if user is in quiz mode and tries to chat normally
        if (inQuizMode) {
             addMessage("Bitte beantworte die Frage über die Schaltflächen oder tippe 'stop quiz', um das Quiz zu beenden.", 'assistant');
             return;
        }
        
        // --- End of Quiz Router Logic ---
        

        // If not a quiz command, proceed as a normal chat message
        addMessage(messageText, 'user');
        chatInput.value = '';
        showTypingIndicator();

        try {
            const response = await fetch('/chat-message', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ sessionId, message: messageText }),
                cache: 'no-store'
            });
            
            if (!response.ok) {
                const err = await response.json();
                throw new Error(err.error || 'Failed to get a response from the assistant.');
            }

            const data = await response.json();
            let aiResponseText = data.message;

            console.log("Raw response from AI:", aiResponseText);

            // Check for our special media tag
            const chapterTagRegex = /\[SHOW_CHAPTER: (.*?)\]/;
            const match = aiResponseText.match(chapterTagRegex);

            console.log("Regex match object:", match);

            if (match) {
                console.log("Tag found!");

                const chapterName = match[1];
                console.log("Chapter name:", chapterName);
                aiResponseText = aiResponseText.replace(chapterTagRegex, '').trim();
                console.log("Cleaned message text:", aiResponseText);
                
                addMessage(aiResponseText, 'assistant');
                addMedia(chapterName);

            } else {
                console.log("No tag found. Displaying regular message.");
                addMessage(aiResponseText, 'assistant');
            }

        } catch (error) {
            console.error('Error sending message:', error);
            addMessage(`Entschuldigung, ein Fehler ist aufgetreten: ${error.message}`, 'assistant');
        }
    });

    // --- Initial Setup ---
    buildAssessmentForm();
});