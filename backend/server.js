const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const { OpenAI } = require('openai');
const { OpenAIEmbeddings } = require("langchain/embeddings/openai");
const { HNSWLib } = require("langchain/vectorstores/hnswlib");
const { ChatOpenAI } = require("langchain/chat_models/openai");
// --- MODIFICATION: Import new classes for chat history ---
const { ChatPromptTemplate, MessagesPlaceholder } = require("langchain/prompts");
const { RunnableSequence } = require("langchain/schema/runnable");
const { StringOutputParser } = require("langchain/schema/output_parser");
const { formatDocumentsAsString } = require("langchain/util/document");
// --- MODIFICATION: Import message types ---
const { HumanMessage, AIMessage } = require("langchain/schema");

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
        // We must also pass the chat_history through to the prompt
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

  // Store initial scores for potential future personalization
  sessions[sessionId] = { scores, history: [] };

  try {
    // Generate a personalized welcome message based on scores
    const topics = Object.entries(scores)
      .filter(([, ratings]) => ratings.capability < 5)
      .map(([topic]) => topic)
      .join(', ');

    let firstQuestion = "Hallo! Ich bin CIELO, deine Fahrassistent. Wie kann ich dir heute helfen?";
    if (topics) {
      firstQuestion = `Hallo! Ich bin CIELO. Ich sehe, du möchtest mehr über die Funktionen des Autos erfahren, vielleicht beginnend mit ${topics}. Was möchtest du wissen?`;
    }

    // --- MODIFICATION: Invoke the chain with an empty history ---
    const welcomeMessage = await chain.invoke({
        question: firstQuestion,
        chat_history: [] // Pass an empty array for the first message
    });
    
    // Add AI's response to history
    sessions[sessionId].history.push({ role: 'assistant', content: welcomeMessage });

    res.json({ sessionId, message: welcomeMessage });

  } catch (error) {
    console.error("Error starting chat:", error);
    res.status(500).json({ error: "Failed to start a new chat session." });
  }
});

// Endpoint to handle subsequent chat messages
app.post('/chat-message', async (req, res) => {
  const { sessionId, message } = req.body;
  const session = sessions[sessionId];

  if (!session) {
    return res.status(400).json({ error: 'Invalid session ID.' });
  }

  try {
    // --- MODIFICATION: Format history and pass it to the chain ---

    // 1. Format the existing history from plain objects to LangChain message objects
    const formattedHistory = session.history.map(msg => {
      if (msg.role === 'user') {
        return new HumanMessage(msg.content);
      } else if (msg.role === 'assistant') {
        return new AIMessage(msg.content);
      }
      // As a fallback, but we only use 'user' and 'assistant'
      return new HumanMessage(msg.content);
    });

    // 2. Add user's *new* message to the session history (as a plain object)
    session.history.push({ role: 'user', content: message });
    
    // 3. Get the AI's response using the chain
    const aiResponse = await chain.invoke({
      question: message, // The new question
      chat_history: formattedHistory // The history *before* this new question
    });

    // 4. Add AI's response to history (as a plain object)
    session.history.push({ role: 'assistant', content: aiResponse });

    res.json({ message: aiResponse });

  } catch (error) {
    console.error("Error processing chat message:", error);
    res.status(500).json({ error: "I'm sorry, I encountered an error. Please try again." });
  }
});

// --- Start Server ---
app.listen(port, async () => {
  console.log(`🚀 Server starting on http://localhost:${port}`);
  await initializeAI(); // Initialize AI components before accepting requests
});