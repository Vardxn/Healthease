const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/healthease';

        if (mongoose.connection.readyState === 1) {
            return;
        }

        await mongoose.connect(mongoUri);
        console.log('MongoDB connected...');
    } catch (err) {
        console.error('MongoDB connection error:', err.message);

        // In serverless environments, never force-exit the process.
        if (process.env.VERCEL) {
            throw err;
        }

        process.exit(1);
    }
};

module.exports = connectDB;
