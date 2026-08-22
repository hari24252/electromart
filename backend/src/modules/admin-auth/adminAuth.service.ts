import bcrypt from 'bcryptjs';
import crypto from 'node:crypto';
import { conflict, forbidden, notFound, unauthorized } from '../../utils/apiError.js';
import type { AuthenticatedAdmin } from '../../types/auth.js';
import { writeAdminAudit } from '../../services/audit.service.js';
import { signToken, verifyToken } from '../../utils/tokens.js';
import { adminAuthRepository } from './adminAuth.repository.js';

function adminRoleOf(account: { role?: unknown }): 'admin' | 'sub-admin' {
  if (account.role === 'admin' || account.role === 'sub-admin') return account.role;
  throw unauthorized('Your administrator session is invalid');
}

function authVersionOf(account: { authVersion?: unknown }): number {
  if (typeof account.authVersion !== 'number' || !Number.isInteger(account.authVersion) || account.authVersion < 0) throw unauthorized('Your administrator session is invalid');
  return account.authVersion;
}

function tokenPair(admin: { _id: { toString(): string }; authVersion?: unknown; role?: unknown }, sessionId: string): { accessToken: string; refreshToken: string } {
  const id = admin._id.toString();
  const extras = { sessionId, adminRole: adminRoleOf(admin) };
  const authVersion = authVersionOf(admin);
  return { accessToken: signToken(id, 'admin', 'access', authVersion, extras), refreshToken: signToken(id, 'admin', 'refresh', authVersion, extras) };
}

async function issueSession(admin: { _id: { toString(): string }; id: string; authVersion?: unknown; role?: unknown }): Promise<{ accessToken: string; refreshToken: string }> {
  const sessionId = crypto.randomUUID();
  const persisted = await adminAuthRepository.beginRefreshSession(admin.id, authVersionOf(admin), sessionId);
  if (!persisted) throw unauthorized('Your administrator session is no longer valid');
  return tokenPair(persisted, sessionId);
}

export const adminAuthService = {
  async login(email: string, password: string) {
    const admin = await adminAuthRepository.findByEmail(email, true);
    if (!admin || !await bcrypt.compare(password, String(admin.passwordHash))) throw unauthorized('Invalid administrator credentials');
    if (!admin.isActive) throw forbidden('This administrator account has been disabled');
    await adminAuthRepository.updateLastLogin(admin.id);
    return issueSession(admin);
  },

  async createSubAdmin(input: { name: string; email: string; password: string }, actor: AuthenticatedAdmin) {
    if (actor.role !== 'admin') throw forbidden('Only a primary administrator can manage administrator accounts');
    if (await adminAuthRepository.findByEmail(input.email)) throw conflict('An administrator with that email already exists', 'ADMIN_EXISTS');
    const admin = await adminAuthRepository.create({ name: input.name, email: input.email.toLowerCase(), passwordHash: await bcrypt.hash(input.password, 12), role: 'sub-admin' });
    await writeAdminAudit(actor.id, 'admin.create', 'admin', admin.id, { email: admin.email, role: admin.role });
    return admin;
  },

  async refresh(refreshToken: string) {
    const claims = verifyToken(refreshToken, 'admin', 'refresh');
    if (!claims.sessionId || !claims.adminRole) throw unauthorized('Your administrator session is invalid or has expired');
    const nextSessionId = crypto.randomUUID();
    const admin = await adminAuthRepository.rotateRefreshSession(claims.sub, claims.authVersion, claims.sessionId, nextSessionId);
    if (!admin || adminRoleOf(admin) !== claims.adminRole) throw unauthorized('Your administrator session is no longer valid');
    return tokenPair(admin, nextSessionId);
  },

  async logout(id: string) { await adminAuthRepository.invalidateSessions(id); },
  async profile(id: string) { const admin = await adminAuthRepository.findById(id); if (!admin) throw notFound('Administrator'); return admin; },
  async changePassword(id: string, currentPassword: string, newPassword: string) {
    const admin = await adminAuthRepository.findById(id, true);
    if (!admin || !await bcrypt.compare(currentPassword, String(admin.passwordHash))) throw unauthorized('Current password is incorrect');
    const updated = await adminAuthRepository.updatePassword(id, await bcrypt.hash(newPassword, 12));
    if (!updated) throw notFound('Administrator');
    await writeAdminAudit(id, 'admin.password.change', 'admin', id);
  },
};
