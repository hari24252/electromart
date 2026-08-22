import { startEmailWorker } from './jobs/email.worker.js';
import { logger } from './config/logger.js';

const worker = startEmailWorker();

async function shutdown(signal: string): Promise<void> {
  logger.info({ signal }, 'OTP worker shutdown initiated');
  await worker?.close();
  process.exit(0);
}

process.once('SIGTERM', () => { void shutdown('SIGTERM'); });
process.once('SIGINT', () => { void shutdown('SIGINT'); });
