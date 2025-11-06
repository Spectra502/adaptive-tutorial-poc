const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

// --- NEW --- (You should already have this)
const fs = require('fs'); 

const { OpenAI } = require('openai');
const { OpenAIEmbeddings } = require("langchain/embeddings/openai");
const { HNSWLib } = require("langchain/vectorstores/hnswlib");
const { ChatOpenAI } = require("langchain/chat_models/openai");
const { ChatPromptTemplate, MessagesPlaceholder, PromptTemplate } = require("langchain/prompts");
const { RunnableSequence } = require("langchain/schema/runnable");
const { StringOutputParser } = require("langchain/schema/output_parser");
const { formatDocumentsAsString } = require("langchain/util/document");
const { HumanMessage, AIMessage } = require("langchain/schema");

// --- NEW --- (You should already have this)
// Load handbook data directly to access questions
const handbookData = JSON.parse(fs.readFileSync(path.join(__dirname, 'handbook.js'), 'utf8'));

// Ensure API key is available
if (!process.env.OPENAI_API_KEY) {
  console.error("🚨 OPENAI_API_KEY is not set in the .env file!");
  process.exit(1);
}

const app = express();
const port = 3000;

app.use(bodyParser.json());
app.use(cors());
app.use(express.static(path.join(__dirname, '../frontend')));

// --- Global variables for AI components ---
let vectorStore;
let chain;
const sessions = {};

// --- Helper Function to Initialize AI Components ---
const initializeAI = async () => {
  try {
    console.log("🧠 Initializing AI components...");

    // 1. Load the vector store
    const directory = path.join(__dirname, 'vector_index');
    const embeddings = new OpenAIEmbeddings();
    vectorStore = await HNSWLib.load(directory, embeddings);
    console.log("✅ Vector store loaded successfully.");

    // 2. Create a retriever
    const retriever = vectorStore.asRetriever();

    // 3. --- MODIFICATION: Create a new prompt template that accepts history ---
    const prompt = ChatPromptTemplate.fromMessages([
      ["system", `Du bist eine expertin-basierte Fahrassistent. Dein Name ist CIELO (Conversational Intelligent Emotional Learning Operator).
      Deine Aufgabe ist es, die Frage des Nutzers *AUSSCHLIESSLICH* auf Basis des folgenden Kontexts aus dem Fahrzeughandbuch zu beantworten.
      Verwende kein externes Wissen und erfinde keine Funktionen, die nicht im Kontext erwähnt werden.
      Sei freundlich, prägnant und hilfsbereit.

      --- THIS IS THE MERGED PART ---
      WICHTIGE REGEL: Wenn deine Antwort eine der folgenden Funktionen im Detail erklärt, füge am *Ende* deiner Antwort ein spezifisches Medien-Tag hinzu.
      Wähle das Tag, das am besten zu deiner Erklärung passt.
      
      Die gültigen Tags sind:
      
      // Aktivierung
      - [SHOW_MEDIA: Aktivierung_Status_Grau] (Zeigt das graue Automationssymbol im Display - nicht verfügbar)
      - [SHOW_MEDIA: Aktivierung_Status_Weiss] (Zeigt das weiße Automationssymbol im Display - verfügbar)
      - [SHOW_MEDIA: Aktivierung_Taste_Druecken] (Zeigt das Drücken der Aktivierungstaste am Lenkrad)
      - [SHOW_MEDIA: Aktivierung_Status_Gruen] (Zeigt das grüne Automationssymbol im Display - aktiviert)
      - [SHOW_MEDIA: Aktivierung_Lenkradlichter_Gruen] (Zeigt die grün leuchtenden Lenkradlichter)
      - [SHOW_MEDIA: Aktivierung_Fahrer_Blick] (Zeigt den Fahrer, der auf die Straße blickt)
      
      // Verkehrszeichen
      - [SHOW_MEDIA: VZO_Erkennung] (Zeigt die Erkennung eines Tempolimit-Schilds)
      - [SHOW_MEDIA: VZO_Anzeige_Uebernahme] (Zeigt die automatische Übernahme des Tempolimits im Display)
      - [SHOW_MEDIA: VZO_Manuelle_Anpassung_Hebel] (Zeigt die manuelle Geschwindigkeitsanpassung per Hebel)
      - [SHOW_MEDIA: VZO_Anzeige_Individuell] (Zeigt die manuell eingestellte Geschwindigkeit im Display)
      
      // Abstand
      - [SHOW_MEDIA: Abstand_Automatisch_Halten] (Zeigt das automatische Halten des Abstands)
      - [SHOW_MEDIA: Abstand_Manuelle_Anpassung_Tasten] (Zeigt die Tasten zur manuellen Abstandseinstellung)
      - [SHOW_MEDIA: Abstand_Anzeige_Display] (Zeigt die Abstandsvisualisierung (Striche) im Display)
      
      // Ampelerkennung
      - [SHOW_MEDIA: Ampel_Rot_Bremst] (Zeigt das automatische Bremsen vor einer roten Ampel)
      - [SHOW_MEDIA: Ampel_Stillstand_Manuell] (Zeigt das Display nach dem Halt an der Ampel - manuelle Übernahme nötig)
      
      // Spurführung
      - [SHOW_MEDIA: Spur_Halten_Automatisch] (Zeigt das automatische Halten der Spur)
      - [SHOW_MEDIA: Spur_Wechsel_Blinker_1] (Zeigt den automatischen Spurwechsel nach Blinker-Antippen, Teil 1)
      - [SHOW_MEDIA: Spur_Wechsel_Blinker_2] (Zeigt den automatischen Spurwechsel nach Blinker-Antippen, Teil 2)
      
      // Notbremsung
      - [SHOW_MEDIA: Notbremse_Hindernis] (Zeigt die Notbremsung vor einem Hindernis)
      - [SHOW_MEDIA: Notbremse_Stillstand_Manuell] (Zeigt die manuelle Übernahme nach einer Notbremsung)
      
      // Deaktivierung
      - [SHOW_MEDIA: Deaktivierung_Taste] (Zeigt die Deaktivierung durch erneutes Drücken der Taste)
      - [SHOW_MEDIA: Deaktivierung_Lenken] (Zeigt die Deaktivierung durch manuelles Lenken)
      - [SHOW_MEDIA: Deaktivierung_Bremse] (Zeigt die Deaktivierung durch Drücken des Bremspedals)
      - [SHOW_MEDIA: Deaktivierung_Anzeige_Weiss] (Zeigt das weiße Symbol und erloschene Lichter nach Deaktivierung)
      
      // Risiken/Verantwortung
      - [SHOW_MEDIA: Risiko_Uebernahme_Warnung] (Zeigt eine Übernahmeaufforderung/Warnung an)
      - [SHOW_MEDIA: Risiko_Fehler_Kreisverkehr] (Beispiel: Systemfehler in einem Kreisverkehr)
      - [SHOW_MEDIA: Risiko_Fehler_Baustelle] (Beispiel: Systemfehler bei einer Baustelle)
      - [SHOW_MEDIA: Risiko_Fehler_Ampel_Rot] (Beispiel: Systemfehler - bremst nicht bei Rot)
      - [SHOW_MEDIA: Risiko_Fehler_Spurwechsel] (Beispiel: Systemfehler - erkennt Fahrzeug beim Spurwechsel nicht)
      
      Beispiel: "Das Fahrzeug bremst bei roten Ampeln automatisch bis zum Stillstand ab. [SHOW_MEDIA: Ampel_Rot_Bremst]"
      --- END MERGED PART ---

      KONTEXT:
      {context}`],
      // This placeholder will be filled with the conversation history
      new MessagesPlaceholder("chat_history"),
      ["human", "{question}"],
    ]);


    // 4. Create the LLM model
    const model = new ChatOpenAI({
        modelName: "gpt-4o", // Or "gpt-3.5-turbo" for faster responses
        temperature: 0.2 // A lower temperature makes the model more focused and deterministic
    });

    // 5. --- MODIFICATION: Create the processing chain to include history ---
    chain = RunnableSequence.from([
      {
        // The retriever is still only fed the *current* question for context
        context: RunnableSequence.from([(input) => input.question, retriever, formatDocumentsAsString]),
        question: (input) => input.question,
        chat_history: (input) => input.chat_history,
      },
      prompt,
      model,
      new StringOutputParser(),
    ]);

    this.chain = chain;

    console.log("✅ AI chain initialized successfully.");
    console.log("🎉 Server is ready to receive requests!");

  } catch (error) {
    console.error("❌ Failed to initialize AI components:", error);
    process.exit(1); // Exit if AI setup fails
  }
};

