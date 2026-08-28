import axios, { type AxiosError, type InternalAxiosRequestConfig } from 'axios';
import { useAuthStore } from '@/stores/authStore';

interface ApiEnvelope<T> {
  success: boolean;
  message: string;
  data: T;
}

interface ApiFailure {
  success: false;
  code: string;
  message: string;
}

interface TokenPayload {
  accessToken: string;
}

interface RetriableConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
  authScope?: 'user' | 'admin';
  suppressAuthRedirect?: boolean;
}

const baseURL = import.meta.env.VITE_API_URL?.replace(/\/$/, '') || '/api';

export const apiClient = axios.create({
  baseURL,
  withCredentials: true,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

const refreshClient = axios.create({
  baseURL,
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
});

let userRefreshRequest: Promise<string | null> | null = null;
let adminRefreshRequest: Promise<string | null> | null = null;

function isAdminRequest(config: Pick<RetriableConfig, 'url' | 'authScope'>): boolean {
  return config.authScope === 'admin' || Boolean(config.url?.startsWith('/admin/'));
}

function isRefreshRequest(url: string | undefined): boolean {
  return url === '/auth/refresh-token' || url === '/admin/auth/refresh-token';
}

async function refreshAccessToken(admin: boolean): Promise<string | null> {
  const current = admin ? adminRefreshRequest : userRefreshRequest;
  if (current) return current;

  const request = refreshClient
    .post<ApiEnvelope<TokenPayload>>(admin ? '/admin/auth/refresh-token' : '/auth/refresh-token')
    .then((response) => {
      const accessToken = response.data.data.accessToken;
      if (admin) useAuthStore.getState().setAdminAccessToken(accessToken);
      else useAuthStore.getState().setAccessToken(accessToken);
      return accessToken;
    })
    .catch(() => null)
    .finally(() => {
      if (admin) adminRefreshRequest = null;
      else userRefreshRequest = null;
    });

  if (admin) adminRefreshRequest = request;
  else userRefreshRequest = request;
  return request;
}

apiClient.interceptors.request.use((config) => {
  const state = useAuthStore.getState();
  const token = isAdminRequest(config as RetriableConfig) ? state.adminAccessToken : state.accessToken;
  if (token) {
    config.headers = config.headers ?? {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError<ApiFailure>) => {
    const original = error.config as RetriableConfig | undefined;
    if (error.response?.status !== 401 || !original || original._retry || isRefreshRequest(original.url)) {
      return Promise.reject(error);
    }

    const admin = isAdminRequest(original);
    original._retry = true;
    const accessToken = await refreshAccessToken(admin);
    if (accessToken) {
      original.headers = original.headers ?? {};
      original.headers.Authorization = `Bearer ${accessToken}`;
      return apiClient.request(original);
    }

    if (admin) useAuthStore.getState().adminLogout();
    else useAuthStore.getState().logout();
    if (!original.suppressAuthRedirect && typeof window !== 'undefined') {
      window.location.assign(admin ? '/admin/login' : '/login');
    }
    return Promise.reject(error);
  },
);

export function getApiErrorMessage(error: unknown, fallback = 'Something went wrong. Please try again.'): string {
  if (axios.isAxiosError<ApiFailure>(error)) return error.response?.data?.message ?? error.message ?? fallback;
  return error instanceof Error ? error.message : fallback;
}
