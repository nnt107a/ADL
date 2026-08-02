import PageHeader from '../components/PageHeader';
import { Link } from 'react-router-dom';
import LoadingState from '../components/LoadingState';
import ErrorState from '../components/ErrorState';
import useApiResource from '../hooks/useApiResource';
import useAdminSession from '../hooks/useAdminSession';
import { useLocale } from '../context/LocaleContext';

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

export default function KnowledgePage() {
  const { isAdmin, checking } = useAdminSession();
  const { copy, locale } = useLocale();
  const page = copy.pages.knowledge;
  const { data: articles, loading, error } = useApiResource(`/api/insights?lang=${locale}`, {
    initialData: [],
  });

  return (
    <>
      <PageHeader
        kicker={page.kicker}
        title={page.title}
        summary={page.summary}
        featured
      >
        {checking ? null : isAdmin ? (
          <div className="page-header-action">
            <Link className="page-header-admin-link page-header-admin-link-edit" to="/insight/add">
              {page.add}
            </Link>
          </div>
        ) : null}
      </PageHeader>

      <section className="section section-alt reveal">
        {loading ? <LoadingState label={page.loading} /> : null}
        {error ? <ErrorState title={page.error} message={error} /> : null}

        {!loading && !error ? (
          articles.length > 0 ? (
            <div className="container cards-grid insights-grid">
              {articles.map((article) => (
                <article className="insight-card" key={article._id}>
                  <div className="insight-meta">
                    <span>{article.type || 'Insight'}</span>
                    <time>{formatPublishedAt(article.publishedAt)}</time>
                  </div>
                  <h3>{article.title}</h3>
                  <p>{article.excerpt}</p>
                  <Link to={`/insight/${article.slug}`}>{page.readMore}</Link>
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
