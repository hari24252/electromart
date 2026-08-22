import type { RequestHandler } from 'express';
import { asyncHandler } from '../../utils/asyncHandler.js';
import { success } from '../../utils/apiResponse.js';
import { refreshCookieName, refreshCookieOptions } from '../../utils/tokens.js';
import { getUserId } from '../shared/requireAuth.js';
import { userAuthService } from './userAuth.service.js';

const putRefreshCookie = (res: Parameters<RequestHandler>[1], refreshToken: string): void => { res.cookie(refreshCookieName('user'), refreshToken, refreshCookieOptions); };

export const userAuthController = {
  signup: asyncHandler(async (req, res) => success(res, await userAuthService.signup(req.body), 'Account created. Request an OTP to verify it.', 201)),
  sendOtp: asyncHandler(async (req, res) => { await userAuthService.sendOtp(req.body.identifier, req.body.purpose); return success(res, null, 'OTP sent'); }),
  verifyOtp: asyncHandler(async (req, res) => {
    const result = await userAuthService.verifyOtp(req.body.identifier, req.body.purpose, req.body.otp);
    if ('refreshToken' in result) putRefreshCookie(res, result.refreshToken);
    return success(res, result, req.body.purpose === 'signup' ? 'Account verified' : 'OTP verified');
  }),
  login: asyncHandler(async (req, res) => { await userAuthService.startLogin(req.body.identifier, req.body.password); return success(res, null, 'Credentials accepted. An OTP has been sent.'); }),
  verifyLoginOtp: asyncHandler(async (req, res) => {
    const tokens = await userAuthService.verifyOtp(req.body.identifier, 'login', req.body.otp);
    if (!('refreshToken' in tokens)) throw new Error('Login OTP did not issue tokens');
    putRefreshCookie(res, tokens.refreshToken);
    return success(res, tokens, 'Signed in');
  }),
  forgotPassword: asyncHandler(async (req, res) => { await userAuthService.requestPasswordReset(req.body.identifier); return success(res, null, 'If the account exists, an OTP has been sent.'); }),
  resetPassword: asyncHandler(async (req, res) => { await userAuthService.resetPassword(req.body.identifier, req.body.password); return success(res, null, 'Password updated'); }),
  refreshToken: asyncHandler(async (req, res) => {
    const tokens = await userAuthService.refresh(req.cookies[refreshCookieName('user')] as string);
    putRefreshCookie(res, tokens.refreshToken);
    return success(res, tokens, 'Token refreshed');
  }),
  logout: asyncHandler(async (req, res) => { await userAuthService.logout(getUserId(req)); res.clearCookie(refreshCookieName('user'), refreshCookieOptions); return success(res, null, 'Signed out'); }),
  me: asyncHandler(async (req, res) => success(res, await userAuthService.profile(getUserId(req)))),
  updateProfile: asyncHandler(async (req, res) => success(res, await userAuthService.updateProfile(getUserId(req), req.body.name), 'Profile updated')),
  changePassword: asyncHandler(async (req, res) => { await userAuthService.changePassword(getUserId(req), req.body.currentPassword, req.body.newPassword); res.clearCookie(refreshCookieName('user'), refreshCookieOptions); return success(res, null, 'Password updated; please sign in again'); }),
};
