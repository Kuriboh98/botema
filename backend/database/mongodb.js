// database/mongodb.js
import mongoose from 'mongoose';
import dns from 'node:dns';

dns.setServers(['8.8.8.8', '1.1.1.1']);

export async function connectMongoDB() {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB connected');
}
