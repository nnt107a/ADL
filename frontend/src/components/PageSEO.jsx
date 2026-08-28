import { Helmet } from 'react-helmet-async';

const SITE_NAME = 'AD Legal';
const SITE_URL = 'https://adlegal.vn';
const DEFAULT_IMAGE = `${SITE_URL}/adl-logo.png`;

/**
 * PageSEO — Inject <head> meta tags and JSON-LD structured data per page.
 *
 * @param {string}  title        - Page title (will be suffixed with " | AD Legal")
 * @param {string}  description  - Meta description / og:description
 * @param {string}  [image]      - Absolute URL to an OG image (cover photo)
 * @param {string}  [url]        - Canonical page URL (defaults to SITE_URL)
 * @param {string[]}[keywords]   - List of keyword strings
 * @param {'website'|'article'}  [type='website'] - og:type
 * @param {string}  [publishedAt] - ISO date string for articles
 * @param {string}  [locale='en'] - Page language locale
 */
export default function PageSEO({
  title,
  description,
  image,
  url,
  keywords = [],
  type = 'website',
  publishedAt,
  locale = 'en',
}) {
  const resolvedTitle = title
    ? `${title} | ${SITE_NAME}`
    : `${SITE_NAME} - Law, Finance & More`;
  const resolvedDescription =
    description ||
    'AD Legal is a multi-disciplinary legal and financial advisory firm in Vietnam, providing integrated legal, tax, and finance solutions to businesses.';
  const resolvedImage = image || DEFAULT_IMAGE;
  const resolvedUrl = url || SITE_URL;
  const keywordString = keywords.filter(Boolean).join(', ');

  const ogLocale =
    locale === 'vi' ? 'vi_VN' : locale === 'cn' ? 'zh_CN' : 'en_US';
  const htmlLang =
    locale === 'vi' ? 'vi' : locale === 'cn' ? 'zh' : 'en';

  const jsonLd =
    type === 'article'
      ? {
          '@context': 'https://schema.org',
          '@type': 'Article',
          headline: title,
          description: resolvedDescription,
          image: resolvedImage,
          url: resolvedUrl,
          datePublished: publishedAt || undefined,
          author: {
            '@type': 'Organization',
            name: SITE_NAME,
            url: SITE_URL,
          },
          publisher: {
            '@type': 'Organization',
            name: SITE_NAME,
            url: SITE_URL,
            logo: {
              '@type': 'ImageObject',
              url: DEFAULT_IMAGE,
            },
          },
          mainEntityOfPage: {
            '@type': 'WebPage',
            '@id': resolvedUrl,
          },
        }
      : {
          '@context': 'https://schema.org',
          '@type': 'LegalService',
          name: SITE_NAME,
          url: SITE_URL,
          logo: DEFAULT_IMAGE,
          description: resolvedDescription,
          address: {
            '@type': 'PostalAddress',
            streetAddress: '428/4 Hoang Ngan Street, Phu Dinh Ward',
            addressLocality: 'Ho Chi Minh City',
            addressCountry: 'VN',
          },
          contactPoint: {
            '@type': 'ContactPoint',
            telephone: '+84-87-844-7664',
            email: 'counsel@adlegal.vn',
            contactType: 'customer service',
          },
        };

  return (
    <Helmet>
      <html lang={htmlLang} />
      <title>{resolvedTitle}</title>
      <meta name="description" content={resolvedDescription} />
      {keywordString ? <meta name="keywords" content={keywordString} /> : null}
      <link rel="canonical" href={resolvedUrl} />
      <link rel="icon" type="image/png" href="/adl-logo.png" />
      <link rel="shortcut icon" type="image/png" href="/adl-logo.png" />
      <link rel="apple-touch-icon" href="/adl-logo.png" />

      {/* Open Graph */}
      <meta property="og:type" content={type} />
      <meta property="og:site_name" content={SITE_NAME} />
      <meta property="og:title" content={resolvedTitle} />
      <meta property="og:description" content={resolvedDescription} />
      <meta property="og:image" content={resolvedImage} />
      <meta property="og:url" content={resolvedUrl} />
      <meta property="og:locale" content={ogLocale} />

      {/* Twitter / X card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={resolvedTitle} />
      <meta name="twitter:description" content={resolvedDescription} />
      <meta name="twitter:image" content={resolvedImage} />

      {/* Article-specific tags */}
      {type === 'article' && publishedAt ? (
        <meta property="article:published_time" content={publishedAt} />
      ) : null}
      {type === 'article' ? (
        <meta property="article:author" content={SITE_NAME} />
      ) : null}

      {/* JSON-LD Structured Data */}
      <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
    </Helmet>
  );
}
