import bcrypt from 'bcryptjs';
import crypto from 'node:crypto';
import { conflict, forbidden, notFound, unauthorized } from '../../utils/apiError.js';
import { signToken, verifyToken } from '../../utils/tokens.js';
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
    const user = await userAuthRepository.create({ name: input.name, email: input.email?.toLowerCase(), phone: input.phone, passwordHash, isVerified: true });
    return issueSession(user);
  },

  async login(identifierInput: string, password: string) {
    const user = await userAuthRepository.findByIdentifier(normalizedIdentifier(identifierInput), true);
    if (!user || !await bcrypt.compare(password, String(user.passwordHash))) throw unauthorized('Invalid identifier or password');
    if (!user.isActive) throw forbidden('This account has been disabled');
    await userAuthRepository.updateLastLogin(user.id);
    return issueSession(user);
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
