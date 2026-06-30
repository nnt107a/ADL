import { Fragment } from 'react';
import { Link, useParams } from 'react-router-dom';
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

function renderTextWithLineBreaks(text) {
  const lines = String(text || '').split('\n');

  return (
    <p className="state-copy">
      {lines.map((line, index) => (
        <Fragment key={`${index}-${line.slice(0, 12)}`}>
          {line}
          {index < lines.length - 1 ? <br /> : null}
        </Fragment>
      ))}
    </p>
  );
}

function renderContentWithImageToken(content, imageUrl) {
  const parts = String(content || '').split('{{image}}');

  if (parts.length === 1) {
    return renderTextWithLineBreaks(content);
  }

  return parts.map((part, index) => (
    <Fragment key={`${index}-${part.slice(0, 10)}`}>
      {renderTextWithLineBreaks(part)}
      {index < parts.length - 1 && imageUrl ? (
        <img src={imageUrl} alt="" />
      ) : null}
    </Fragment>
  ));
}

function looksLikeHtml(value) {
  const text = String(value || '').trim();
  return Boolean(text) && /<\s*\w+[^>]*>/.test(text);
}

export default function NewsDetailPage() {
  const { slug } = useParams();
  const { data: item, loading, error } = useApiResource(slug ? `/api/news/${slug}` : '', {
    initialData: null,
    enabled: Boolean(slug),
  });

  return (
    <>
      <PageHeader
        kicker="News"
        title={item?.title || 'News item'}
        summary={
          item?.publishedAt
            ? `Published ${formatPublishedAt(item.publishedAt)}`
            : 'News items are served from the backend API.'
        }
      >
        <Link className="card-link" to="/news">
          Back to news
        </Link>
      </PageHeader>

      <section className="section section-light reveal">
        {loading ? <LoadingState label="Loading news item" /> : null}
        {error ? <ErrorState title="Unable to load news" message={error} /> : null}

        {!loading && !error && item ? (
          <div className="container value-stack">
            <article className="content-card">
              <p className="content-label">{item.type || 'News'}</p>
              {item.excerpt ? <p className="state-copy">{item.excerpt}</p> : null}

              {item.imageUrl && !String(item.content || '').includes('{{image}}') ? (
                <img src={item.imageUrl} alt="" />
              ) : null}

              {item.content ? (
                looksLikeHtml(item.content) ? (
                  <div className="news-content" dangerouslySetInnerHTML={{ __html: item.content }} />
                ) : (
                  renderContentWithImageToken(item.content, item.imageUrl)
                )
              ) : null}

              {!item.content && item.contentFileUrl ? (
                <p className="state-copy">This update is provided as an attached file.</p>
              ) : null}

              {item.contentFileUrl ? (
                <p className="state-copy">
                  <a className="card-link" href={item.contentFileUrl} target="_blank" rel="noreferrer">
                    Open attached file{item.contentFileName ? `: ${item.contentFileName}` : ''}
                  </a>
                </p>
              ) : null}
            </article>
          </div>
        ) : null}
      </section>
    </>
  );
}
