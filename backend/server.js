const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const { OpenAI } = require('openai');
const { OpenAIEmbeddings } = require("langchain/embeddings/openai");
const { HNSWLib } = require("langchain/vectorstores/hnswlib");
const { ChatOpenAI } = require("langchain/chat_models/openai");
const { PromptTemplate } = require("langchain/prompts");
const { RunnableSequence } = require("langchain/schema/runnable");
const { StringOutputParser } = require("langchain/schema/output_parser");
const { formatDocumentsAsString } = require("langchain/util/document");

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

    // 3. Create the prompt template
    const prompt = PromptTemplate.fromTemplate(`
      You are an expert in-car assistant. Your name is AVA (Automotive Virtual Assistant).
      Your task is to answer the user's question based *ONLY* on the following context from the car's handbook.
      Do not use any outside knowledge or make up features that are not mentioned in the context.
      Be friendly, concise, and helpful. Start your first message with a greeting.

      CONTEXT:
      {context}

      QUESTION:
      {question}

      ANSWER:
    `);

    // 4. Create the LLM model
    const model = new ChatOpenAI({
        modelName: "gpt-4o", // Or "gpt-3.5-turbo" for faster responses
        temperature: 0.2 // A lower temperature makes the model more focused and deterministic
    });

    // 5. Create the processing chain
    chain = RunnableSequence.from([
      {
        context: RunnableSequence.from([(input) => input.question, retriever, formatDocumentsAsString]),
        question: (input) => input.question,
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

    let firstQuestion = "Hello! I'm AVA, your in-car assistant. How can I help you today?";
    if (topics) {
      firstQuestion = `Hello! I'm AVA. I see you're looking to learn more about the car's features, perhaps starting with ${topics}. What would you like to know?`;
    }

    // Invoke the chain to get a more natural-sounding welcome message
    const welcomeMessage = await chain.invoke({
        question: firstQuestion
    });
    
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
    // Add user's message to history
    session.history.push({ role: 'user', content: message });
    
    // Get the AI's response using the chain
    const aiResponse = await chain.invoke({ question: message });

    // Add AI's response to history
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