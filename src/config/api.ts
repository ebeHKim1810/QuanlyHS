/**
 * Centralized API Configuration
 * Supports both same-origin Vercel deployment (default) and external backend deployment via VITE_API_URL.
 */

// Read and sanitize VITE_API_URL from environment
const rawEnvUrl = (import.meta.env.VITE_API_URL || '').trim();

function sanitizeBaseUrl(url: string): string {
  if (!url || url === 'undefined' || url === 'null' || url === '/') {
    return '';
  }
  // Remove trailing slashes
  return url.replace(/\/+$/, '');
}

export const API_BASE_URL: string = sanitizeBaseUrl(rawEnvUrl);

/**
 * Returns a clean, normalized URL for any API endpoint.
 * Prevents:
 * - undefined/api/...
 * - null/api/...
 * - duplicated /api/api/...
 * - double slashes
 */
export function getApiEndpoint(path: string): string {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;

  if (!API_BASE_URL) {
    return normalizedPath;
  }

  // If API_BASE_URL already ends with /api and normalizedPath starts with /api
  if (API_BASE_URL.endsWith('/api') && normalizedPath.startsWith('/api')) {
    return `${API_BASE_URL}${normalizedPath.slice(4)}`;
  }

  return `${API_BASE_URL}${normalizedPath}`;
}
