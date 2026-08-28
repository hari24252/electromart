import bcrypt from 'bcryptjs';
import { connectDatabase, disconnectDatabase } from '../config/db.js';
import { env } from '../config/env.js';
import { Admin } from '../models/admin.model.js';
import { logger } from '../config/logger.js';

async function main(): Promise<void> {
  const { INITIAL_ADMIN_EMAIL: initialAdminEmail, INITIAL_ADMIN_NAME: initialAdminName, INITIAL_ADMIN_PASSWORD: initialAdminPassword } = env;
  if (!initialAdminEmail || !initialAdminName || !initialAdminPassword) {
    throw new Error('Set INITIAL_ADMIN_NAME, INITIAL_ADMIN_EMAIL, and INITIAL_ADMIN_PASSWORD before running the admin seed command');
  }
  await connectDatabase();
  const existing = await Admin.findOne({ email: initialAdminEmail.toLowerCase() });
  if (existing) logger.info({ email: existing.email }, 'Initial administrator already exists');
  else {
    await Admin.create({ name: initialAdminName, email: initialAdminEmail.toLowerCase(), passwordHash: await bcrypt.hash(initialAdminPassword, 12), role: 'admin' });
    logger.info({ email: initialAdminEmail }, 'Initial administrator created');
  }
  await disconnectDatabase();
}

void main().catch(async (error: unknown) => { logger.error({ err: error }, 'Admin seed failed'); await disconnectDatabase(); process.exitCode = 1; });
