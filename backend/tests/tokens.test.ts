import { describe, expect, it } from 'vitest';
import { signToken, verifyToken } from '../src/utils/tokens.js';

describe('token isolation', () => {
  it('preserves a primary administrator role in administrator claims', () => {
    const token = signToken('64d000000000000000000003', 'admin', 'access', 7, { sessionId: 'session-a', adminRole: 'admin' });
    expect(verifyToken(token, 'admin', 'access')).toMatchObject({
      sub: '64d000000000000000000003', authVersion: 7, sessionId: 'session-a', adminRole: 'admin',
    });
  });

  it('rejects a customer token when it is presented as an administrator token', () => {
    const token = signToken('64d000000000000000000004', 'user', 'access', 0, { sessionId: 'session-b' });
    expect(() => verifyToken(token, 'admin', 'access')).toThrow('session is invalid or has expired');
  });
});
