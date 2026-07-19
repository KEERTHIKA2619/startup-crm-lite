import mongoose from 'mongoose';
import dotenv from 'dotenv';

// Load environment variables in case they are not loaded yet
dotenv.config();

/**
 * Connect to MongoDB Atlas
 * @returns {Promise<void>} Resolves when connection is established
 */
export const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log(`MongoDB Atlas Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Database connection error: ${error.message}`);
    process.exit(1);
  }
};
