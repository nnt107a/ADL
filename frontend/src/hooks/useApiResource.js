import { useEffect, useState } from 'react';

export default function useApiResource(url, { initialData = null, enabled = true } = {}) {
  const [data, setData] = useState(initialData);
  const [loading, setLoading] = useState(Boolean(enabled));
  const [error, setError] = useState('');

  useEffect(() => {
    if (!enabled || !url) {
      return undefined;
    }

    const controller = new AbortController();

    async function load() {
      try {
        setLoading(true);
        setError('');

        const response = await fetch(url, { signal: controller.signal });

        if (!response.ok) {
          throw new Error(`Request failed with status ${response.status}`);
        }

        const payload = await response.json();

        if (!controller.signal.aborted) {
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
