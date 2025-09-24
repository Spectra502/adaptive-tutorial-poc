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
const MASTERY_THRESHOLD = 6; // Mindest-Capability-Score, um ein Kapitel zu überspringen

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
    // Step 1: Calculate "Danger Gaps"
    const dangerGaps = {};
    for (const chapter of ADAPTIVE_CHAPTERS) {
      if (scores[chapter]) {
        dangerGaps[chapter] = scores[chapter].capability - scores[chapter].limitation;
      }
    }

    // Step 2: Prioritize and **Filter** Adaptive Chapters
    const sortedAndFilteredPath = Object.entries(dangerGaps)
      .sort(([, gapA], [, gapB]) => gapB - gapA)
      .filter(([chapter, gap]) => {
          const capabilityScore = scores[chapter].capability;
          // Behalte das Kapitel, WENN:
          // 1. Der Danger Gap positiv ist (es gibt eine Wissenslücke)
          // ODER
          // 2. Der Capability Score unter dem Experten-Level liegt.
          return gap > 0 || capabilityScore < MASTERY_THRESHOLD;
      })
      .map(([chapter]) => chapter);

    // Step 3: Construct the Final "Safety Sandwich" Path
    const finalPath = [
      'Aktivierung',
      ...sortedAndFilteredPath,
      'Risiken/Verantwortung',
      'Deaktivierung'
    ];

    // Step 4: Get AI Reasoning
    const reasoning = await getReasoningFromAI(scores, dangerGaps, openAnswer, finalPath);

    res.json({
      analysis: {
        dangerGaps,
        sortedAdaptivePath: sortedAndFilteredPath, // Name beibehalten für Konsistenz
      },
      finalPath,
      reasoning,
    });

  } catch (error)
 {
    console.error("Fehler bei der serverseitigen Analyse oder KI-Kommunikation:", error);
    res.status(500).json({ error: "Entschuldigung, bei der Erstellung Ihres Lernpfads ist ein Fehler aufgetreten." });
  }
});


// --- Helper Function for AI Interaction (angepasst, um den finalen Pfad zu kennen) ---
async function getReasoningFromAI(scores, dangerGaps, openAnswer, finalPath) {
  const prompt = `
    You are an expert AI tutor for driver-assistance systems.
    A user has completed a self-assessment. Based on their scores, a learning path has been generated.
    - Raw Scores: ${JSON.stringify(scores)}
    - Calculated "Danger Gaps": ${JSON.stringify(dangerGaps)}
    - User's open answer: "${openAnswer}"
    - The final, generated learning path is: ${JSON.stringify(finalPath)}

    Your task is to write a brief, personalized reasoning text (in German).
    - If chapters were skipped (the middle of the path is empty), praise their expertise and explain that the tutorial has been shortened for them.
    - If there are chapters in the middle, explain why those were chosen (e.g., to close specific knowledge gaps).
    - Refer to their open answer to show you've understood their excellent insight.

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