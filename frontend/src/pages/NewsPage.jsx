import { Link, useNavigate } from 'react-router-dom';
import PageHeader from '../components/PageHeader';
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

export default function NewsPage() {
  const navigate = useNavigate();
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
      >
        {checking ? null : isAdmin ? (
          <div className="page-header-action">
            <Link className="page-header-admin-link page-header-admin-link-edit" to="/news/add">
              {page.add}
            </Link>
          </div>
        ) : null}
      </PageHeader>

      <section className="section section-light reveal">
        {loading ? <LoadingState label={page.loading} /> : null}
        {error ? <ErrorState title={page.error} message={error} /> : null}

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
                  {item.publishedAt ? <p className="state-copy">{`${page.publishedPrefix} ${formatPublishedAt(item.publishedAt)}`}</p> : null}
                  <p>{item.excerpt}</p>
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
