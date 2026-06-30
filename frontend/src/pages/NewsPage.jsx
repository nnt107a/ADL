import { useNavigate } from 'react-router-dom';
import PageHeader from '../components/PageHeader';
import LoadingState from '../components/LoadingState';
import ErrorState from '../components/ErrorState';
import useApiResource from '../hooks/useApiResource';

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
  const navigate = useNavigate();
  const { data: items, loading, error } = useApiResource('/api/news', {
    initialData: [],
  });

  return (
    <>
      <PageHeader
        kicker="News"
        title="Latest updates"
        summary="News items are stored in MongoDB and served from the backend API."
      />

      <section className="section section-light reveal">
        {loading ? <LoadingState label="Loading news" /> : null}
        {error ? <ErrorState title="Unable to load news" message={error} /> : null}

        {!loading && !error ? (
          items.length > 0 ? (
            <div className="container value-stack">
              {items.map((item) => (
                <article
                  className="content-card"
                  key={item._id}
                  role="link"
                  tabIndex={0}
                  onClick={() => navigate(`/news/${item.slug}`)}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter' || event.key === ' ') {
                      event.preventDefault();
                      navigate(`/news/${item.slug}`);
                    }
                  }}
                >
                  <p className="content-label">{item.type || 'News'}</p>
                  <h3>{item.title}</h3>
                  {item.publishedAt ? (
                    <p className="state-copy">Published {formatPublishedAt(item.publishedAt)}</p>
                  ) : null}
                  <p>{item.excerpt}</p>
                </article>
              ))}
            </div>
          ) : (
            <div className="container state-panel">
              <p className="state-label">No news yet</p>
              <p className="state-copy">Create a news item via the admin endpoint to see it here.</p>
            </div>
          )
        ) : null}
      </section>
    </>
  );
}
