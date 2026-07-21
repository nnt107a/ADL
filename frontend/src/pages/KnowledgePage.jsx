import PageHeader from '../components/PageHeader';
import { Link } from 'react-router-dom';
import LoadingState from '../components/LoadingState';
import ErrorState from '../components/ErrorState';
import useApiResource from '../hooks/useApiResource';
import useAdminSession from '../hooks/useAdminSession';

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
  const { data: articles, loading, error } = useApiResource('/api/insights', {
    initialData: [],
  });

  return (
    <>
      <PageHeader
        kicker="Insight"
        title="Short reads with practical takeaways."
        summary="Timely legal insights to help you make informed business decisions."
      >
        {checking ? null : isAdmin ? (
          <div className="page-header-action">
            <Link className="page-header-admin-link page-header-admin-link-edit" to="/insight/add">
              Add insight
            </Link>
          </div>
        ) : null}
      </PageHeader>

      <section className="section section-alt reveal">
        {loading ? <LoadingState label="Loading insights" /> : null}
        {error ? <ErrorState title="Unable to load insights" message={error} /> : null}

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
                  <Link to={`/insight/${article.slug}`}>Read more</Link>
                </article>
              ))}
            </div>
          ) : (
            <div className="container state-panel">
              <p className="state-label">No insights yet</p>
              <p className="state-copy">Published insight articles will appear here.</p>
            </div>
          )
        ) : null}
      </section>
    </>
  );
}
