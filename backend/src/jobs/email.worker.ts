import { Worker } from 'bullmq';
import { env } from '../config/env.js';
import { logger } from '../config/logger.js';
import { sendOtpEmail } from '../config/mail.js';

interface OtpEmailJob { identifier: string; otp: string; purpose: string; }

export function startEmailWorker(): Worker<OtpEmailJob> | undefined {
  if (!env.REDIS_URL) {
    logger.info('Redis is not configured; OTP email worker is disabled');
    return undefined;
  }
  const worker = new Worker<OtpEmailJob>(
    'otp-emails',
    async (job) => sendOtpEmail(job.data.identifier, job.data.otp, job.data.purpose),
    { connection: { url: env.REDIS_URL }, concurrency: 5 },
  );
  worker.on('completed', (job) => logger.debug({ jobId: job.id }, 'OTP delivery job completed'));
  worker.on('failed', (job, error) => logger.error({ err: error, jobId: job?.id }, 'OTP delivery job failed'));
  return worker;
}
