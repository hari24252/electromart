import bcrypt from 'bcryptjs';
import { connectDatabase, disconnectDatabase } from '../config/db.js';
import { env } from '../config/env.js';
import { Admin } from '../models/admin.model.js';
import { logger } from '../config/logger.js';

async function main(): Promise<void> {
  await connectDatabase();
  const existing = await Admin.findOne({ email: env.INITIAL_ADMIN_EMAIL.toLowerCase() });
  if (existing) logger.info({ email: existing.email }, 'Initial administrator already exists');
  else {
    await Admin.create({ name: env.INITIAL_ADMIN_NAME, email: env.INITIAL_ADMIN_EMAIL.toLowerCase(), passwordHash: await bcrypt.hash(env.INITIAL_ADMIN_PASSWORD, 12), role: 'admin' });
    logger.info({ email: env.INITIAL_ADMIN_EMAIL }, 'Initial administrator created');
  }
  await disconnectDatabase();
}

void main().catch(async (error: unknown) => { logger.error({ err: error }, 'Admin seed failed'); await disconnectDatabase(); process.exitCode = 1; });
