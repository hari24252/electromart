import { User } from '../../models/user.model.js';

const contactFilter = (identifier: string): Record<string, string> => identifier.includes('@')
  ? { email: identifier.toLowerCase() }
  : { phone: identifier };

export const userAuthRepository = {
  create: (data: Record<string, unknown>) => User.create(data),
  findByIdentifier: (identifier: string, includePassword = false) => {
    const query = User.findOne(contactFilter(identifier));
    return includePassword ? query.select('+passwordHash') : query;
  },
  findById: (id: string, includePassword = false, includeSession = false) => {
    const query = User.findById(id);
    const fields = [
      ...(includePassword ? ['+passwordHash'] : []),
      ...(includeSession ? ['+refreshSessionId'] : []),
    ];
    return fields.length ? query.select(fields.join(' ')) : query;
  },
  updateProfile: (id: string, name: string) => User.findByIdAndUpdate(id, { name }, { returnDocument: 'after' }),
  updatePassword: (id: string, passwordHash: string) => User.findByIdAndUpdate(id, { passwordHash, $unset: { refreshSessionId: 1 }, $inc: { authVersion: 1 } }, { returnDocument: 'after' }),
  updateLastLogin: (id: string) => User.findByIdAndUpdate(id, { lastLoginAt: new Date() }),
  invalidateSessions: (id: string) => User.findByIdAndUpdate(id, { $unset: { refreshSessionId: 1 }, $inc: { authVersion: 1 } }, { returnDocument: 'after' }),
  beginRefreshSession: (id: string, authVersion: number, sessionId: string) => User.findOneAndUpdate(
    { _id: id, isActive: true, authVersion },
    { $set: { refreshSessionId: sessionId } },
    { returnDocument: 'after' },
  ),
  rotateRefreshSession: (id: string, authVersion: number, currentSessionId: string, nextSessionId: string) => User.findOneAndUpdate(
    { _id: id, isActive: true, authVersion, refreshSessionId: currentSessionId },
    { $set: { refreshSessionId: nextSessionId } },
    { returnDocument: 'after' },
  ),
};
