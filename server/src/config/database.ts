import mongoose from 'mongoose';
import { env } from './env';

const connectDB = async (): Promise<void> => {
  try {
    const mongoURI = env.MONGODB_URI;
    
    if (!mongoURI) {
      throw new Error('⚠️ MONGODB_URI is not defined, skipping database connection');
    }
    
    await mongoose.connect(mongoURI);
    
    console.log('✅ MongoDB connected successfully');
    console.log(`📊 Database: ${mongoose.connection.name}`);
    console.log(`🌐 Host: ${mongoose.connection.host}:${mongoose.connection.port}`);
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    console.warn('⚠️ Continuing without database connection for testing');
    // Don't exit in test mode
    if (env.NODE_ENV === 'production') {
      process.exit(1);
    }
  }
};

// Handle connection events
mongoose.connection.on('connected', () => {
  console.log('🔗 Mongoose connected to MongoDB');
});

mongoose.connection.on('error', (error) => {
  console.error('❌ Mongoose connection error:', error);
});

mongoose.connection.on('disconnected', () => {
  console.log('🔌 Mongoose disconnected from MongoDB');
});

// Graceful shutdown
process.on('SIGINT', async () => {
  await mongoose.connection.close();
  console.log('🔒 MongoDB connection closed through app termination');
  process.exit(0);
});

export { connectDB };
