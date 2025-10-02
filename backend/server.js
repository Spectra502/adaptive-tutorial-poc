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

// --- New Question Data Structure ---
const chapterQuestions = {
    'Verkehrszeichen': {
        question: "Sie fahren mit aktivem Assistenten auf einer Landstraße und nähern sich einem Ortseingangsschild (50 km/h). Das Schild ist jedoch teilweise von einem Ast verdeckt. Was ist die korrekte Erwartung an das System und Ihre Aufgabe als Fahrer?",
        choices: {
            'A': "Das Auto wird das Schild trotz des Astes erkennen und zuverlässig auf 50 km/h abbremsen. Ich muss nichts tun.",
            'B': "Das System wird mich fragen, ob es die Geschwindigkeit anpassen soll, bevor es etwas unternimmt.",
            'C': "Das System könnte das Schild übersehen. Ich muss aufmerksam bleiben und die Geschwindigkeit bei Bedarf manuell anpassen, da ich die volle Verantwortung trage."
        },
        archetypes: { 'A': 'Overconfident', 'B': 'Incorrect/Clueless', 'C': 'Correct' }
    },
    'Abstand': {
        question: "Sie fahren im dichten Stadtverkehr mit aktivem ACC. Das Auto vor Ihnen fährt an und Ihr Fahrzeug beginnt zu beschleunigen. Plötzlich tritt ein Fußgänger zwischen den Autos auf die Fahrbahn. Wie verhalten sich System und Fahrer korrekt?",
        choices: {
            'A': "Das System orientiert sich am vorderen Fahrzeug und beschleunigt eventuell weiter. Ich als Fahrer muss die Situation erkennen und sofort selbst für den Fußgänger bremsen.",
            'B': "Der Assistent ist modern und wird den Fußgänger genauso wie ein Auto erkennen und automatisch eine Notbremsung für ihn einleiten.",
            'C': "Das System wird sofort anhalten, da es im Stadtverkehr grundsätzlich keine Beschleunigung zulässt."
        },
        archetypes: { 'A': 'Correct', 'B': 'Overconfident', 'C': 'Incorrect/Clueless' }
    },
    'Ampelerkennung': {
        question: "Ihr Fahrzeug hat dank des Assistenten perfekt an einer roten Ampel gehalten. Wenige Sekunden später schaltet die Ampel auf Grün. Was passiert als Nächstes?",
        choices: {
            'A': "Das Auto erkennt das grüne Licht und fährt automatisch los, sobald der Verkehr vor mir anrollt.",
            'B': "Das Fahrzeug bleibt stehen. Ich als Fahrer muss die Situation prüfen und durch einen Druck auf das Gaspedal oder eine \"Resume\"-Taste am Lenkrad den Befehl zum Anfahren geben.",
            'C': "Das System gibt ein lautes akustisches Signal ab, bis ich manuell losfahre."
        },
        archetypes: { 'A': 'Overconfident', 'B': 'Correct', 'C': 'Incorrect/Clueless' }
    },
    'Spurführung': {
        question: "Sie fahren auf der Autobahn, als Sie in einen Baustellenbereich mit gelben Fahrbahnmarkierungen kommen, die den weißen Markierungen widersprechen. Wie wird der Assistent wahrscheinlich reagieren?",
        choices: {
            'A': "Das System wird immer den weißen Linien folgen, da sie permanent sind.",
            'B': "Das System ist intelligent genug, die gelben Baustellenmarkierungen als primär zu erkennen und ihnen präzise zu folgen.",
            'C': "Das System könnte durch die widersprüchlichen Linien verwirrt werden und unzuverlässig arbeiten oder sich deaktivieren. Ich muss sofort die volle Lenkverantwortung übernehmen und dem Baustellenverlauf aktiv folgen."
        },
        archetypes: { 'A': 'Incorrect/Clueless', 'B': 'Overconfident', 'C': 'Correct' }
    },
    'Notbremsung': {
        question: "Der Notbremsassistent hat eine Kollision erfolgreich verhindert, indem er Ihr Fahrzeug aus voller Fahrt bis zum Stillstand auf der Fahrbahn gebremst hat. Was ist der unmittelbare nächste Schritt?",
        choices: {
            'A': "Das System prüft die Umgebung. Sobald die Gefahr vorüber ist, fährt es automatisch weiter.",
            'B': "Die automatische Aktion ist beendet. Ich als Fahrer muss die Situation überblicken (z.B. den Verkehr hinter mir prüfen), die Warnblinkanlage einschalten und/oder das Fahrzeug sicher von der Fahrbahn bewegen.",
            'C': "Das System aktiviert automatisch einen Notruf, da es von einem schweren Unfall ausgeht."
        },
        archetypes: { 'A': 'Overconfident', 'B': 'Correct', 'C': 'Incorrect/Clueless' }
    }
};

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
const MASTERY_THRESHOLD = 6;

