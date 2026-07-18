import mongoose from 'mongoose';
import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

/**
 * Establishes connection to the MongoDB Atlas database.
 * Uses configuration parameters stored in process.env.
 * 
 * @async
 * @function connectDB
 * @returns {Promise<void>} Resolves when connection succeeds, terminates process on failure.
 */
const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGODB_URI;
    if (!mongoURI) {
      throw new Error('MONGODB_URI environment variable is not defined.');
    }

    // Connect to database without deprecated options that are unsupported in Mongoose 9+
    const conn = await mongoose.connect(mongoURI);

    console.log(`MongoDB Atlas Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`MongoDB connection error: ${error.message}`);
    // Terminate process with failure code
    process.exit(1);
  }
};

export default connectDB;
