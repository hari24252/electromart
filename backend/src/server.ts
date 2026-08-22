import { app } from './app.js';
import { connectDatabase, disconnectDatabase } from './config/db.js';
import { closeCache } from './services/cache.service.js';
import { env } from './config/env.js';
import { logger } from './config/logger.js';
import { closeQueues } from './jobs/email.queue.js';

async function bootstrap(): Promise<void> {
  await connectDatabase();
  const server = app.listen(env.PORT, () => logger.info({ port: env.PORT, environment: env.NODE_ENV }, 'ElectroMart API listening'));
  server.requestTimeout = 30_000;
  server.keepAliveTimeout = 65_000;
  server.headersTimeout = 66_000;
  let shuttingDown = false;
  const shutdown = async (signal: string): Promise<void> => {
    if (shuttingDown) return;
    shuttingDown = true;
    logger.info({ signal }, 'Graceful shutdown initiated');
    const forceExit = setTimeout(() => {
      logger.error('Graceful shutdown timed out; forcing exit');
      process.exit(1);
    }, 30_000);
    forceExit.unref();
    server.close(async () => {
      await Promise.all([disconnectDatabase(), closeQueues(), closeCache()]);
      clearTimeout(forceExit);
      process.exit(0);
    });
  };
  process.once('SIGTERM', () => { void shutdown('SIGTERM'); });
  process.once('SIGINT', () => { void shutdown('SIGINT'); });
}

void bootstrap().catch((error: unknown) => { logger.fatal({ err: error }, 'Unable to start API'); process.exit(1); });
