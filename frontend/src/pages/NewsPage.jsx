import { Link } from 'react-router-dom';
import PageHeader from '../components/PageHeader';
import LoadingState from '../components/LoadingState';
import ErrorState from '../components/ErrorState';
import useApiResource from '../hooks/useApiResource';
import useAdminSession from '../hooks/useAdminSession';
import { useLocale } from '../context/LocaleContext';
import { pageBackdrops, pageHeaderThemes } from '../data/pageAssets';
import { resolveImageUrl } from '../utils/imageUrl';

function formatPublishedAt(value) {
  if (!value) {
    return '';
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return '';
  }

  return date.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export default function NewsPage() {
  const { isAdmin, checking } = useAdminSession();
  const { copy, locale } = useLocale();
  const page = copy.pages.news;
  const listUrl = `/api/news?lang=${locale}`;
  const { data: items, loading, error } = useApiResource(listUrl, {
    initialData: [],
  });

  return (
    <>
      <PageHeader
        kicker={page.kicker}
        title={page.title}
        summary={page.summary}
        featured
        backdropImage={pageBackdrops.news}
        {...pageHeaderThemes.news}
        kickerColor = 'white'
        titleColor = 'white'
        summaryColor = 'white'
      >
        {checking ? null : isAdmin ? (
          <div className="page-header-action">
            <Link className="page-header-admin-link page-header-admin-link-edit" to="/news/add">
              {page.add}
            </Link>
          </div>
        ) : null}
      </PageHeader>

      <section className="section section-alt reveal">
        {loading ? <LoadingState label={page.loading} /> : null}
        {error ? <ErrorState title={page.error} message={error} /> : null}

        {!loading && !error ? (
          items.length > 0 ? (
            <div className="container cards-grid insights-grid">
              {items.map((item) => (
                <article className="insight-card" key={item._id}>
                  <div className="insight-meta">
                    <time>{formatPublishedAt(item.publishedAt)}</time>
                  </div>
                  {item.imageUrl ? (
                    <div className="insight-card-image">
                      <img src={resolveImageUrl(item.imageUrl)} alt="" />
                    </div>
                  ) : null}
                  <h3>{item.title}</h3>
                  <p>{item.excerpt}</p>
                  <Link to={`/news/${item.slug}`}>{page.readMore || 'Read more'}</Link>
                </article>
              ))}
            </div>
          ) : (
            <div className="container state-panel">
              <p className="state-label">{page.emptyTitle}</p>
              <p className="state-copy">{page.emptyCopy}</p>
            </div>
          )
        ) : null}
      </section>
    </>
  );
}
