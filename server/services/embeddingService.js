const { GoogleGenerativeAI } = require('@google/generative-ai');
const { getPineconeIndex } = require('../config/pinecone.js');
const crypto = require('crypto');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || 'dummy_key');

// Utility to split OCR text into smaller, meaningful chunks
const chunkText = (text, chunkSize = 500) => {
  const chunks = [];
  for (let i = 0; i < text.length; i += chunkSize) {
    chunks.push(text.slice(i, i + chunkSize));
  }
  return chunks;
};

const processAndStoreMedicalRecord = async (patientId, rawText, documentType) => {
  if (!process.env.PINECONE_API_KEY) return; // Skip if no key configured

  const index = getPineconeIndex();
  const embeddingModel = genAI.getGenerativeModel({ model: "text-embedding-004" });
  
  const chunks = chunkText(rawText);
  const vectors = [];

  for (const chunk of chunks) {
    const result = await embeddingModel.embedContent(chunk);
    const embedding = result.embedding.values;
    
    vectors.push({
      id: crypto.randomUUID(),
      values: embedding,
      metadata: {
        patientId: patientId.toString(),
        documentType,
        text: chunk, // Store the raw text chunk to retrieve later
        timestamp: new Date().toISOString()
      }
    });
  }

  // Upsert into Pinecone
  if (vectors.length > 0) {
    await index.upsert(vectors);
  }
};

module.exports = { chunkText, processAndStoreMedicalRecord };
