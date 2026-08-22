import type { Response } from 'express';
import { asyncHandler } from '../../utils/asyncHandler.js';
import { success } from '../../utils/apiResponse.js';
import { refreshCookieName, refreshCookieOptions } from '../../utils/tokens.js';
import { getAdmin, getAdminId } from '../shared/requireAuth.js';
import { adminAuthService } from './adminAuth.service.js';

const putRefreshCookie = (res: Response, refreshToken: string): void => { res.cookie(refreshCookieName('admin'), refreshToken, refreshCookieOptions); };

export const adminAuthController = {
  login: asyncHandler(async (req, res) => { const tokens = await adminAuthService.login(req.body.email, req.body.password); putRefreshCookie(res, tokens.refreshToken); return success(res, tokens, 'Administrator signed in'); }),
  createSubAdmin: asyncHandler(async (req, res) => success(res, await adminAuthService.createSubAdmin(req.body, getAdmin(req)), 'Sub-administrator created', 201)),
  refreshToken: asyncHandler(async (req, res) => { const tokens = await adminAuthService.refresh(req.cookies[refreshCookieName('admin')] as string); putRefreshCookie(res, tokens.refreshToken); return success(res, tokens, 'Token refreshed'); }),
  logout: asyncHandler(async (req, res) => { await adminAuthService.logout(getAdminId(req)); res.clearCookie(refreshCookieName('admin'), refreshCookieOptions); return success(res, null, 'Administrator signed out'); }),
  me: asyncHandler(async (req, res) => success(res, await adminAuthService.profile(getAdminId(req)))),
  changePassword: asyncHandler(async (req, res) => { await adminAuthService.changePassword(getAdminId(req), req.body.currentPassword, req.body.newPassword); res.clearCookie(refreshCookieName('admin'), refreshCookieOptions); return success(res, null, 'Password updated; please sign in again'); }),
};
