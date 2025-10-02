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
        'Verkehrszeichenassistent', 'Abstandsregeltempomat', 'Ampelerkennung', 'Spurführungsassistent', 'Notbremsassistent'
    ];
    
    // Descriptions from the image, mapped to chapter names for easy access
    const chapterDetails = {
        'Verkehrszeichenassistent': 'Erkennt Verkehrszeichen und zeigt die Informationen im Fahrzeug an. Kann die Geschwindigkeit entsprechend automatisch anpassen.',
        'Abstandsregeltempomat': 'Hält automatisch einen voreingestellten Abstand zum vorausfahrenden Fahrzeug durch Beschleunigen und Abbremsen.',
        'Ampelerkennung': 'Erkennt Ampeln und zeigt den Status im Fahrzeug an. Kann auf das Ampelsignal reagieren oder die Fahrperson entsprechend informieren.',
        'Spurführungsassistent': 'Erkennt die Fahrspurmarkierungen und hält das Fahrzeug aktiv in der Spur, ohne die Fahrspur zu verlassen.',
        'Notbremsassistent': 'Erkennt Kollisionsgefahren und warnt davor. Bremst bei drohender Kollision automatisch zur Reduktion der Aufprallgeschwindigkeit.'
    };

    // Renamed assessable chapters from the server for matching
    const serverChapterMap = {
        'Verkehrszeichenassistent': 'Verkehrszeichen',
        'Abstandsregeltempomat': 'Abstand',
        'Ampelerkennung': 'Ampelerkennung',
        'Spurführungsassistent': 'Spurführung',
        'Notbremsassistent': 'Notbremsung'
    };

    // --- Helper function to create a single slider question ---
    function createSliderQuestion(type, chapter) {
        // Use a clean ID for form elements
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
                        <span>keins</span>
                        <span>sehr wenig</span>
                        <span>wenig</span>
                        <span>eher wenig</span>
                        <span>eher viel</span>
                        <span>viel</span>
                        <span>sehr viel</span>
                    </div>
                </div>
            </div>
        `;
    }

    // --- Function to build the form dynamically ---
    function buildAssessmentForm() {
        let theoreticalHTML = '<h3>Wie viel theoretisches Wissen (z.B. über Artikel, Videos, etc.) haben Sie über die folgenden Fahrerassistenzsysteme?</h3>';
        let practicalHTML = '<h3>Wie viel praktische Erfahrung haben Sie mit den folgenden Fahrerassistenzsystemen?</h3>';

        assessableChapters.forEach(chapter => {
            // "Theoretisches Wissen" maps to the 'capability' score
            theoreticalHTML += createSliderQuestion('capability', chapter);
            // "Praktische Erfahrung" maps to the 'limitation' score
            practicalHTML += createSliderQuestion('limitation', chapter);
        });

        formQuestionsContainer.innerHTML = theoreticalHTML + practicalHTML;
    }

    // --- Start the session and build the form ---
    async function startSession() {
        try {
            const response = await fetch('/start');
            if (!response.ok) throw new Error('Network response was not ok');
            const data = await response.json();
            sessionId = data.sessionId;
            buildAssessmentForm(); // Build the form on page load
        } catch (error) {
            console.error('Error starting session:', error);
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
        
        // This logic remains the same, as the form 'name' attributes are preserved
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
            displayResults(data);
        } catch (error) {
            console.error('Error submitting form:', error);
            resultsArea.innerHTML = `<h2>Fehler</h2><p>Etwas ist schiefgelaufen: ${error.message}</p>`;
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

        // The result display logic remains unchanged
        analysisSteps.innerHTML = `
            <div>
                <strong>Schritt 1: "Danger Gap" Analyse</strong>
                <p>Hier berechnen wir die Differenz zwischen Ihren Bewertungen für theoretisches Wissen (Fähigkeiten) und praktische Erfahrung (Grenzen). Ein hoher positiver Wert deutet auf mögliches Übervertrauen hin.</p>
                <pre>${JSON.stringify(data.analysis.dangerGaps, null, 2)}</pre>
            </div>
            <div>
                <strong>Schritt 2: Priorisierung der adaptiven Kapitel</strong>
                <p>Die Kapitel werden basierend auf dem höchsten "Danger Gap" sortiert, um die größten Wissenslücken zuerst zu schließen.</p>
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