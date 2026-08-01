const { GoogleGenerativeAI } = require('@google/generative-ai');
const { getPineconeIndex } = require('../config/pinecone.js');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || 'dummy_key');

exports.handleAIConsultation = async (req, res, next) => {
  try {
    const { patientId, query } = req.body;
    
    // 1. Embed the user's question
    const embeddingModel = genAI.getGenerativeModel({ model: "text-embedding-004" });
    const queryEmbedding = await embeddingModel.embedContent(query);
    
    // 2. Query Pinecone for relevant context
    let retrievedContext = "";
    if (process.env.PINECONE_API_KEY) {
        const index = getPineconeIndex();
        const queryResponse = await index.query({
            vector: queryEmbedding.embedding.values,
            topK: 3, // Fetch top 3 most relevant chunks
            includeMetadata: true,
            filter: { patientId: { $eq: patientId.toString() } } // Security: Only retrieve THIS patient's data
        });

        // 3. Construct the RAG Prompt
        retrievedContext = queryResponse.matches
            .map(match => match.metadata.text)
            .join("\n\n");
    }

    const systemPrompt = \`
      You are the HealthEase AI Clinical Assistant. 
      Answer the user's question using ONLY the following medical history and OCR records. 
      If the context does not contain the answer, explicitly state that you do not have that information.
      
      Patient Medical Context:
      \${retrievedContext}
    \`;

    // 4. Generate the response
    const chatModel = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const result = await chatModel.generateContent([
      systemPrompt, 
      \`User Query: \${query}\`
    ]);
    
    res.status(200).json({ success: true, answer: result.response.text() });
  } catch (error) {
    next(error);
  }
};
