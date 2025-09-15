const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path'); // Import the path module
const { OpenAI } = require('openai');

const app = express();
const port = 3000;

app.use(bodyParser.json());
app.use(cors());

// --- Serve the frontend static files ---
app.use(express.static(path.join(__dirname, '../frontend')));

// --- Configuration ---
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const CHAPTERS = [
  'Aktivierung', 'Verkehrszeichen', 'Abstand', 'Ampelerkennung', 
  'Spurführung', 'Notbremsung', 'Deaktivierung', 'Risiken/Verantwortung'
];

const sessions = {};

// --- API Endpoints ---

app.get('/start', (req, res) => {
  const sessionId = `sess_${Date.now()}`;
  sessions[sessionId] = {
    userId: 'user123',
    history: [],
  };

  res.json({
    sessionId,
    nextStep: {
      type: 'question',
      text: "Welcome! To personalize your tutorial, could you tell me a bit about your experience with semi-automated driving systems?",
    },
  });
});

app.post('/respond', async (req, res) => {
  const { sessionId, answer } = req.body;

  if (!sessions[sessionId]) {
    return res.status(400).json({ error: 'Invalid session ID.' });
  }

  try {
    const learningPath = await getLearningPathFromAI(answer);

    sessions[sessionId].learningPath = learningPath;
    sessions[sessionId].currentStep = 0;

    res.json({
      sessionId,
      nextStep: {
        type: 'content',
        contentId: learningPath[0],
      },
      learningPath: learningPath,
    });
  } catch (error) {
    console.error("Error communicating with AI:", error);
    res.status(500).json({ error: "Sorry, I had trouble creating your learning path." });
  }
});

async function getLearningPathFromAI(userInput) {
  const prompt = `
    You are an expert tutor for an in-car driver assistance system. 
    A new user said this when asked about their experience: "${userInput}".

    The available tutorial chapters are: ${CHAPTERS.join(', ')}.

    Based on their input, generate a personalized learning path. If the user seems nervous or inexperienced, start with "Aktivierung" and "Risiken/Verantwortung". If they sound overconfident or mention wanting to not pay attention, prioritize "Risiken/Verantwortung". If they sound experienced, you can start with more advanced topics like "Spurführung" or "Ampelerkennung".

    Respond ONLY with a JSON object in this format: {"recommended_path": ["Chapter1", "Chapter2", ...]}.
  `;

  const completion = await openai.chat.completions.create({
    model: "gpt-3.5-turbo",
    messages: [{ role: "user", content: prompt }],
    response_format: { type: "json_object" },
  });
  
  const result = JSON.parse(completion.choices[0].message.content);
  return result.recommended_path || [];
}

app.listen(port, () => {
  console.log(`✅ Server is running! Open http://localhost:${port} in your browser.`);
});