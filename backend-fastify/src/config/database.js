import mongoose from 'mongoose';
import { config } from './env.js';

export async function connectDatabase(fastify) {
  try {
    await mongoose.connect(config.mongoUri);
    fastify.log.info('✅ MongoDB connected successfully');
    
    mongoose.connection.on('error', (err) => {
      fastify.log.error('MongoDB connection error:', err);
    });

    mongoose.connection.on('disconnected', () => {
      fastify.log.warn('MongoDB disconnected');
    });

  } catch (error) {
    fastify.log.error('Failed to connect to MongoDB:', error);
    process.exit(1);
  }
}

export async function closeDatabase() {
  await mongoose.connection.close();
}
