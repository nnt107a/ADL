/**
 * Resolves and normalizes image URLs across the application.
 * Handles relative paths (/uploads/news/...), missing leading slashes,
 * data URLs, external web links, localhost URLs, and VITE_API_URL for production.
 */
export function resolveImageUrl(url) {
  if (!url || typeof url !== 'string') {
    return '';
  }

  const trimmed = url.trim();

  if (!trimmed) {
    return '';
  }

  // Strip local development server hostnames (localhost / 127.0.0.1) so uploaded
  // asset paths can resolve correctly on public/production builds.
  const normalized = trimmed.replace(/^http:\/\/(localhost|127\.0\.0\.1):(4000|5173)/i, '');

  // Direct protocol / data URLs / blob URLs
  if (
    normalized.startsWith('http://') ||
    normalized.startsWith('https://') ||
    normalized.startsWith('data:') ||
    normalized.startsWith('blob:')
  ) {
    return normalized;
  }

  const apiBase = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '');

  // Upload paths
  if (normalized.startsWith('/uploads')) {
    return apiBase ? `${apiBase}${normalized}` : normalized;
  }

  if (normalized.startsWith('uploads/')) {
    return apiBase ? `${apiBase}/${normalized}` : `/${normalized}`;
  }

  // Local static assets (e.g., /people/duong.png)
  if (normalized.startsWith('/')) {
    return normalized;
  }

  return `/${normalized}`;
}

/**
 * Processes raw article HTML content to resolve all <img src="..."> URLs
 * so images inserted in the rich text editor display correctly across local,
 * staging, and production environments.
 */
export function resolveHtmlContent(html) {
  if (!html || typeof html !== 'string') {
    return '';
  }

  return html.replace(/<img\s+([^>]*?)src=["']([^"']+)["']([^>]*?)>/gi, (match, before, src, after) => {
    const resolvedSrc = resolveImageUrl(src);
    return `<img ${before}src="${resolvedSrc}"${after}>`;
  });
}


