import mongoose from 'mongoose';
const MONGODB_URL = process.env.MONGODB_URL || 'mongodb://localhost:27017/emechanic';

export const connectDB = async () => {
    await mongoose.connect(MONGODB_URL)
}