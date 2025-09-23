const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');
const { OpenAI } = require('openai');
require('dotenv').config();

const app = express();
const port = 3000;

app.use(bodyParser.json());
app.use(cors());
app.use(express.static(path.join(__dirname, '../frontend')));

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// --- Enhanced Chapter Information (from constants/quiz.ts) ---
const CHAPTERS = {
  'Aktivierung': 'Wie man das System aktiviert und was die verschiedenen Anzeigesymbole bedeuten.',
  'Verkehrszeichen': 'Wie das Auto Tempolimits erkennt und die Geschwindigkeit anpasst.',
  'Abstand': 'Wie der Abstandsregeltempomat funktioniert, um den Abstand zum vorderen Fahrzeug zu halten.',
  'Ampelerkennung': 'Wie das System Ampeln erkennt und darauf reagiert.',
  'Spurführung': 'Wie das Fahrzeug selbstständig die Spur hält und bei Bedarf wechselt.',
  'Notbremsung': 'Wie der Notbremsassistent eingreift, um Kollisionen zu vermeiden.',
  'Deaktivierung': 'Wie man das System manuell oder durch Eingreifen deaktiviert.',
  'Risiken/Verantwortung': 'Die Wichtigkeit der Fahrerüberwachung und die Grenzen des Systems.'
};
const chapterNames = Object.keys(CHAPTERS);

const sessions = {};

// --- API Endpoints ---

app.get('/start', (req, res) => {
  const sessionId = `sess_${Date.now()}`;
  sessions[sessionId] = {};
  res.json({
    sessionId,
    nextStep: {
      type: 'question',
      text: "Willkommen! Um Ihr Tutorial zu personalisieren, erzählen Sie uns bitte kurz von Ihrer Erfahrung mit teilautomatisierten Fahrsystemen.",
    },
  });
});

app.post('/respond', async (req, res) => {
  const { sessionId, answer } = req.body;
  if (!sessions[sessionId]) return res.status(400).json({ error: 'Ungültige Sitzungs-ID.' });

  try {
    const aiResponse = await getLearningPathFromAI(answer);
    
    sessions[sessionId].learningPath = aiResponse.recommended_path;
    sessions[sessionId].currentStepIndex = 0;

    res.json({
      sessionId,
      nextStep: {
        type: 'content',
        contentId: aiResponse.recommended_path[0],
      },
      learningPath: aiResponse.recommended_path,
      reasoning: aiResponse.reasoning, // Send reasoning to the frontend
    });
  } catch (error) {
    console.error("Fehler bei der Kommunikation mit der KI:", error);
    res.status(500).json({ error: "Entschuldigung, beim Erstellen Ihres Lernpfads ist ein Fehler aufgetreten." });
  }
});

app.post('/next', (req, res) => {
  const { sessionId } = req.body;
  const session = sessions[sessionId];

  if (!session || !session.learningPath) {
    return res.status(400).json({ error: 'Sitzung nicht gefunden oder Lernpfad nicht erstellt.' });
  }

  session.currentStepIndex++;

  if (session.currentStepIndex < session.learningPath.length) {
    res.json({
      nextStep: {
        type: 'content',
        contentId: session.learningPath[session.currentStepIndex],
      },
      isComplete: false,
    });
  } else {
    res.json({
      nextStep: {
        type: 'complete',
        text: 'Tutorial abgeschlossen!',
      },
      isComplete: true,
    });
  }
});


// --- Helper Function for AI Interaction ---

async function getLearningPathFromAI(userInput) {
  const chapterSummaries = Object.entries(CHAPTERS).map(([key, value]) => `- ${key}: ${value}`).join('\n');

  const prompt = `
    Sie sind ein Experte für Fahrassistenzsysteme in Autos. Ein Benutzer hat auf die Frage nach seiner Erfahrung folgendes geantwortet: "${userInput}".

    Die verfügbaren Tutorial-Kapitel sind:
    ${chapterSummaries}

    Basierend auf der Antwort des Benutzers, erstellen Sie einen personalisierten Lernpfad.
    - Wenn der Benutzer nervös oder unerfahren wirkt, beginnen Sie mit "Aktivierung" und "Risiken/Verantwortung".
    - Wenn der Benutzer übermäßig selbstsicher wirkt oder erwähnt, nicht aufpassen zu wollen, priorisieren Sie "Risiken/Verantwortung".
    - Wenn der Benutzer erfahren klingt, können Sie mit fortgeschritteneren Themen wie "Spurführung" beginnen.

    Antworten Sie NUR mit einem JSON-Objekt im folgenden Format:
    {
      "reasoning": "Eine kurze Begründung für die gewählte Reihenfolge in 1-2 Sätzen.",
      "recommended_path": ["Kapitel1", "Kapitel2", ...]
    }
  `;

  const completion = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [{ role: "user", content: prompt }],
    response_format: { type: "json_object" },
  });
  
  const result = JSON.parse(completion.choices[0].message.content);
  // Ensure the path is valid and doesn't contain non-existent chapters
  result.recommended_path = result.recommended_path.filter(chapter => chapterNames.includes(chapter));
  
  return result;
}

app.listen(port, () => {
  console.log(`✅ Server läuft! Öffnen Sie http://localhost:${port} in Ihrem Browser.`);
});