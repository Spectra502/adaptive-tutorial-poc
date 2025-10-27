const { OpenAIEmbeddings } = require("langchain/embeddings/openai");
const { HNSWLib } = require("langchain/vectorstores/hnswlib");
const { RecursiveCharacterTextSplitter } = require("langchain/text_splitter");
const fs = require("fs");
const path = require('path');
require("dotenv").config();

if (!process.env.OPENAI_API_KEY) {
  console.error("🚨 OPENAI_API_KEY is not set in the .env file!");
  process.exit(1);
}

const run = async () => {
  try {
    // 1. Load the new handbook JSON
    console.log("📖 Loading handbook.js...");
    const handbookPath = path.join(__dirname, 'handbook.js');
    
    // Read the file content as text
    const handbookFileContent = fs.readFileSync(handbookPath, "utf8");
    // Parse the text content as JSON
    const handbookData = JSON.parse(handbookFileContent);

    // 2. Extract and combine all "texts" fields into a single string
    let handbookText = "";
    for (const chapterKey in handbookData) {
        const chapter = handbookData[chapterKey];
        if (chapter.texts && Array.isArray(chapter.texts)) {
            // Add chapter title for context
            handbookText += `${chapterKey}\n${chapter.texts.join("\n")}\n\n`;
        }
    }
    console.log("✅ Extracted all text from handbook.js.");

    // 3. Split the text into smaller, meaningful chunks
    console.log("🔪 Splitting text into chunks...");
    const textSplitter = new RecursiveCharacterTextSplitter({
      chunkSize: 500, // Max characters per chunk
      chunkOverlap: 50, // Characters to overlap between chunks
    });
    const docs = await textSplitter.createDocuments([handbookText]);
    console.log(`✅ Text split into ${docs.length} chunks.`);

    // 4. Create vector embeddings from the chunks
    console.log("🧠 Creating vector embeddings... (This may take a moment)");
    const embeddings = new OpenAIEmbeddings();
    
    // 5. Create the vector index from the documents
    const vectorStore = await HNSWLib.fromDocuments(docs, embeddings);

    // 6. Save the vector index to a file
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