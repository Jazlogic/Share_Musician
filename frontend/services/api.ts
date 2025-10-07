// const BASE_URL = 'http://localhost:3001';
const BASE_URL:string = 'http://172.20.10.5:3001';
// export const BASE_URL = 'http://192.168.56.130:3001';
// export const BASE_URL = 'http://192.168.100.101:3001';

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
  const response = await fetch(`${BASE_URL}${url}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
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
};