const sessions = {};

// --- API Endpoints ---

app.get('/start', (req, res) => {
  const sessionId = `sess_${Date.now()}`;
  sessions[sessionId] = {};
  res.json({ sessionId });
});

app.post('/respond', async (req, res) => {
  const { sessionId, scores, openAnswer } = req.body;
  const session = sessions[sessionId];
  if (!session) return res.status(400).json({ error: 'Ungültige Sitzungs-ID.' });

  try {
    const dangerGaps = {};
    for (const chapter of ADAPTIVE_CHAPTERS) {
      if (scores[chapter]) {
        dangerGaps[chapter] = scores[chapter].capability - scores[chapter].limitation;
      }
    }

    const chaptersToQuestion = ADAPTIVE_CHAPTERS.filter(chapter => dangerGaps[chapter] > 0);

    session.scores = scores;
    session.dangerGaps = dangerGaps;
    session.openAnswer = openAnswer;
    session.chaptersToQuestion = chaptersToQuestion;
    session.mandatoryChapters = [];

    if (chaptersToQuestion.length > 0) {
      res.json({ needsQuestions: true });
    } else {
      const finalPath = [
        'Aktivierung',
        'Risiken/Verantwortung',
        'Deaktivierung'
      ];
      const reasoning = await getReasoningFromAI(session.scores, session.dangerGaps, session.openAnswer, finalPath);
      res.json({
        needsQuestions: false,
        analysis: { dangerGaps, sortedAdaptivePath: [] },
        finalPath,
        reasoning,
      });
    }
  } catch (error) {
    console.error("Fehler bei der serverseitigen Analyse:", error);
    res.status(500).json({ error: "Fehler bei der initialen Analyse." });
  }
});

app.get('/question', (req, res) => {
    const sessionId = req.headers['x-session-id'];
    const session = sessions[sessionId];
    if (!session || !session.chaptersToQuestion) {
        return res.status(400).json({ error: 'Ungültige Sitzung oder keine Fragen mehr übrig.' });
    }

    const nextChapter = session.chaptersToQuestion[0];
    if (nextChapter && chapterQuestions[nextChapter]) {
        res.json({
            chapter: nextChapter,
            question: chapterQuestions[nextChapter].question,
            choices: chapterQuestions[nextChapter].choices,
        });
    } else {
        res.status(404).json({ error: 'Keine passende Frage gefunden oder alle Fragen beantwortet.' });
    }
});

app.post('/answer', async (req, res) => {
    const { sessionId, chapter, answer } = req.body;
    const session = sessions[sessionId];
    if (!session) return res.status(400).json({ error: 'Ungültige Sitzungs-ID.' });

    try {
        const questionData = chapterQuestions[chapter];
        if (!questionData) return res.status(404).json({ error: 'Frage für dieses Kapitel nicht gefunden.' });

        const archetype = questionData.archetypes[answer];
        if (archetype === 'Overconfident' || archetype === 'Incorrect/Clueless') {
            session.mandatoryChapters.push(chapter);
        }

        session.chaptersToQuestion.shift();

        if (session.chaptersToQuestion.length > 0) {
            res.json({ hasMoreQuestions: true });
        } else {
            const sortedMandatoryChapters = session.mandatoryChapters.sort((a, b) => {
                return session.dangerGaps[b] - session.dangerGaps[a];
            });

            const finalPath = [
                'Aktivierung',
                ...sortedMandatoryChapters,
                'Risiken/Verantwortung',
                'Deaktivierung'
            ];

            const reasoning = await getReasoningFromAI(session.scores, session.dangerGaps, session.openAnswer, finalPath);

            res.json({
                hasMoreQuestions: false,
                analysis: {
                    dangerGaps: session.dangerGaps,
                    sortedAdaptivePath: sortedMandatoryChapters,
                },
                finalPath,
                reasoning,
            });
        }
    } catch (error) {
        console.error("Fehler bei der Antwortverarbeitung oder KI-Kommunikation:", error);
        res.status(500).json({ error: "Fehler bei der Verarbeitung Ihrer Antwort." });
    }
});

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