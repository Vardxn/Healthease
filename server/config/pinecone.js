const { Pinecone } = require('@pinecone-database/pinecone');

if (!process.env.PINECONE_API_KEY) {
  console.warn("PINECONE_API_KEY is missing from environment variables");
}

const pc = new Pinecone({
  apiKey: process.env.PINECONE_API_KEY || 'dummy_key_for_now',
});

const getPineconeIndex = () => pc.index(process.env.PINECONE_INDEX_NAME || 'healthease');

module.exports = { pc, getPineconeIndex };
