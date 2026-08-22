import { User } from '../../models/user.model.js';
import { Otp } from '../../models/otp.model.js';

const contactFilter = (identifier: string): Record<string, string> => identifier.includes('@')
  ? { email: identifier.toLowerCase() }
  : { phone: identifier };

export const userAuthRepository = {
  create: (data: Record<string, unknown>) => User.create(data),
  findByIdentifier: (identifier: string, includePassword = false) => {
    const query = User.findOne(contactFilter(identifier));
    return includePassword ? query.select('+passwordHash +resetVerifiedUntil +loginVerifiedUntil') : query;
  },
  findById: (id: string, includePassword = false, includeSession = false) => {
    const query = User.findById(id);
    const fields = [
      ...(includePassword ? ['+passwordHash', '+resetVerifiedUntil', '+loginVerifiedUntil'] : []),
      ...(includeSession ? ['+refreshSessionId'] : []),
    ];
    return fields.length ? query.select(fields.join(' ')) : query;
  },
  verifyUser: (id: string) => User.findByIdAndUpdate(id, { isVerified: true }, { new: true }),
  updateProfile: (id: string, name: string) => User.findByIdAndUpdate(id, { name }, { new: true }),
  updatePassword: (id: string, passwordHash: string) => User.findByIdAndUpdate(id, { passwordHash, $unset: { resetVerifiedUntil: 1, loginVerifiedUntil: 1, refreshSessionId: 1 }, $inc: { authVersion: 1 } }, { new: true }),
  setResetVerified: (id: string, until: Date) => User.findByIdAndUpdate(id, { resetVerifiedUntil: until }),
  setLoginVerified: (id: string, until: Date) => User.findByIdAndUpdate(id, { loginVerifiedUntil: until }),
  clearLoginVerified: (id: string) => User.findByIdAndUpdate(id, { $unset: { loginVerifiedUntil: 1 } }),
  updateLastLogin: (id: string) => User.findByIdAndUpdate(id, { lastLoginAt: new Date() }),
  invalidateSessions: (id: string) => User.findByIdAndUpdate(id, { $unset: { refreshSessionId: 1 }, $inc: { authVersion: 1 } }, { new: true }),
  beginRefreshSession: (id: string, authVersion: number, sessionId: string) => User.findOneAndUpdate(
    { _id: id, isActive: true, authVersion },
    { $set: { refreshSessionId: sessionId } },
    { new: true },
  ),
  rotateRefreshSession: (id: string, authVersion: number, currentSessionId: string, nextSessionId: string) => User.findOneAndUpdate(
    { _id: id, isActive: true, authVersion, refreshSessionId: currentSessionId },
    { $set: { refreshSessionId: nextSessionId } },
    { new: true },
  ),
  createOtp: async (identifier: string, purpose: 'signup' | 'login' | 'reset', codeHash: string) => {
    await Otp.deleteMany({ identifier: identifier.toLowerCase(), purpose });
    return Otp.create({ identifier: identifier.toLowerCase(), purpose, codeHash, expiresAt: new Date(Date.now() + 10 * 60 * 1000) });
  },
  findOtp: (identifier: string, purpose: 'signup' | 'login' | 'reset') => Otp.findOne({ identifier: identifier.toLowerCase(), purpose, expiresAt: { $gt: new Date() } }).select('+codeHash'),
  incrementOtpAttempt: (id: string) => Otp.findByIdAndUpdate(id, { $inc: { attempts: 1 } }),
  deleteOtp: (id: string) => Otp.findByIdAndDelete(id),
};
