/**
 * Resolves and normalizes image URLs across the application.
 * Handles relative paths (/uploads/news/...), missing leading slashes,
 * data URLs, and external web links.
 */
export function resolveImageUrl(url) {
  if (!url || typeof url !== 'string') {
    return '';
  }

  const trimmed = url.trim();

  if (!trimmed) {
    return '';
  }

  // Direct protocol / data URLs
  if (
    trimmed.startsWith('http://') ||
    trimmed.startsWith('https://') ||
    trimmed.startsWith('data:') ||
    trimmed.startsWith('blob:')
  ) {
    return trimmed;
  }

  // Upload paths
  if (trimmed.startsWith('/uploads')) {
    return trimmed;
  }

  if (trimmed.startsWith('uploads/')) {
    return `/${trimmed}`;
  }

  // Local assets (e.g., /people/duong.png)
  if (trimmed.startsWith('/')) {
    return trimmed;
  }

  return `/${trimmed}`;
}
