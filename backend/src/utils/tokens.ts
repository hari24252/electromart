import jwt from 'jsonwebtoken';
import type { CookieOptions } from 'express';
import { env } from '../config/env.js';
import type { TokenClaims } from '../types/auth.js';
import { unauthorized } from './apiError.js';

type Scope = TokenClaims['scope'];
type TokenType = TokenClaims['tokenType'];
type TokenExtras = Pick<TokenClaims, 'sessionId' | 'adminRole'>;

const secretFor = (scope: Scope, tokenType: TokenType): string => {
  if (scope === 'user') return tokenType === 'access' ? env.USER_JWT_SECRET : env.USER_REFRESH_JWT_SECRET;
  return tokenType === 'access' ? env.ADMIN_JWT_SECRET : env.ADMIN_REFRESH_JWT_SECRET;
};

export function signToken(subject: string, scope: Scope, tokenType: TokenType, authVersion: number, extras: TokenExtras = {}): string {
  return jwt.sign(
    { scope, tokenType, authVersion, ...(extras.sessionId ? { sid: extras.sessionId } : {}), ...(extras.adminRole ? { adminRole: extras.adminRole } : {}) },
    secretFor(scope, tokenType),
    { subject, expiresIn: (tokenType === 'access' ? env.ACCESS_TOKEN_TTL : env.REFRESH_TOKEN_TTL) as jwt.SignOptions['expiresIn'] },
  );
}

export function verifyToken(token: string, scope: Scope, tokenType: TokenType): TokenClaims {
  try {
    const decoded = jwt.verify(token, secretFor(scope, tokenType));
    if (typeof decoded === 'string' || decoded.scope !== scope || decoded.tokenType !== tokenType || typeof decoded.sub !== 'string') {
      throw unauthorized('Invalid authentication token');
    }
    return {
      sub: decoded.sub,
      scope,
      tokenType,
      authVersion: typeof decoded.authVersion === 'number' ? decoded.authVersion : 0,
      ...(typeof decoded.sid === 'string' ? { sessionId: decoded.sid } : {}),
      ...(decoded.adminRole === 'admin' || decoded.adminRole === 'sub-admin' ? { adminRole: decoded.adminRole } : {}),
    };
  } catch (error) {
    if (error instanceof Error && error.name === 'ApiError') throw error;
    throw unauthorized('Your session is invalid or has expired');
  }
}

export const refreshCookieName = (scope: Scope): string => `${scope}_refresh`;
const durationToMilliseconds = (duration: string): number => {
  const match = /^(\d+)([smhd])$/.exec(duration);
  if (!match) throw new Error(`Unsupported cookie duration: ${duration}`);
  const multipliers = { s: 1000, m: 60_000, h: 3_600_000, d: 86_400_000 } as const;
  return Number(match[1]) * multipliers[match[2] as keyof typeof multipliers];
};
export const refreshCookieOptions: CookieOptions = {
  httpOnly: true,
  secure: env.COOKIE_SECURE,
  sameSite: env.COOKIE_SECURE ? 'none' : 'lax',
  maxAge: durationToMilliseconds(env.REFRESH_TOKEN_TTL),
  path: '/api',
};
