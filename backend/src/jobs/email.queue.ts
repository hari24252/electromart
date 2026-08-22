import { Queue } from 'bullmq';
import { env } from '../config/env.js';
import { logger } from '../config/logger.js';
import { sendOtpEmail } from '../config/mail.js';

interface OtpEmailJob { identifier: string; otp: string; purpose: string; }

const queue = env.REDIS_URL
  ? new Queue<OtpEmailJob>('otp-emails', { connection: { url: env.REDIS_URL } })
  : undefined;

/** Uses Redis/BullMQ when configured and falls back to immediate local delivery for development. */
export async function dispatchOtpEmail(payload: OtpEmailJob): Promise<void> {
  if (queue) {
    await queue.add('send-otp', payload, { attempts: 3, backoff: { type: 'exponential', delay: 1000 }, removeOnComplete: 1000 });
    return;
  }
  await sendOtpEmail(payload.identifier, payload.otp, payload.purpose);
}

export function closeQueues(): Promise<void> {
  if (!queue) return Promise.resolve();
  logger.info('Closing BullMQ queues');
  return queue.close();
}
