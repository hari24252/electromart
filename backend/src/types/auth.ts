export interface TokenClaims {
  sub: string;
  scope: 'user' | 'admin';
  tokenType: 'access' | 'refresh';
  authVersion: number;
  sessionId?: string;
  adminRole?: 'admin' | 'sub-admin';
}

export interface AuthenticatedUser {
  id: string;
  role: 'user';
  authVersion: number;
}

export interface AuthenticatedAdmin {
  id: string;
  role: 'admin' | 'sub-admin';
  authVersion: number;
}
