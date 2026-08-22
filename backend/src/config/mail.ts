import nodemailer from 'nodemailer';
import { env } from './env.js';
import { logger } from './logger.js';
import { ApiError } from '../utils/apiError.js';

const transporter = env.SMTP_HOST && env.SMTP_USER && env.SMTP_PASS
  ? nodemailer.createTransport({
      host: env.SMTP_HOST,
      port: env.SMTP_PORT,
      secure: env.SMTP_PORT === 465,
      auth: { user: env.SMTP_USER, pass: env.SMTP_PASS },
    })
  : undefined;

export async function sendOtpEmail(identifier: string, otp: string, purpose: string): Promise<void> {
  if (!identifier.includes('@')) {
    if (env.NODE_ENV === 'production') throw new ApiError(503, 'Phone OTP delivery is not configured', 'OTP_DELIVERY_UNAVAILABLE');
    logger.info({ identifier, otp, purpose }, 'SMS delivery is simulated; OTP generated');
    return;
  }
  if (!transporter) {
    if (env.NODE_ENV === 'production') throw new ApiError(503, 'Email OTP delivery is not configured', 'OTP_DELIVERY_UNAVAILABLE');
    logger.info({ identifier, otp, purpose }, 'SMTP is not configured; OTP generated for local development');
    return;
  }
  await transporter.sendMail({
    from: env.SMTP_FROM,
    to: identifier,
    subject: `Your ElectroMart ${purpose} verification code`,
    text: `Your verification code is ${otp}. It expires in 10 minutes.`,
  });
}
