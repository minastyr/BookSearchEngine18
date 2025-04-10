import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();
// Import the dotenv package to load environment variables from a .env file
console.log('MongoDB URI:', process.env.MONGODB_URI); // Log the MongoDB URI for debugging

mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/googlebooks');

export default mongoose.connection;
