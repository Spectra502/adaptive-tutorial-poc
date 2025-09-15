document.addEventListener('DOMContentLoaded', () => {
    const contentArea = document.getElementById('content-area');
    const responseForm = document.getElementById('response-form');
    const userAnswer = document.getElementById('user-answer');
    const submitButton = document.getElementById('submit-button');
    const pathDisplay = document.getElementById('path-display');
    
    let sessionId = null;

    async function startSession() {
        try {
            // Use relative paths since we are on the same domain
            const response = await fetch('/start');
            const data = await response.json();
            sessionId = data.sessionId;
            renderStep(data.nextStep);
        } catch (error) {
            contentArea.innerHTML = `<h2>Error</h2><p>Could not connect to the backend. Make sure it's running.</p>`;
        }
    }

    async function submitResponse() {
        const answer = userAnswer.value;
        if (!answer.trim()) return;

        try {
            // Use relative paths
            const response = await fetch('/respond', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ sessionId, answer }),
            });
            const data = await response.json();
            renderStep(data.nextStep);
            
            pathDisplay.innerHTML = `<strong>Your Learning Path:</strong><br>${data.learningPath.join(' → ')}`;

        } catch (error) {
            contentArea.innerHTML = `<h2>Error</h2><p>Something went wrong while getting your learning path.</p>`;
        }
    }

    function renderStep(step) {
        if (step.type === 'question') {
            contentArea.innerHTML = `<h2>Assessment Question</h2><p>${step.text}</p>`;
            responseForm.style.display = 'block';
        } else if (step.type === 'content') {
            contentArea.innerHTML = `<h2>Tutorial Chapter</h2><p>Now showing content for: <strong>${step.contentId}</strong></p>`;
            responseForm.style.display = 'none';
        }
    }

    submitButton.addEventListener('click', submitResponse);
    startSession();
});