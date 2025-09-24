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

// --- Chapter Information ---
const ALL_CHAPTERS = {
  'Aktivierung': 'Wie man das System aktiviert...',
  'Verkehrszeichen': 'Wie das Auto Tempolimits erkennt...',
  'Abstand': 'Wie der Abstandsregeltempomat funktioniert...',
  'Ampelerkennung': 'Wie das System Ampeln erkennt...',
  'Spurführung': 'Wie das Fahrzeug selbstständig die Spur hält...',
  'Notbremsung': 'Wie der Notbremsassistent eingreift...',
  'Risiken/Verantwortung': 'Die Wichtigkeit der Fahrerüberwachung...',
  'Deaktivierung': 'Wie man das System manuell deaktiviert...',
};
const ADAPTIVE_CHAPTERS = ['Verkehrszeichen', 'Abstand', 'Ampelerkennung', 'Spurführung', 'Notbremsung'];

const sessions = {};

// --- API Endpoints ---

app.get('/start', (req, res) => {
  const sessionId = `sess_${Date.now()}`;
  sessions[sessionId] = {};
  res.json({ sessionId });
});

app.post('/respond', async (req, res) => {
  const { sessionId, scores, openAnswer } = req.body;
  if (!sessions[sessionId]) return res.status(400).json({ error: 'Ungültige Sitzungs-ID.' });

  try {
    // --- SERVER-SIDE ANALYSIS ---

    // Step 1: Calculate "Danger Gaps"
    const dangerGaps = {};
    for (const chapter of ADAPTIVE_CHAPTERS) {
      if (scores[chapter]) {
        dangerGaps[chapter] = scores[chapter].capability - scores[chapter].limitation;
      }
    }

    // Step 2: Prioritize Adaptive Chapters
    const sortedAdaptivePath = Object.entries(dangerGaps)
      .sort(([, gapA], [, gapB]) => gapB - gapA)
      .map(([chapter]) => chapter);

    // Step 3: Construct the Final "Safety Sandwich" Path
    const finalPath = [
      'Aktivierung',
      ...sortedAdaptivePath,
      'Risiken/Verantwortung',
      'Deaktivierung'
    ];

    // Step 4: Get AI Reasoning based on the analysis
    const reasoning = await getReasoningFromAI(scores, dangerGaps, openAnswer);

    // --- SEND FULL ANALYSIS TO FRONTEND ---
    res.json({
      analysis: {
        dangerGaps,
        sortedAdaptivePath,
      },
      finalPath,
      reasoning,
    });

  } catch (error) {
    console.error("Fehler bei der serverseitigen Analyse oder KI-Kommunikation:", error);
    res.status(500).json({ error: "Entschuldigung, bei der Erstellung Ihres Lernpfads ist ein Fehler aufgetreten." });
  }
});


// --- Helper Function for AI Interaction ---
async function getReasoningFromAI(scores, dangerGaps, openAnswer) {
  const prompt = `
    You are an expert AI tutor for driver-assistance systems.
    A user has completed a self-assessment with the following results:
    - Raw Scores (capability vs. limitation): ${JSON.stringify(scores)}
    - Calculated "Danger Gaps" (high value = potential overconfidence): ${JSON.stringify(dangerGaps)}
    - Their answer to "What is the biggest misunderstanding people have?": "${openAnswer}"

    Based on this data, a personalized learning path has already been created.
    Your task is to write a brief, encouraging, and personalized reasoning text (in German) that explains WHY the tutorial is structured this way for the user.

    - If you see high "Danger Gaps", acknowledge their confidence but emphasize the importance of understanding the system's limits.
    - If the gaps are low or negative, praise their balanced understanding.
    - Refer to their open answer if it's relevant to their scores.
    - Be friendly and supportive.

    Provide ONLY the reasoning text as a single string.
  `;

  const completion = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [{ role: "user", content: prompt }],
  });
  
  return completion.choices[0].message.content;
}


app.listen(port, () => {
  console.log(`✅ Server läuft! Öffnen Sie http://localhost:${port} in Ihrem Browser.`);
});