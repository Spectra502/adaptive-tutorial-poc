document.addEventListener('DOMContentLoaded', () => {
    const formQuestionsContainer = document.getElementById('form-questions');
    const assessmentForm = document.getElementById('assessment-form');
    const submitButton = document.getElementById('submit-button');
    const resultsArea = document.getElementById('results-area');
    const analysisSteps = document.getElementById('analysis-steps');
    const pathDisplay = document.getElementById('path-display');
    const contentArea = document.getElementById('content-area');
    const questionArea = document.getElementById('question-area');
    const questionTitle = document.getElementById('question-title');
    const questionText = document.getElementById('question-text');
    const questionChoices = document.getElementById('question-choices');
    const submitAnswerButton = document.getElementById('submit-answer-button');

    let sessionId = null;
    let currentChapter = null;

    const assessableChapters = [
        'Verkehrszeichenassistent', 'Abstandsregeltempomat', 'Ampelerkennung', 'Spurführungsassistent', 'Notbremsassistent'
    ];
    
    const chapterDetails = {
        'Verkehrszeichenassistent': 'Erkennt Verkehrszeichen und zeigt die Informationen im Fahrzeug an. Kann die Geschwindigkeit entsprechend automatisch anpassen.',
        'Abstandsregeltempomat': 'Hält automatisch einen voreingestellten Abstand zum vorausfahrenden Fahrzeug durch Beschleunigen und Abbremsen.',
        'Ampelerkennung': 'Erkennt Ampeln und zeigt den Status im Fahrzeug an. Kann auf das Ampelsignal reagieren oder die Fahrperson entsprechend informieren.',
        'Spurführungsassistent': 'Erkennt die Fahrspurmarkierungen und hält das Fahrzeug aktiv in der Spur, ohne die Fahrspur zu verlassen.',
        'Notbremsassistent': 'Erkennt Kollisionsgefahren und warnt davor. Bremst bei drohender Kollision automatisch zur Reduktion der Aufprallgeschwindigkeit.'
    };

    const serverChapterMap = {
        'Verkehrszeichenassistent': 'Verkehrszeichen',
        'Abstandsregeltempomat': 'Abstand',
        'Ampelerkennung': 'Ampelerkennung',
        'Spurführungsassistent': 'Spurführung',
        'Notbremsassistent': 'Notbremsung'
    };

    function createSliderQuestion(type, chapter) {
        const chapterId = serverChapterMap[chapter].toLowerCase().replace(' ', '-');
        const description = chapterDetails[chapter];
        const nameAttribute = type === 'capability' ? `capability-${chapterId}` : `limitation-${chapterId}`;
        const uniqueId = `${type}-${chapterId}`;

        return `
            <div class="form-section">
                <h4>${chapter}</h4>
                <p class="description">${description}</p>
                <div class="slider-wrapper">
                    <div class="slider-container">
                        <input type="range" name="${nameAttribute}" id="${uniqueId}" min="1" max="7" value="4" oninput="document.getElementById('value-${uniqueId}').textContent = this.value">
                        <span class="slider-value" id="value-${uniqueId}">4</span>
                    </div>
                    <div class="slider-labels">
                        <span>keins</span><span>sehr wenig</span><span>wenig</span><span>eher wenig</span><span>eher viel</span><span>viel</span><span>sehr viel</span>
                    </div>
                </div>
            </div>
        `;
    }

    function buildAssessmentForm() {
        let theoreticalHTML = '<h3>Wie viel theoretisches Wissen (z.B. über Artikel, Videos, etc.) haben Sie über die folgenden Fahrerassistenzsysteme?</h3>';
        let practicalHTML = '<h3>Wie viel praktische Erfahrung haben Sie mit den folgenden Fahrerassistenzsystemen?</h3>';
        assessableChapters.forEach(chapter => {
            theoreticalHTML += createSliderQuestion('capability', chapter);
            practicalHTML += createSliderQuestion('limitation', chapter);
        });
        formQuestionsContainer.innerHTML = theoreticalHTML + practicalHTML;
    }

    async function startSession() {
        try {
            const response = await fetch('/start');
            if (!response.ok) throw new Error('Network response was not ok');
            const data = await response.json();
            sessionId = data.sessionId;
            buildAssessmentForm();
        } catch (error) {
            console.error('Error starting session:', error);
            contentArea.innerHTML = `<h2>Fehler</h2><p>Verbindung zum Backend konnte nicht hergestellt werden. Läuft der Server?</p>`;
        }
    }

    assessmentForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        submitButton.disabled = true;
        submitButton.textContent = 'Analysiere...';

        const formData = new FormData(assessmentForm);
        const scores = {};
        
        Object.values(serverChapterMap).forEach(serverChapter => {
            const chapterId = serverChapter.toLowerCase().replace(' ', '-');
            scores[serverChapter] = {
                capability: parseInt(formData.get(`capability-${chapterId}`), 10),
                limitation: parseInt(formData.get(`limitation-${chapterId}`), 10)
            };
        });
        const openAnswer = formData.get('open-question');

        try {
            const response = await fetch('/respond', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ sessionId, scores, openAnswer }),
            });
            if (!response.ok) {
                const errData = await response.json();
                throw new Error(errData.error || 'Server error');
            }
            const data = await response.json();

            if (data.needsQuestions) {
                assessmentForm.style.display = 'none';
                contentArea.style.display = 'none';
                questionArea.style.display = 'block';
                fetchNextQuestion();
            } else {
                displayResults(data);
            }

        } catch (error) {
            console.error('Error submitting form:', error);
            resultsArea.innerHTML = `<h2>Fehler</h2><p>Etwas ist schiefgelaufen: ${error.message}</p>`;
            resultsArea.style.display = 'block';
        } finally {
            submitButton.disabled = false;
            submitButton.textContent = 'Lernpfad erstellen';
        }
    });

    async function fetchNextQuestion() {
        try {
            const response = await fetch('/question', {
                headers: { 'X-Session-ID': sessionId }
            });
            if (!response.ok) throw new Error('Could not fetch the next question.');
            const data = await response.json();

            currentChapter = data.chapter;
            questionTitle.textContent = `Kontrollfrage für: ${data.chapter}`;
            questionText.textContent = data.question;
            
            questionChoices.innerHTML = '';
            Object.entries(data.choices).forEach(([key, value]) => {
                const choiceEl = document.createElement('div');
                choiceEl.classList.add('choice');
                choiceEl.dataset.key = key;
                choiceEl.textContent = `${key}) ${value}`;
                questionChoices.appendChild(choiceEl);
            });

        } catch (error) {
            console.error('Error fetching question:', error);
            questionArea.innerHTML = `<p>Fehler beim Laden der Frage.</p>`;
        }
    }

    questionChoices.addEventListener('click', (event) => {
        if (event.target.classList.contains('choice')) {
            [...questionChoices.children].forEach(child => child.classList.remove('selected'));
            event.target.classList.add('selected');
        }
    });

    submitAnswerButton.addEventListener('click', async () => {
        const selectedChoice = questionChoices.querySelector('.choice.selected');
        if (!selectedChoice) {
            alert('Bitte wählen Sie eine Antwort aus.');
            return;
        }

        const answer = selectedChoice.dataset.key;
        submitAnswerButton.disabled = true;
        submitAnswerButton.textContent = 'Prüfe...';

        try {
            const response = await fetch('/answer', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ sessionId, chapter: currentChapter, answer }),
            });
            if (!response.ok) {
                const errData = await response.json();
                throw new Error(errData.error || 'Server error');
            }
            const data = await response.json();

            if (data.hasMoreQuestions) {
                fetchNextQuestion();
            } else {
                questionArea.style.display = 'none';
                displayResults(data);
            }

        } catch (error) {
            console.error('Error submitting answer:', error);
            questionArea.innerHTML = `<p>Fehler bei der Übermittlung der Antwort: ${error.message}</p>`;
        } finally {
            submitAnswerButton.disabled = false;
            submitAnswerButton.textContent = 'Antwort bestätigen';
        }
    });

    function displayResults(data) {
        assessmentForm.style.display = 'none';
        contentArea.style.display = 'none';
        resultsArea.style.display = 'block';

        analysisSteps.innerHTML = `
            <div>
                <strong>Schritt 1: "Danger Gap" Analyse</strong>
                <p>Hier berechnen wir die Differenz zwischen Ihren Bewertungen für theoretisches Wissen (Fähigkeiten) und praktische Erfahrung (Grenzen). Ein hoher positiver Wert deutet auf mögliches Übervertrauen hin und löst eine Kontrollfrage aus.</p>
                <pre>${JSON.stringify(data.analysis.dangerGaps, null, 2)}</pre>
            </div>
            <div>
                <strong>Schritt 2: Priorisierung der adaptiven Kapitel</strong>
                <p>Die Kapitel, bei denen Sie eine Wissenslücke zeigten (falsche Antwort oder Übervertrauen), werden basierend auf dem "Danger Gap" sortiert.</p>
                <pre>${JSON.stringify(data.analysis.sortedAdaptivePath, null, 2)}</pre>
            </div>
        `;

        pathDisplay.innerHTML = `
            <strong>Schritt 3: Erstellung des finalen Lernpfads ("Safety Sandwich")</strong>
            <p>Ihr personalisierter Pfad wird in eine feste Struktur eingefügt, die mit den Grundlagen beginnt und mit Sicherheitsthemen endet.</p>
            <pre>${data.finalPath.join(' → ')}</pre>
            <hr>
            <strong>Schritt 4: Begründung der KI</strong>
            <p>Basierend auf der gesamten Analyse hat die KI die folgende Begründung für Ihren Lernpfad generiert.</p>
            <p><em>${data.reasoning}</em></p>
        `;
    }

    startSession();
});