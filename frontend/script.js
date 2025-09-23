document.addEventListener('DOMContentLoaded', () => {
    const contentArea = document.getElementById('content-area');
    const responseForm = document.getElementById('response-form');
    const userAnswer = document.getElementById('user-answer');
    const submitButton = document.getElementById('submit-button');
    const pathDisplay = document.getElementById('path-display');
    const navigationControls = document.getElementById('navigation-controls');
    const nextButton = document.getElementById('next-button');
    
    let sessionId = null;

    async function startSession() {
        try {
            const response = await fetch('/start');
            const data = await response.json();
            sessionId = data.sessionId;
            renderStep(data.nextStep);
        } catch (error) {
            contentArea.innerHTML = `<h2>Fehler</h2><p>Verbindung zum Backend konnte nicht hergestellt werden. Läuft der Server?</p>`;
        }
    }

    async function submitResponse() {
        const answer = userAnswer.value;
        if (!answer.trim()) return;

        submitButton.disabled = true;
        submitButton.textContent = 'Analysiere...';

        try {
            const response = await fetch('/respond', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ sessionId, answer }),
            });
            const data = await response.json();
            renderStep(data.nextStep);
            
            // Display the AI's reasoning and the generated path
            pathDisplay.innerHTML = `
                <strong>Ihr persönlicher Lernpfad:</strong> ${data.learningPath.join(' → ')}
                <p id="ai-reasoning"><strong>Begründung der KI:</strong> ${data.reasoning}</p>
            `;
            pathDisplay.style.display = 'block';
            navigationControls.style.display = 'block';

        } catch (error) {
            contentArea.innerHTML = `<h2>Fehler</h2><p>Etwas ist schiefgelaufen.</p>`;
        } finally {
            submitButton.disabled = false;
            submitButton.textContent = 'Senden';
        }
    }
    
    async function goToNextStep() {
        try {
            const response = await fetch('/next', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ sessionId }),
            });
            const data = await response.json();
            renderStep(data.nextStep);

            if (data.isComplete) {
                navigationControls.style.display = 'none';
            }

        } catch (error) {
            contentArea.innerHTML = `<h2>Fehler</h2><p>Konnte nicht zum nächsten Schritt wechseln.</p>`;
        }
    }

    function renderStep(step) {
        if (step.type === 'question') {
            contentArea.innerHTML = `<h2>Einschätzungsfrage</h2><p>${step.text}</p>`;
            responseForm.style.display = 'block';
        } else if (step.type === 'content') {
            contentArea.innerHTML = `<h2>Tutorial-Kapitel</h2><p>Aktuelles Kapitel: <strong>${step.contentId}</strong></p>`;
            responseForm.style.display = 'none';
        } else if (step.type === 'complete') {
            contentArea.innerHTML = `<h2>Tutorial abgeschlossen!</h2><p>${step.text}</p>`;
        }
    }

    submitButton.addEventListener('click', submitResponse);
    nextButton.addEventListener('click', goToNextStep);
    
    startSession();
});