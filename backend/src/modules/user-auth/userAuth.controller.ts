import type { RequestHandler } from 'express';
import { asyncHandler } from '../../utils/asyncHandler.js';
import { success } from '../../utils/apiResponse.js';
import { refreshCookieName, refreshCookieOptions } from '../../utils/tokens.js';
import { getUserId } from '../shared/requireAuth.js';
import { userAuthService } from './userAuth.service.js';

const putRefreshCookie = (res: Parameters<RequestHandler>[1], refreshToken: string): void => { res.cookie(refreshCookieName('user'), refreshToken, refreshCookieOptions); };

export const userAuthController = {
  signup: asyncHandler(async (req, res) => {
    const tokens = await userAuthService.signup(req.body);
    putRefreshCookie(res, tokens.refreshToken);
    return success(res, { accessToken: tokens.accessToken }, 'Account created and signed in', 201);
  }),
  login: asyncHandler(async (req, res) => {
    const tokens = await userAuthService.login(req.body.identifier, req.body.password);
    putRefreshCookie(res, tokens.refreshToken);
    return success(res, { accessToken: tokens.accessToken }, 'Signed in');
  }),
  refreshToken: asyncHandler(async (req, res) => {
    const tokens = await userAuthService.refresh(req.cookies[refreshCookieName('user')] as string);
    putRefreshCookie(res, tokens.refreshToken);
    return success(res, { accessToken: tokens.accessToken }, 'Token refreshed');
  }),
  logout: asyncHandler(async (req, res) => { await userAuthService.logout(getUserId(req)); res.clearCookie(refreshCookieName('user'), refreshCookieOptions); return success(res, null, 'Signed out'); }),
  me: asyncHandler(async (req, res) => success(res, await userAuthService.profile(getUserId(req)))),
  updateProfile: asyncHandler(async (req, res) => success(res, await userAuthService.updateProfile(getUserId(req), req.body.name), 'Profile updated')),
  changePassword: asyncHandler(async (req, res) => { await userAuthService.changePassword(getUserId(req), req.body.currentPassword, req.body.newPassword); res.clearCookie(refreshCookieName('user'), refreshCookieOptions); return success(res, null, 'Password updated; please sign in again'); }),
};
