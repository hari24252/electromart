import pino from 'pino';
import { env } from './env.js';

const baseOptions = {
  redact: {
    paths: ['req.headers.authorization', 'req.headers.cookie', 'res.headers.set-cookie'],
    censor: '[REDACTED]',
  },
  base: undefined,
};

export const logger = env.NODE_ENV === 'development'
  ? pino({ ...baseOptions, level: 'debug', transport: { target: 'pino/file', options: { destination: 1 } } })
  : pino({ ...baseOptions, level: 'info' });
