import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { getSiteContent, LOCALES, DEFAULT_LOCALE } from '../data/siteContent';

const STORAGE_KEY = 'adl-locale';

const LocaleContext = createContext(null);

function readInitialLocale() {
  if (typeof window === 'undefined') {
    return DEFAULT_LOCALE;
  }

  const stored = window.localStorage.getItem(STORAGE_KEY);

  if (LOCALES.includes(stored)) {
    return stored;
  }

  return DEFAULT_LOCALE;
}

export function LocaleProvider({ children }) {
  const [locale, setLocale] = useState(readInitialLocale);

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, locale);
    document.documentElement.lang = locale;
  }, [locale]);

  const value = useMemo(() => {
    const copy = getSiteContent(locale);

    return {
      locale,
      setLocale,
      copy,
      isVietnamese: locale === 'vi',
      toggleLocale: () => {
        setLocale((current) => (current === 'vi' ? 'en' : 'vi'));
      },
    };
  }, [locale]);

  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>;
}

export function useLocale() {
  const context = useContext(LocaleContext);

  if (!context) {
    throw new Error('useLocale must be used within a LocaleProvider');
  }

  return context;
}
