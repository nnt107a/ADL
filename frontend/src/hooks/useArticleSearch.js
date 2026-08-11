import { useMemo, useRef, useState } from 'react';

/**
 * Normalize a string for fast fuzzy matching: lowercase, collapse whitespace,
 * remove diacritics (Vietnamese tone marks, Chinese chars pass through as-is).
 */
function normalize(str) {
  if (str === null || str === undefined) {
    return '';
  }

  return String(str)
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
export default function useArticleSearch(articles = [], { debounceMs = 150 } = {}) {
  const safeArticles = Array.isArray(articles) ? articles : [];
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const timerRef = useRef(null);

  function handleQueryChange(newQuery) {
    const nextQuery = String(newQuery ?? '');
    setQuery(nextQuery);

    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }

    timerRef.current = setTimeout(() => {
      setDebouncedQuery(nextQuery);
    }, debounceMs);
  }

  // Pre-compute normalized searchable text for every article (memoized on articles array ref)
  const searchIndex = useMemo(() => {
    return safeArticles.map((article) => {
      if (!article) {
        return { article, searchableText: '' };
      }

      const fields = [
        typeof article.title === 'string' ? article.title : '',
        typeof article.excerpt === 'string' ? article.excerpt : '',
        typeof article.translations?.en?.title === 'string' ? article.translations.en.title : '',
        typeof article.translations?.en?.excerpt === 'string' ? article.translations.en.excerpt : '',
        typeof article.translations?.vi?.title === 'string' ? article.translations.vi.title : '',
        typeof article.translations?.vi?.excerpt === 'string' ? article.translations.vi.excerpt : '',
        typeof article.translations?.cn?.title === 'string' ? article.translations.cn.title : '',
        typeof article.translations?.cn?.excerpt === 'string' ? article.translations.cn.excerpt : '',
      ];

      const searchableText = normalize(fields.filter(Boolean).join(' '));
      return { article, searchableText };
    });
  }, [safeArticles]);

  const results = useMemo(() => {
    const normalizedQuery = normalize(debouncedQuery);

    if (!normalizedQuery) {
      return safeArticles;
    }

    // Split query into individual tokens for AND-matching
    const tokens = normalizedQuery.split(/\s+/).filter(Boolean);

    if (tokens.length === 0) {
      return safeArticles;
    }

    return searchIndex
      .filter(({ article, searchableText }) => article && tokens.every((token) => searchableText.includes(token)))
      .map(({ article }) => article);
  }, [safeArticles, debouncedQuery, searchIndex]);

  return { query, setQuery: handleQueryChange, results };
}

