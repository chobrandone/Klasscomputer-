/**
 * Browser-side API base. May be a relative path ("/api") when the frontend
 * proxies to the backend via Next.js rewrites (e.g. on Vercel).
 */
export const API_URL =
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002';

/**
 * Server-side (RSC) API base — must be an absolute URL. When API_URL is
 * relative, set API_INTERNAL_URL to the backend's real address.
 */
const SERVER_API_URL =
  process.env.API_INTERNAL_URL ||
  (API_URL.startsWith('http') ? API_URL : 'http://localhost:3002');

class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

async function parseError(res: Response) {
  try {
    const data = await res.json();
    const message = Array.isArray(data.message) ? data.message[0] : data.message;
    return new ApiError(message || res.statusText, res.status);
  } catch {
    return new ApiError(res.statusText, res.status);
  }
}

/**
 * Client-side fetch with cookies + automatic token refresh on 401.
 */
export async function api<T = any>(
  path: string,
  options: RequestInit & { retry?: boolean } = {},
): Promise<T> {
  const { retry = true, ...init } = options;
  const res = await fetch(`${API_URL}${path}`, {
    credentials: 'include',
    headers: {
      ...(init.body && !(init.body instanceof FormData)
        ? { 'Content-Type': 'application/json' }
        : {}),
      ...init.headers,
    },
    ...init,
  });

  if (res.status === 401 && retry && !path.startsWith('/auth/')) {
    const refreshed = await fetch(`${API_URL}/auth/refresh`, {
      method: 'POST',
      credentials: 'include',
    });
    if (refreshed.ok) {
      return api<T>(path, { ...options, retry: false });
    }
  }

  if (!res.ok) throw await parseError(res);
  if (res.status === 204) return undefined as T;
  return res.json();
}

/**
 * Server-side fetch (RSC) with ISR revalidation. Public data only.
 */
export async function serverApi<T = any>(
  path: string,
  revalidate = 60,
): Promise<T | null> {
  try {
    const res = await fetch(`${SERVER_API_URL}${path}`, { next: { revalidate } });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}
