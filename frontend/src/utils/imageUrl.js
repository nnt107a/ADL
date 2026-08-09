/**
 * Resolves and normalizes image URLs across the application.
 * Handles relative paths (/uploads/news/...), missing leading slashes,
 * data URLs, external web links, and VITE_API_URL for production.
 */
export function resolveImageUrl(url) {
  if (!url || typeof url !== 'string') {
    return '';
  }

  const trimmed = url.trim();

  if (!trimmed) {
    return '';
  }

  // Direct protocol / data URLs / blob URLs
  if (
    trimmed.startsWith('http://') ||
    trimmed.startsWith('https://') ||
    trimmed.startsWith('data:') ||
    trimmed.startsWith('blob:')
  ) {
    return trimmed;
  }

  const apiBase = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '');

  // Upload paths
  if (trimmed.startsWith('/uploads')) {
    return apiBase ? `${apiBase}${trimmed}` : trimmed;
  }

  if (trimmed.startsWith('uploads/')) {
    return apiBase ? `${apiBase}/${trimmed}` : `/${trimmed}`;
  }

  // Local static assets (e.g., /people/duong.png)
  if (trimmed.startsWith('/')) {
    return trimmed;
  }

  return `/${trimmed}`;
}

