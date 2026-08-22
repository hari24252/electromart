import bcrypt from 'bcryptjs';
import crypto from 'node:crypto';
import { conflict, forbidden, notFound, unauthorized } from '../../utils/apiError.js';
import { generateOtp, hashOtp } from '../../utils/otp.js';
import { signToken, verifyToken } from '../../utils/tokens.js';
import { dispatchOtpEmail } from '../../jobs/email.queue.js';
import { userAuthRepository } from './userAuth.repository.js';

type ContactInput = { email?: string; phone?: string };

const normalizedIdentifier = (identifier: string): string => identifier.trim().toLowerCase();

function authVersionOf(account: { authVersion?: unknown }): number {
  if (typeof account.authVersion !== 'number' || !Number.isInteger(account.authVersion) || account.authVersion < 0) throw unauthorized('Your session is invalid');
  return account.authVersion;
}

function tokenPair(user: { _id: { toString(): string }; authVersion?: unknown }, sessionId: string): { accessToken: string; refreshToken: string } {
  const id = user._id.toString();
  const authVersion = authVersionOf(user);
  return {
    accessToken: signToken(id, 'user', 'access', authVersion, { sessionId }),
    refreshToken: signToken(id, 'user', 'refresh', authVersion, { sessionId }),
  };
}

async function issueSession(user: { _id: { toString(): string }; id: string; authVersion?: unknown }): Promise<{ accessToken: string; refreshToken: string }> {
  const sessionId = crypto.randomUUID();
  const persisted = await userAuthRepository.beginRefreshSession(user.id, authVersionOf(user), sessionId);
  if (!persisted) throw unauthorized('Your session is no longer valid');
  return tokenPair(persisted, sessionId);
}

export const userAuthService = {
  async signup(input: ContactInput & { name: string; password: string }) {
    const identifiers = [input.email?.toLowerCase(), input.phone].filter(Boolean) as string[];
    for (const identifier of identifiers) {
      if (await userAuthRepository.findByIdentifier(identifier)) throw conflict('An account with that email or phone already exists', 'ACCOUNT_EXISTS');
    }
    const passwordHash = await bcrypt.hash(input.password, 12);
    return userAuthRepository.create({ name: input.name, email: input.email?.toLowerCase(), phone: input.phone, passwordHash });
  },

  async sendOtp(identifierInput: string, purpose: 'signup' | 'login' | 'reset') {
    const identifier = normalizedIdentifier(identifierInput);
    const user = await userAuthRepository.findByIdentifier(identifier, purpose === 'login');
    if (!user) throw notFound('Account');
    if (!user.isActive) throw forbidden('This account has been disabled');
    if (purpose === 'signup' && user.isVerified) throw conflict('This account is already verified', 'ALREADY_VERIFIED');
    if ((purpose === 'login' || purpose === 'reset') && !user.isVerified) throw forbidden('Verify your account before continuing');
    if (purpose === 'login' && (!user.loginVerifiedUntil || user.loginVerifiedUntil <= new Date())) throw forbidden('Complete the password check before requesting a login OTP');
    const otp = generateOtp();
    await userAuthRepository.createOtp(identifier, purpose, hashOtp(otp));
    await dispatchOtpEmail({ identifier, otp, purpose });
  },

  async requestPasswordReset(identifierInput: string) {
    const identifier = normalizedIdentifier(identifierInput);
    const user = await userAuthRepository.findByIdentifier(identifier);
    // Preserve a uniform response for account-recovery requests and avoid revealing account state.
    if (!user || !user.isActive || !user.isVerified) return;
    const otp = generateOtp();
    await userAuthRepository.createOtp(identifier, 'reset', hashOtp(otp));
    await dispatchOtpEmail({ identifier, otp, purpose: 'reset' });
  },

  async verifyOtp(identifierInput: string, purpose: 'signup' | 'login' | 'reset', otp: string) {
    const identifier = normalizedIdentifier(identifierInput);
    const otpRecord = await userAuthRepository.findOtp(identifier, purpose);
    if (!otpRecord || otpRecord.attempts >= 5) throw unauthorized('OTP is invalid or has expired');
    if (hashOtp(otp) !== otpRecord.codeHash) {
      await userAuthRepository.incrementOtpAttempt(otpRecord._id.toString());
      throw unauthorized('OTP is invalid or has expired');
    }
    const user = await userAuthRepository.findByIdentifier(identifier, purpose === 'login');
    if (!user) throw notFound('Account');
    await userAuthRepository.deleteOtp(otpRecord._id.toString());
    if (purpose === 'signup') return userAuthRepository.verifyUser(user.id);
    if (purpose === 'reset') {
      await userAuthRepository.setResetVerified(user.id, new Date(Date.now() + 15 * 60 * 1000));
      return { resetVerified: true };
    }
    if (!user.isVerified || !user.isActive) throw unauthorized('Account is not available');
    if (!user.loginVerifiedUntil || user.loginVerifiedUntil <= new Date()) throw unauthorized('Complete the password check before verifying the login OTP');
    await userAuthRepository.clearLoginVerified(user.id);
    await userAuthRepository.updateLastLogin(user.id);
    return issueSession(user);
  },

  async startLogin(identifierInput: string, password: string) {
    const user = await userAuthRepository.findByIdentifier(normalizedIdentifier(identifierInput), true);
    if (!user || !await bcrypt.compare(password, String(user.passwordHash))) throw unauthorized('Invalid identifier or password');
    if (!user.isActive) throw forbidden('This account has been disabled');
    if (!user.isVerified) throw forbidden('Verify your account before signing in');
    await userAuthRepository.setLoginVerified(user.id, new Date(Date.now() + 10 * 60 * 1000));
    await this.sendOtp(identifierInput, 'login');
  },

  async resetPassword(identifierInput: string, password: string) {
    const user = await userAuthRepository.findByIdentifier(normalizedIdentifier(identifierInput), true);
    if (!user || !user.resetVerifiedUntil || user.resetVerifiedUntil <= new Date()) throw unauthorized('Verify the reset OTP before setting a new password');
    const passwordHash = await bcrypt.hash(password, 12);
    await userAuthRepository.updatePassword(user.id, passwordHash);
  },

  async refresh(refreshToken: string) {
    const claims = verifyToken(refreshToken, 'user', 'refresh');
    if (!claims.sessionId) throw unauthorized('Your session is invalid or has expired');
    const nextSessionId = crypto.randomUUID();
    const user = await userAuthRepository.rotateRefreshSession(claims.sub, claims.authVersion, claims.sessionId, nextSessionId);
    if (!user) throw unauthorized('Your session is no longer valid');
    return tokenPair(user, nextSessionId);
  },

  async logout(userId: string) {
    await userAuthRepository.invalidateSessions(userId);
  },

  async profile(userId: string) {
    const user = await userAuthRepository.findById(userId);
    if (!user) throw notFound('Account');
    return user;
  },

  async updateProfile(userId: string, name: string) {
    const user = await userAuthRepository.updateProfile(userId, name);
    if (!user) throw notFound('Account');
    return user;
  },

  async changePassword(userId: string, currentPassword: string, newPassword: string) {
    const user = await userAuthRepository.findById(userId, true);
    if (!user || !await bcrypt.compare(currentPassword, String(user.passwordHash))) throw unauthorized('Current password is incorrect');
    await userAuthRepository.updatePassword(userId, await bcrypt.hash(newPassword, 12));
  },
};
