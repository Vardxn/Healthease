const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        if (!process.env.MONGO_URI) {
            const message = 'MONGO_URI is not configured';

            if (process.env.VERCEL) {
                console.warn(`⚠️ ${message}. API routes requiring DB will fail until env vars are set.`);
                return;
            }

            throw new Error(message);
        }

        if (mongoose.connection.readyState === 1) {
            return;
        }

        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ MongoDB Connected...');
    } catch (err) {
        console.error('❌ MongoDB Connection Error:', err.message);

        // In serverless environments, never force-exit the process.
        if (process.env.VERCEL) {
            throw err;
        }

        process.exit(1);
    }
};

module.exports = connectDB;
