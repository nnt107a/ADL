import { useEffect, useState } from 'react';

const apiCache = new Map();

export default function useApiResource(url, { initialData = null, enabled = true } = {}) {
  const cached = apiCache.get(url);
  const [data, setData] = useState(cached !== undefined ? cached : initialData);
  const [loading, setLoading] = useState(Boolean(enabled) && cached === undefined);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!enabled || !url) {
      return undefined;
    }

    const controller = new AbortController();

    async function load() {
      try {
        if (!apiCache.has(url)) {
          setLoading(true);
        }
        setError('');

        const response = await fetch(url, { signal: controller.signal });

        if (!response.ok) {
          throw new Error(`Request failed with status ${response.status}`);
        }

        const payload = await response.json();

        if (!controller.signal.aborted) {
          apiCache.set(url, payload);
          setData(payload);
        }
      } catch (fetchError) {
        if (fetchError.name !== 'AbortError') {
          setError(fetchError.message || 'Failed to load data.');
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }

    load();

    return () => controller.abort();
  }, [enabled, url]);

  return { data, loading, error };
}

