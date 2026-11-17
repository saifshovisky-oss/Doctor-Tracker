import { toQueryString } from '@/lib/utils';

const API_URL = (process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000/api/v1').replace(/\/$/, '');

export const apiUrl = API_URL;

/** Absolute URL for an entity's stored photo. Append `?v=updatedAt` to bust the
 *  browser cache when the photo changes. */
export function photoUrl(kind: 'doctors' | 'patients', id: string, version?: string): string {
  const v = version ? `?v=${encodeURIComponent(version)}` : '';
  return `${API_URL}/${kind}/${encodeURIComponent(id)}/photo${v}`;
}

export class ApiClientError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly details?: Record<string, string>,
  ) {
    super(message);
    this.name = 'ApiClientError';
  }
}

interface RequestOptions extends Omit<RequestInit, 'body'> {
  body?: unknown;
  query?: Record<string, string | number | undefined | null>;
}

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { body, query, headers, ...rest } = options;
  const url = `${API_URL}${path}${query ? toQueryString(query) : ''}`;

  let response: Response;
  try {
    response = await fetch(url, {
      ...rest,
      credentials: 'include',
      headers: {
        ...(body !== undefined ? { 'Content-Type': 'application/json' } : {}),
        ...headers,
      },
      ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
    });
  } catch {
    throw new ApiClientError('Unable to reach the server. Check your connection and try again.', 0);
  }

  type ApiPayload = { success?: boolean; data?: T; error?: { message?: string; details?: Record<string, string> } };
  let payload: ApiPayload | null = null;
  try {
    payload = (await response.json()) as ApiPayload;
  } catch {
    // Empty body (e.g. 204) is acceptable for mutations that return nothing.
  }

  if (!response.ok) {
    throw new ApiClientError(
      payload?.error?.message ?? `Request failed with status ${response.status}`,
      response.status,
      payload?.error?.details,
    );
  }

  return (payload?.data ?? payload) as T;
}

async function uploadRequest<T>(path: string, file: File): Promise<T> {
  const form = new FormData();
  form.append('photo', file);

  let response: Response;
  try {
    response = await fetch(`${API_URL}${path}`, {
      method: 'POST',
      credentials: 'include',
      // No Content-Type header: the browser sets the multipart boundary automatically.
      body: form,
    });
  } catch {
    throw new ApiClientError('Unable to reach the server. Check your connection and try again.', 0);
  }

  type ApiPayload = { success?: boolean; data?: T; error?: { message?: string; details?: Record<string, string> } };
  let payload: ApiPayload | null = null;
  try {
    payload = (await response.json()) as ApiPayload;
  } catch {
    // Empty body is acceptable for mutations that return nothing.
  }

  if (!response.ok) {
    throw new ApiClientError(
      payload?.error?.message ?? `Request failed with status ${response.status}`,
      response.status,
      payload?.error?.details,
    );
  }

  return (payload?.data ?? payload) as T;
}

export const api = {
  get: <T>(path: string, query?: RequestOptions['query']) => request<T>(path, { method: 'GET', query }),
  post: <T>(path: string, body?: unknown) => request<T>(path, { method: 'POST', body }),
  patch: <T>(path: string, body?: unknown) => request<T>(path, { method: 'PATCH', body }),
  delete: <T>(path: string) => request<T>(path, { method: 'DELETE' }),
  upload: <T>(path: string, file: File) => uploadRequest<T>(path, file),
};
