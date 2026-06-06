import { useAppStore } from './store';

class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
    this.name = 'ApiError';
  }
}

function getHeaders(): Record<string, string> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  const token = useAppStore.getState().token;
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

function handleResponse<T>(response: Response): Promise<T> {
  if (response.status === 401) {
    useAppStore.getState().logout();
    throw new ApiError('Unauthorized', 401);
  }
  if (!response.ok) {
    return response.text().then((text) => {
      try {
        const err = JSON.parse(text);
        throw new ApiError(err.message || err.error || 'Request failed', response.status);
      } catch (e) {
        if (e instanceof ApiError) throw e;
        throw new ApiError(`Request failed (${response.status})`, response.status);
      }
    });
  }
  return response.json();
}

export async function apiGet<T>(path: string): Promise<T> {
  const response = await fetch(path, {
    method: 'GET',
    headers: getHeaders(),
  });
  return handleResponse<T>(response);
}

export async function apiPost<T>(path: string, body?: unknown): Promise<T> {
  const response = await fetch(path, {
    method: 'POST',
    headers: getHeaders(),
    body: body ? JSON.stringify(body) : undefined,
  });
  return handleResponse<T>(response);
}

export async function apiPut<T>(path: string, body?: unknown): Promise<T> {
  const response = await fetch(path, {
    method: 'PUT',
    headers: getHeaders(),
    body: body ? JSON.stringify(body) : undefined,
  });
  return handleResponse<T>(response);
}

export async function apiDelete<T>(path: string): Promise<T> {
  const response = await fetch(path, {
    method: 'DELETE',
    headers: getHeaders(),
  });
  return handleResponse<T>(response);
}

export { ApiError };
