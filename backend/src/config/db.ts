import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';
import { env } from './env.js';
import { logger } from './logger.js';
import { Admin } from '../models/admin.model.js';

let mongodInstance: any = null;

async function ensureInitialAdmin(): Promise<void> {
  const email = env.INITIAL_ADMIN_EMAIL.toLowerCase();
  const existing = await Admin.exists({ email });
  if (existing) return;

  try {
    await Admin.create({
      name: env.INITIAL_ADMIN_NAME,
      email,
      passwordHash: await bcrypt.hash(env.INITIAL_ADMIN_PASSWORD, 12),
      role: 'admin',
    });
    logger.info({ email }, 'Initial administrator created');
  } catch (error) {
    // Another development server can create the same first account concurrently.
    if (!(error && typeof error === 'object' && 'code' in error && error.code === 11000)) throw error;
  }
}

export async function connectDatabase(): Promise<void> {
  mongoose.set('strictQuery', true);
  mongoose.set('autoIndex', env.NODE_ENV !== 'production');
  try {
    await mongoose.connect(env.MONGODB_URI, { serverSelectionTimeoutMS: 2000 });
    logger.info({ database: mongoose.connection.name }, 'MongoDB connected');
    await ensureInitialAdmin();
  } catch (error) {
    if (env.NODE_ENV === 'development') {
      logger.info('Local MongoDB server not reachable, starting MongoMemoryServer fallback...');
      const { MongoMemoryServer } = await import('mongodb-memory-server');
      mongodInstance = await MongoMemoryServer.create({ binary: { version: '4.4.18' } });
      const uri = mongodInstance.getUri();
      await mongoose.connect(uri);
      logger.info({ database: mongoose.connection.name }, 'In-Memory MongoDB connected successfully');
      try {
        await ensureInitialAdmin();
      } catch (seedErr) {
        logger.error({ err: seedErr }, 'Failed to seed initial admin');
      }
    } else {
      throw error;
    }
  }
}

export async function disconnectDatabase(): Promise<void> {
  await mongoose.disconnect();
  if (mongodInstance) {
    await mongodInstance.stop();
  }
}

export function isDatabaseReady(): boolean {
  return mongoose.connection.readyState === mongoose.ConnectionStates.connected;
}