// --- API Endpoints ---

// Endpoint to start a new session and get a welcome message
app.post('/start-chat', async (req, res) => {
  const { scores } = req.body;
  const sessionId = `sess_${Date.now()}`;

  // --- MODIFIED --- (You should already have this)
  sessions[sessionId] = { 
    scores, 
    history: [],
    quizState: null // Will look like { chapter: 'Aktivierung', questionIndex: 0, score: 0, total: 3 }
  };

  try {
    const topics = Object.entries(scores)
      .filter(([, ratings]) => ratings.capability < 5)
      .map(([topic]) => topic)
      .join(', ');

    let firstQuestion = "Hallo! Ich bin CIELO, deine Fahrassistent. Wie kann ich dir heute helfen?";
    if (topics) {
      firstQuestion = `Hallo! Ich bin CIELO. Ich sehe, du möchtest mehr über die Funktionen des Autos erfahren, vielleicht beginnend mit ${topics}. Was möchtest du wissen?`;
    }

    const welcomeMessage = await chain.invoke({
        question: firstQuestion,
        chat_history: [] 
    });
    
    sessions[sessionId].history.push({ role: 'assistant', content: welcomeMessage });

    res.json({ sessionId, message: welcomeMessage });

  } catch (error) {
    console.error("Error starting chat:", error);
    res.status(500).json({ error: "Failed to start a new chat session." });
  }
});

