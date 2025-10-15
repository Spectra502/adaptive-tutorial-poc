const { OpenAIEmbeddings } = require("langchain/embeddings/openai");
const { HNSWLib } = require("langchain/vectorstores/hnswlib");
const { RecursiveCharacterTextSplitter } = require("langchain/text_splitter");
const fs = require("fs");
const path = require('path');
require("dotenv").config();

// Make sure your OPENAI_API_KEY is set in your .env file
if (!process.env.OPENAI_API_KEY) {
  console.error("🚨 OPENAI_API_KEY is not set in the .env file!");
  process.exit(1);
}

const run = async () => {
  try {
    // 1. Load the handbook text from the file
    console.log("📖 Loading handbook.txt...");
    const handbookPath = path.join(__dirname, 'handbook.txt');
    const handbookText = fs.readFileSync(handbookPath, "utf8");

    // 2. Split the text into smaller, meaningful chunks
    console.log("🔪 Splitting text into chunks...");
    const textSplitter = new RecursiveCharacterTextSplitter({
      chunkSize: 500, // Max characters per chunk
      chunkOverlap: 50, // Characters to overlap between chunks
    });
    const docs = await textSplitter.createDocuments([handbookText]);
    console.log(`✅ Text split into ${docs.length} chunks.`);

    // 3. Create vector embeddings from the chunks
    console.log("🧠 Creating vector embeddings... (This may take a moment)");
    const embeddings = new OpenAIEmbeddings();
    
    // 4. Create the vector index from the documents
    const vectorStore = await HNSWLib.fromDocuments(docs, embeddings);

    // 5. Save the vector index to a file
    const directory = path.join(__dirname, 'vector_index');
    if (!fs.existsSync(directory)){
        fs.mkdirSync(directory);
    }
    await vectorStore.save(directory);
    
    console.log(`✅ Vector index created and saved to '${directory}'!`);
    console.log("🎉 Ingestion complete. You can now start the server.");

  } catch (error) {
    console.error("❌ An error occurred during the ingestion process:", error);
  }
};

run();