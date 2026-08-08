const SUPPORTED_LOCALES = ['en', 'vi', 'cn'];
const DEFAULT_LOCALE = 'en';

function normalizeLocale(value) {
  const locale = String(value || '').toLowerCase();
  return SUPPORTED_LOCALES.includes(locale) ? locale : DEFAULT_LOCALE;
}

function cleanText(value) {
  return String(value ?? '').trim();
}

function readLocalizedFields(source = {}, existing = {}, locale = DEFAULT_LOCALE) {
  const suffix = locale === 'en' ? '_en' : `_${locale}`;
  const fallbackLocale = 'en';
  const fallbackSuffix = '_en';

  const read = (fieldName) => {
    const localizedKey = `${fieldName}${suffix}`;
    const fallbackKey = `${fieldName}${fallbackSuffix}`;

    if (source[localizedKey] !== undefined) {
      return cleanText(source[localizedKey]);
    }

    if (locale === 'en' && source[fieldName] !== undefined) {
      return cleanText(source[fieldName]);
    }

    if (existing?.translations?.[locale]?.[fieldName] !== undefined) {
      return cleanText(existing.translations[locale][fieldName]);
    }

    if (locale === 'en' && existing?.[fieldName] !== undefined) {
      return cleanText(existing[fieldName]);
    }

    if (source[fallbackKey] !== undefined) {
      return cleanText(source[fallbackKey]);
    }

    if (existing?.translations?.[fallbackLocale]?.[fieldName] !== undefined) {
      return cleanText(existing.translations[fallbackLocale][fieldName]);
    }

    return '';
  };

  return {
    title: read('title'),
    excerpt: read('excerpt'),
    content: read('content'),
    contentFileUrl: read('contentFileUrl'),
    contentFileName: read('contentFileName'),
  };
}

function buildTranslations(source = {}, existing = {}) {
  return SUPPORTED_LOCALES.reduce((acc, locale) => {
    acc[locale] = readLocalizedFields(source, existing, locale);
    return acc;
  }, {});
}

function resolveArticleForLocale(article = {}, locale = DEFAULT_LOCALE) {
  const translations = {
    en: {
      title: cleanText(article?.translations?.en?.title ?? article.title),
      excerpt: cleanText(article?.translations?.en?.excerpt ?? article.excerpt),
      content: cleanText(article?.translations?.en?.content ?? article.content),
      contentFileUrl: cleanText(article?.translations?.en?.contentFileUrl ?? article.contentFileUrl),
      contentFileName: cleanText(article?.translations?.en?.contentFileName ?? article.contentFileName),
    },
    vi: {
      title: cleanText(article?.translations?.vi?.title),
      excerpt: cleanText(article?.translations?.vi?.excerpt),
      content: cleanText(article?.translations?.vi?.content),
      contentFileUrl: cleanText(article?.translations?.vi?.contentFileUrl),
      contentFileName: cleanText(article?.translations?.vi?.contentFileName),
    },
    cn: {
      title: cleanText(article?.translations?.cn?.title),
      excerpt: cleanText(article?.translations?.cn?.excerpt),
      content: cleanText(article?.translations?.cn?.content),
      contentFileUrl: cleanText(article?.translations?.cn?.contentFileUrl),
      contentFileName: cleanText(article?.translations?.cn?.contentFileName),
    },
  };

  const requested = translations[normalizeLocale(locale)] || translations.en;
  const fallback = (translations.en.title || translations.en.content) ? translations.en : (translations.vi.title || translations.vi.content) ? translations.vi : translations.cn;
  const resolved = {
    title: requested.title || fallback.title,
    excerpt: requested.excerpt || fallback.excerpt,
    content: requested.content || fallback.content,
    contentFileUrl: requested.contentFileUrl || fallback.contentFileUrl,
    contentFileName: requested.contentFileName || fallback.contentFileName,
  };

  return {
    ...article,
    ...resolved,
    filters: Array.isArray(article?.filters) ? article.filters : [],
    translations,
  };
}

function getArticleLocaleFromRequest(req) {
  return normalizeLocale(req?.query?.lang);
}

export {
  DEFAULT_LOCALE,
  SUPPORTED_LOCALES,
  buildTranslations,
  cleanText,
  getArticleLocaleFromRequest,
  normalizeLocale,
  resolveArticleForLocale,
};
