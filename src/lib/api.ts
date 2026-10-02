/**
 * Thin client for the Django REST backend.
 *
 * - Base URL comes from VITE_API_BASE_URL (defaults to the local Django dev server).
 * - JWT access/refresh tokens live in localStorage; a 401 triggers one refresh attempt
 *   before the session is treated as expired.
 * - DRF validation errors are flattened into ApiError.fieldErrors so forms can show them inline.
 */

export const API_BASE_URL = (
  (import.meta.env["VITE_API_BASE_URL"] as string | undefined) ?? "http://127.0.0.1:8000"
).replace(/\/$/, "");

const ACCESS_KEY = "scholaris_access";
const REFRESH_KEY = "scholaris_refresh";

const isBrowser = typeof window !== "undefined";

export const tokens = {
  get access() {
    return isBrowser ? window.localStorage.getItem(ACCESS_KEY) : null;
  },
  get refresh() {
    return isBrowser ? window.localStorage.getItem(REFRESH_KEY) : null;
  },
  set(access: string, refresh?: string) {
    if (!isBrowser) return;
    window.localStorage.setItem(ACCESS_KEY, access);
    if (refresh) window.localStorage.setItem(REFRESH_KEY, refresh);
  },
  clear() {
    if (!isBrowser) return;
    window.localStorage.removeItem(ACCESS_KEY);
    window.localStorage.removeItem(REFRESH_KEY);
  },
};

export class ApiError extends Error {
  status: number;
  fieldErrors: Record<string, string>;

  constructor(status: number, message: string, fieldErrors: Record<string, string> = {}) {
    super(message);
    this.status = status;
    this.fieldErrors = fieldErrors;
  }
}

/** Listeners notified when the session can no longer be refreshed. */
const expiryListeners = new Set<() => void>();
export function onSessionExpired(listener: () => void) {
  expiryListeners.add(listener);
  return () => {
    expiryListeners.delete(listener);
  };
}

function flatten(value: unknown): string {
  if (Array.isArray(value)) return value.map(flatten).join(" ");
  if (value && typeof value === "object") return Object.values(value).map(flatten).join(" ");
  return String(value ?? "");
}

async function toApiError(response: Response): Promise<ApiError> {
  let body: unknown = null;
  try {
    body = await response.json();
  } catch {
    // Non-JSON error page (e.g. a Django 500 in debug mode).
  }
  const fieldErrors: Record<string, string> = {};
  let message = `Request failed (${response.status})`;
  if (body && typeof body === "object" && !Array.isArray(body)) {
    const record = body as Record<string, unknown>;
    for (const [key, value] of Object.entries(record)) {
      if (key === "detail" || key === "non_field_errors") continue;
      fieldErrors[key] = flatten(value);
    }
    if (record["detail"]) message = flatten(record["detail"]);
    else if (record["non_field_errors"]) message = flatten(record["non_field_errors"]);
    else if (Object.keys(fieldErrors).length) {
      message = Object.entries(fieldErrors)
        .map(([key, value]) => `${key.replace(/_/g, " ")}: ${value}`)
        .join(" ");
    }
  } else if (Array.isArray(body)) {
    message = flatten(body);
  }
  return new ApiError(response.status, message, fieldErrors);
}

let refreshing: Promise<boolean> | null = null;

async function refreshAccessToken(): Promise<boolean> {
  const refresh = tokens.refresh;
  if (!refresh) return false;
  refreshing ??= (async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/accounts/auth/refresh/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refresh }),
      });
      if (!response.ok) return false;
      const data = (await response.json()) as { access: string; refresh?: string };
      tokens.set(data.access, data.refresh);
      return true;
    } catch {
      return false;
    } finally {
      refreshing = null;
    }
  })();
  return refreshing;
}

type RequestOptions = {
  method?: string;
  body?: unknown;
  auth?: boolean;
};

export async function api<T = unknown>(path: string, options: RequestOptions = {}): Promise<T> {
  const { method = "GET", body, auth = true } = options;
  const url = path.startsWith("http") ? path : `${API_BASE_URL}${path}`;

  // FormData (file uploads) is sent as multipart; the browser sets its Content-Type.
  const multipart = typeof FormData !== "undefined" && body instanceof FormData;
  const send = () => {
    const headers: Record<string, string> = { Accept: "application/json" };
    if (body !== undefined && !multipart) headers["Content-Type"] = "application/json";
    if (auth && tokens.access) headers["Authorization"] = `Bearer ${tokens.access}`;
    return fetch(url, {
      method,
      headers,
      ...(body === undefined ? {} : { body: multipart ? (body as FormData) : JSON.stringify(body) }),
    });
  };

  let response: Response;
  try {
    response = await send();
  } catch {
    throw new ApiError(0, `Cannot reach the API at ${API_BASE_URL}. Is the backend running?`);
  }

  if (response.status === 401 && auth && tokens.refresh) {
    if (await refreshAccessToken()) {
      response = await send();
    }
  }

  if (response.status === 401 && auth) {
    tokens.clear();
    expiryListeners.forEach((listener) => listener());
  }

  if (!response.ok) throw await toApiError(response);
  if (response.status === 204) return undefined as T;
  return (await response.json()) as T;
}

type Page<T> = { count: number; next: string | null; results: T[] };

/** Fetch every row of a (possibly paginated) DRF list endpoint, capped at `max` rows. */
export async function listAll<T>(path: string, max = 1000): Promise<T[]> {
  const first = await api<Page<T> | T[]>(path);
  if (Array.isArray(first)) return first;
  const rows = [...first.results];
  let next = first.next;
  while (next && rows.length < max) {
    const page = await api<Page<T>>(next);
    rows.push(...page.results);
    next = page.next;
  }
  return rows;
}
