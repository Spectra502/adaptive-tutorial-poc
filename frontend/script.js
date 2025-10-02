document.addEventListener('DOMContentLoaded', () => {
    const formQuestionsContainer = document.getElementById('form-questions');
    const assessmentForm = document.getElementById('assessment-form');
    const submitButton = document.getElementById('submit-button');
    const resultsArea = document.getElementById('results-area');
    const analysisSteps = document.getElementById('analysis-steps');
    const pathDisplay = document.getElementById('path-display');
    const contentArea = document.getElementById('content-area');

    let sessionId = null;

    // The chapters that require assessment
    const assessableChapters = [
        'Verkehrszeichen', 'Abstand', 'Ampelerkennung', 'Spurführung', 'Notbremsung'
    ];

    // --- Function to build the form dynamically ---
    function buildAssessmentForm() {
        let formHTML = '';
        assessableChapters.forEach(chapter => {
            const chapterId = chapter.toLowerCase().replace(' ', '-');
            formHTML += `
                <div class="form-section">
                    <h4>${chapter}</h4>
                    <div class="form-question">
                        <label for="capability-${chapterId}">Wie gut kennen Sie die <strong>Fähigkeiten</strong> des Systems?</label>
                        <select name="capability-${chapterId}" id="capability-${chapterId}">
                            ${[...Array(7).keys()].map(n => `<option value="${n+1}">${n+1}</option>`).join('')}
                        </select>
                    </div>
                    <div class="form-question">
                        <label for="limitation-${chapterId}">Wie gut kennen Sie die <strong>Grenzen & Risiken</strong> des Systems?</label>
                        <select name="limitation-${chapterId}" id="limitation-${chapterId}">
                            ${[...Array(7).keys()].map(n => `<option value="${n+1}">${n+1}</option>`).join('')}
                        </select>
                    </div>
                </div>
            `;
        });
        formQuestionsContainer.innerHTML = formHTML;
    }

    // --- Start the session and build the form ---
    async function startSession() {
        try {
            const response = await fetch('/start');
            const data = await response.json();
            sessionId = data.sessionId;
            buildAssessmentForm(); // Build the form on page load
        } catch (error) {
            contentArea.innerHTML = `<h2>Fehler</h2><p>Verbindung zum Backend konnte nicht hergestellt werden. Läuft der Server?</p>`;
        }
    }

    // --- Handle Form Submission ---
    assessmentForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        submitButton.disabled = true;
        submitButton.textContent = 'Analysiere...';

        const formData = new FormData(assessmentForm);
        const scores = {};
        assessableChapters.forEach(chapter => {
            const chapterId = chapter.toLowerCase().replace(' ', '-');
            scores[chapter] = {
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
            const data = await response.json();
            displayResults(data);
        } catch (error) {
            resultsArea.innerHTML = `<h2>Fehler</h2><p>Etwas ist schiefgelaufen.</p>`;
            resultsArea.style.display = 'block';
        } finally {
            submitButton.disabled = false;
            submitButton.textContent = 'Lernpfad erstellen';
        }
    });

    // --- Display the full analysis ---
    function displayResults(data) {
        // Hide the form and initial text
        assessmentForm.style.display = 'none';
        contentArea.style.display = 'none';

        // Show the results area
        resultsArea.style.display = 'block';

        // Step 1: Show Danger Gaps
        analysisSteps.innerHTML = `
            <div>
                <strong>Schritt 1: "Danger Gap" Analyse</strong>
                <p>Hier berechnen wir die Differenz zwischen Ihren Fähigkeits- und Grenzwert-Bewertungen. Ein hoher positiver Wert deutet auf mögliches Übervertrauen hin.</p>
                <pre>${JSON.stringify(data.analysis.dangerGaps, null, 2)}</pre>
            </div>
            <div>
                <strong>Schritt 2: Priorisierung der adaptiven Kapitel</strong>
                <p>Die Kapitel werden basierend auf dem höchsten "Danger Gap" sortiert, um die größten Wissenslücken zuerst zu schließen.</p>
                <pre>${JSON.stringify(data.analysis.sortedAdaptivePath, null, 2)}</pre>
            </div>
        `;

        // Step 3 & 4: Show Final Path and AI Reasoning
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