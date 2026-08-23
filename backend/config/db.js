const mongoose = require('mongoose');

let cachedConnection = null;

const connectDB = async () => {
  try {
    // Reuse existing connection
    if (cachedConnection && mongoose.connection.readyState === 1) {
      return cachedConnection;
    }

    // Reuse an existing connection attempt
    if (cachedConnection) {
      return cachedConnection;
    }

    if (!process.env.MONGO_URI) {
      throw new Error('MONGO_URI is not defined');
    }

    cachedConnection = mongoose.connect(process.env.MONGO_URI, {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000
    });

    const conn = await cachedConnection;

    console.log(`MongoDB Connected: ${conn.connection.host}`);

    return conn;
  } catch (error) {
    cachedConnection = null;
    console.error(`MongoDB Connection Error: ${error.message}`);
    throw error;
  }
};

module.exports = connectDB;
