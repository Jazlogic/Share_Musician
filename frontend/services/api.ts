import Constants from 'expo-constants';
import AsyncStorage from '@react-native-async-storage/async-storage';

function resolveBaseUrl(): string {
  // Highest priority: public env var (Expo)
  const envUrl = process.env.EXPO_PUBLIC_API_URL;
  if (envUrl && typeof envUrl === 'string' && envUrl.trim().length > 0) {
    console.log('3. envUrl:', envUrl);
    return envUrl.trim();
  }

  // Try to infer LAN host from Expo hostUri/debuggerHost
  const hostUri = (Constants as any)?.expoConfig?.hostUri || (Constants as any)?.manifest?.debuggerHost;
  console.log('2. hostUri:', hostUri);
  if (typeof hostUri === 'string') {
    const host = hostUri.split(':')[0];
    if (host) {
      console.log('host:', host);
      return `http://${host}:3001`;
    }
  }

  // Fallback to localhost 
  return 'http://localhost:3001';
}

export const BASE_URL = resolveBaseUrl() || 'http://192.168.56.17:3001';
console.log('1. BASE_URL:', BASE_URL);
interface RequestOptions extends RequestInit {
  headers?: Record<string, string>;
}

export interface ApiResponse<T> {
  status: number;
  data: T;
}

export interface User {
  name: string;
  user_id?: string;
  profilekey?: string | null;
}

export interface MessageResponse {
  message: string;
  user?: User;
  token?: string;
  profilekey?: string;
}

async function request<T>(url: string, options?: RequestOptions): Promise<ApiResponse<T>> {
  console.log('request url:', `${BASE_URL}${url}`);
  const userToken = await AsyncStorage.getItem('userToken');
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options?.headers || {}),
  };

  if (userToken) {
    headers['Authorization'] = `Bearer ${userToken}`;
  }

  const response = await fetch(`${BASE_URL}${url}`, {
    ...options,
    headers,
  });

  const data: T = await response.json();

  if (!response.ok) {
    throw new Error((data as any).message || 'Something went wrong');
  }

  return { status: response.status, data };
}

async function uploadRequest<T>(url: string, formData: FormData, options?: RequestOptions): Promise<ApiResponse<T>> {
  const response = await fetch(`${BASE_URL}${url}`, {
    ...options,
    method: 'POST',
    body: formData,
    headers: {
      ...options?.headers,
    },
  });

  const data: T = await response.json();

  if (!response.ok) {
    throw new Error((data as any).message || 'Something went wrong');
  }

  return { status: response.status, data };
}

export const api = {
  get: <T>(url: string, options?: RequestOptions) => request<T>(url, { ...options, method: 'GET' }),
  post: <T>(url: string, data: any, options?: RequestOptions) =>
    request<T>(url, { ...options, method: 'POST', body: JSON.stringify(data) }),
  put: <T>(url: string, data: any, options?: RequestOptions) =>
    request<T>(url, { ...options, method: 'PUT', body: JSON.stringify(data) }),
  delete: <T>(url: string, options?: RequestOptions) => request<T>(url, { ...options, method: 'DELETE' }),
  upload: <T>(url: string, formData: FormData, options?: RequestOptions) =>
    uploadRequest<T>(url, formData, { ...options, method: 'POST' }),
  
  // Request endpoints
  getRequestById: <T>(id: string, options?: RequestOptions) => api.get<T>(`/request/${id}`, options),
  getEventTypes: <T>(options?: RequestOptions) => api.get<T>('/request/event-types', options),
  getInstruments: <T>(options?: RequestOptions) => api.get<T>('/request/instruments', options),
  getCreatedRequests: <T>(options?: RequestOptions) => api.get<T>('/request/created', options),
  createRequest: <T>(data: any, options?: RequestOptions) => api.post<T>('/request', data, options),
  updateRequestStatus: <T>(id: string, data: { status: string; cancellation_reason?: string }, options?: RequestOptions) => 
    api.put<T>(`/request/${id}/status`, data, options),
  
  // Offer endpoints
  createOffer: <T>(data: { request_id: string; price: number; message: string }, options?: RequestOptions) => 
    api.post<T>('/offer', data, options),
  getOfferById: <T>(id: string, options?: RequestOptions) => api.get<T>(`/offer/${id}`, options),
  acceptOffer: <T>(id: string, options?: RequestOptions) => api.post<T>(`/offer/${id}/accept`, {}, options),
  rejectOffer: <T>(id: string, options?: RequestOptions) => api.post<T>(`/offer/${id}/reject`, {}, options),
  getOffersByRequest: <T>(requestId: string, options?: RequestOptions) => 
    api.get<T>(`/offer/request/${requestId}`, options),
  
  // Auth endpoints
  login: <T>(data: { email: string; password: string }, options?: RequestOptions) => 
    api.post<T>('/auth/login', data, options),
  register: <T>(data: { name: string; email: string; phone: string; role: string }, options?: RequestOptions) => 
    api.post<T>('/auth/register', data, options),
  verifyEmail: <T>(data: { email: string; pin: string }, options?: RequestOptions) => 
    api.post<T>('/auth/verify-email', data, options),
  setPassword: <T>(data: { email: string; password: string }, options?: RequestOptions) => 
    api.post<T>('/auth/set-password', data, options),
  requestPasswordReset: <T>(data: { email: string }, options?: RequestOptions) => 
    api.post<T>('/auth/request-password-reset', data, options),
  verifyResetCode: <T>(data: { email: string; resetCode: string }, options?: RequestOptions) => 
    api.post<T>('/auth/verify-reset-code', data, options),
  resetPassword: <T>(data: { email: string; resetCode: string; newPassword: string }, options?: RequestOptions) => 
    api.post<T>('/auth/reset-password', data, options),
};
