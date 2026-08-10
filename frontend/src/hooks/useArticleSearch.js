import { useMemo, useRef, useState } from 'react';

/**
 * Normalize a string for fast fuzzy matching: lowercase, collapse whitespace,
 * remove diacritics (Vietnamese tone marks, Chinese chars pass through as-is).
 */
function normalize(str) {
  return String(str || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\u0111/g, 'd')
    .replace(/\u0110/g, 'd')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Custom hook for fast multi-language article search with debounce.
 *
 * Searches across all translation fields (en/vi/cn) for title and excerpt,
 * so a query in any language will find matching articles regardless of the
 * active locale.
 *
 * @param {Array} articles - The full list of articles from API
 * @param {{ debounceMs?: number }} options
 * @returns {{ query: string, setQuery: Function, results: Array }}
 */
export default function useArticleSearch(articles, { debounceMs = 150 } = {}) {
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const timerRef = useRef(null);

  function handleQueryChange(newQuery) {
    setQuery(newQuery);

    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }

    timerRef.current = setTimeout(() => {
      setDebouncedQuery(newQuery);
    }, debounceMs);
  }

  // Pre-compute normalized searchable text for every article (memoized on articles array ref)
  const searchIndex = useMemo(() => {
    return articles.map((article) => {
      const fields = [
        article.title,
        article.excerpt,
        article.translations?.en?.title,
        article.translations?.en?.excerpt,
        article.translations?.vi?.title,
        article.translations?.vi?.excerpt,
        article.translations?.cn?.title,
        article.translations?.cn?.excerpt,
      ];

      const searchableText = normalize(fields.filter(Boolean).join(' '));
      return { article, searchableText };
    });
  }, [articles]);

  const results = useMemo(() => {
    const normalizedQuery = normalize(debouncedQuery);

    if (!normalizedQuery) {
      return articles;
    }

    // Split query into individual tokens for AND-matching
    const tokens = normalizedQuery.split(/\s+/).filter(Boolean);

    if (tokens.length === 0) {
      return articles;
    }

    return searchIndex
      .filter(({ searchableText }) => tokens.every((token) => searchableText.includes(token)))
      .map(({ article }) => article);
  }, [articles, debouncedQuery, searchIndex]);

  return { query, setQuery: handleQueryChange, results };
}