// Endpoint to handle subsequent chat messages
// --- MODIFIED --- 
app.post('/chat-message', async (req, res) => {
  const { sessionId, message } = req.body;
  const session = sessions[sessionId];

  if (!session) {
    return res.status(400).json({ error: 'Invalid session ID.' });
  }
  
  // --- NEW: Quiz Guard Rails ---
  // Check if user wants to stop the quiz
  if (message.trim().toLowerCase() === 'stop quiz' || message.trim().toLowerCase() === 'quiz beenden') {
    session.quizState = null;
    session.history.push({ role: 'user', content: message });
    session.history.push({ role: 'assistant', content: "Okay, ich habe das Quiz beendet. Womit kann ich dir sonst helfen?" });
    return res.json({ message: "Okay, ich habe das Quiz beendet. Womit kann ich dir sonst helfen?" });
  }
  
  // Check if user is in a quiz and tries to chat
  if (session.quizState) {
    return res.status(400).json({ error: "Sie befinden sich gerade in einem Quiz. Bitte beantworten Sie die Frage über die Schaltflächen oder tippen Sie 'stop quiz', um abzubrechen." });
  }
  // --- End of Quiz Guard Rails ---

  try {
    const formattedHistory = session.history.map(msg => {
      if (msg.role === 'user') {
        return new HumanMessage(msg.content);
      } else if (msg.role === 'assistant') {
        return new AIMessage(msg.content);
      }
      return new HumanMessage(msg.content);
    });

    session.history.push({ role: 'user', content: message });
    
    const aiResponse = await chain.invoke({
      question: message, 
      chat_history: formattedHistory 
    });

    session.history.push({ role: 'assistant', content: aiResponse });

    console.log("[SERVER LOG] Sending this to frontend:", aiResponse);

    res.json({ message: aiResponse });

  } catch (error)
 {
    console.error("Error processing chat message:", error);
    res.status(500).json({ error: "I'm sorry, I encountered an error. Please try again." });
  }
});


// --- NEW: Endpoint to start a quiz ---
app.post('/start-quiz', (req, res) => {
  const { sessionId, chapterName } = req.body;
  const session = sessions[sessionId];

  if (!session) {
    return res.status(400).json({ error: 'Invalid session ID.' });
  }
  
  const chapter = handbookData[chapterName];
  
  if (!chapter) {
    return res.status(404).json({ error: `Kapitel '${chapterName}' nicht gefunden.` });
  }
  
  if (!chapter.questions || chapter.questions.length === 0) {
    return res.status(404).json({ error: `Keine Fragen für '${chapterName}' gefunden.` });
  }
  
  // Set the quiz state
  session.quizState = {
    chapter: chapterName,
    questionIndex: 0,
    score: 0,
    total: chapter.questions.length
  };
  
  // Get the first question
  const firstQuestion = chapter.questions[0];
  
  // Send back *only* what the frontend needs to display
  // DO NOT send the correctAnswerIndex
  res.json({
    questionText: firstQuestion.questionText,
    possibleAnswers: firstQuestion.possibleAnswers
  });
});

// --- NEW: Endpoint to submit an answer ---
app.post('/submit-answer', (req, res) => {
  const { sessionId, answerIndex } = req.body;
  const session = sessions[sessionId];
  
  if (!session) {
    return res.status(400).json({ error: 'Invalid session ID.' });
  }
  
  if (!session.quizState) {
    return res.status(400).json({ error: 'You are not in a quiz.' });
  }
  
  const { chapter, questionIndex } = session.quizState;
  
  // Get the question from our handbook data to check the answer
  const currentQuestion = handbookData[chapter].questions[questionIndex];
  
  const isCorrect = (currentQuestion.correctAnswerIndex === answerIndex);
  
  if (isCorrect) {
    session.quizState.score++;
  }
  
  // Determine feedback
  const feedback = isCorrect ? "Richtig! Gut gemacht." : `Leider falsch. Die richtige Antwort war: "${currentQuestion.possibleAnswers[currentQuestion.correctAnswerIndex]}"`;
  
  // Move to the next question
  session.quizState.questionIndex++;
  
  // Check if the quiz is over
  if (session.quizState.questionIndex >= session.quizState.total) {
    const finalScore = session.quizState.score;
    const total = session.quizState.total;
    
    // Reset the quiz state
    session.quizState = null;
    
    res.json({
      correct: isCorrect,
      feedback: feedback,
      quizComplete: true,
      finalScore: finalScore,
      total: total,
      finalMessage: `Quiz beendet! Du hast ${finalScore} von ${total} Fragen richtig beantwortet.`
    });
    
  } else {
    // Send the next question
    const nextQuestion = handbookData[chapter].questions[session.quizState.questionIndex];
    res.json({
      correct: isCorrect,
      feedback: feedback,
      quizComplete: false,
      nextQuestion: {
        questionText: nextQuestion.questionText,
        possibleAnswers: nextQuestion.possibleAnswers
      }
    });
  }
});


// --- Start Server ---
app.listen(port, async () => {
  console.log(`🚀 Server starting on http://localhost:${port}`);
  await initializeAI(); // Initialize AI components before accepting requests
});