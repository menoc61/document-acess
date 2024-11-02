import mongoose from 'mongoose';

if (!process.env.MONGODB_URI) {
  throw new Error('Please add your MONGODB_URI to .env.local');
}

export const connectToDatabase = async () => {
  if (mongoose.connection.readyState >= 1) {
    return;
  }
  
  return mongoose.connect(process.env.MONGODB_URI!);
}; 