import { Admin } from '../../models/admin.model.js';

export const adminAuthRepository = {
  findByEmail: (email: string, includePassword = false) => {
    const query = Admin.findOne({ email: email.toLowerCase() });
    return includePassword ? query.select('+passwordHash') : query;
  },
  findById: (id: string, includeSession = false) => {
    const query = Admin.findById(id);
    return includeSession ? query.select('+refreshSessionId') : query;
  },
  create: (data: Record<string, unknown>) => Admin.create(data),
  updatePassword: (id: string, passwordHash: string) => Admin.findByIdAndUpdate(id, { passwordHash, $unset: { refreshSessionId: 1 }, $inc: { authVersion: 1 } }, { new: true }),
  updateLastLogin: (id: string) => Admin.findByIdAndUpdate(id, { lastLoginAt: new Date() }),
  invalidateSessions: (id: string) => Admin.findByIdAndUpdate(id, { $unset: { refreshSessionId: 1 }, $inc: { authVersion: 1 } }, { new: true }),
  beginRefreshSession: (id: string, authVersion: number, sessionId: string) => Admin.findOneAndUpdate(
    { _id: id, isActive: true, authVersion },
    { $set: { refreshSessionId: sessionId } },
    { new: true },
  ),
  rotateRefreshSession: (id: string, authVersion: number, currentSessionId: string, nextSessionId: string) => Admin.findOneAndUpdate(
    { _id: id, isActive: true, authVersion, refreshSessionId: currentSessionId },
    { $set: { refreshSessionId: nextSessionId } },
    { new: true },
  ),
};
