import { Fragment, useRef, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import PageHeader from '../components/PageHeader';
import PageSEO from '../components/PageSEO';
import LoadingState from '../components/LoadingState';
import ErrorState from '../components/ErrorState';
import useApiResource from '../hooks/useApiResource';
import useAdminSession from '../hooks/useAdminSession';
import useLazyContentImages from '../hooks/useLazyContentImages';
import { useLocale } from '../context/LocaleContext';
import { lazyLoadHtmlImages, resolveImageUrl } from '../utils/imageUrl';

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

  const resolvedUrl = resolveImageUrl(imageUrl);

  return parts.map((part, index) => (
    <Fragment key={`${index}-${part.slice(0, 10)}`}>
      {renderTextWithLineBreaks(part)}
      {index < parts.length - 1 && resolvedUrl ? <img src={resolvedUrl} alt="" /> : null}
    </Fragment>
  ));
}

function looksLikeHtml(value) {
  const text = String(value || '').trim();
  return Boolean(text) && /<\s*\w+[^>]*>/.test(text);
}

export default function NewsDetailPage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { isAdmin } = useAdminSession();
  const { copy, locale } = useLocale();
  const page = copy.pages.newsDetail;
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState('');
  const { data: item, loading, error } = useApiResource(slug ? `/api/news/${slug}?lang=${locale}` : '', {
    initialData: null,
    enabled: Boolean(slug),
  });

  const contentRef = useRef(null);
  useLazyContentImages(contentRef, item?.content);

  async function handleDelete() {
    if (!slug) {
      return;
    }

    const confirmed = window.confirm(`Delete "${item?.title || 'this news item'}"? ${copy.ui.deleteThis}`);

    if (!confirmed) {
      return;
    }

    try {
      setDeleting(true);
      setDeleteError('');

      const response = await fetch(`/api/admin/news/${slug}`, {
        method: 'DELETE',
        credentials: 'same-origin',
      });

      const body = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(body?.message || `Request failed with status ${response.status}`);
      }

      navigate('/news');
    } catch (deleteFailure) {
      setDeleteError(deleteFailure.message || 'Failed to delete news item.');
    } finally {
      setDeleting(false);
    }
  }

  return (
    <>
      <PageSEO
        title={item?.title}
        description={item?.excerpt}
        image={item?.imageUrl ? resolveImageUrl(item.imageUrl) : undefined}
        url={`https://adlegal.vn/news/${slug}`}
        type="article"
        publishedAt={item?.publishedAt}
        locale={locale}
      />
      <PageHeader
        kicker={page.kicker}
        summary={item?.publishedAt ? `${page.publishedPrefix} ${formatPublishedAt(item.publishedAt)}` : page.apiSummary}
        rightAlignedSummary={true}
      >
        <div className="page-header-action page-header-action-detail">
          <Link className="page-header-back-link" to="/news">
            ← {page.backToList}
          </Link>
          {slug && isAdmin ? (
            <div className="page-header-admin-actions">
              <Link
                className="page-header-admin-link page-header-admin-link-edit"
                to={`/news/edit?slug=${encodeURIComponent(slug)}`}
              >
                {page.edit}
              </Link>
              <button
                className="page-header-admin-link page-header-admin-link-delete"
                type="button"
                onClick={handleDelete}
                disabled={deleting}
              >
                {deleting ? page.deleting : page.delete}
              </button>
            </div>
          ) : null}
          {deleteError ? <p className="form-feedback">{deleteError}</p> : null}
        </div>
      </PageHeader>

      <section className="section section-light reveal">
        {loading ? <LoadingState label={page.loading} /> : null}
        {error ? <ErrorState title={page.error} message={error} /> : null}

        {!loading && !error && item ? (
          <div className="container value-stack">
            <article className="content-card">
              <h1 className="news-detail-title">{item.title}</h1>

              {item.content ? (
                looksLikeHtml(item.content) ? (
                  <div ref={contentRef} className="news-content" dangerouslySetInnerHTML={{ __html: lazyLoadHtmlImages(item.content) }} />
                ) : (
                  renderContentWithImageToken(item.content, item.imageUrl)
                )
              ) : null}

              {!item.content && item.contentFileUrl ? <p className="state-copy">{page.attachedFile}</p> : null}

              {item.contentFileUrl ? (
                <p className="state-copy">
                  <a
                    className="page-header-admin-link page-header-admin-link-edit"
                    href={item.contentFileUrl}
                    target="_blank"
                    rel="noreferrer"
                  >
                    {page.openFilePrefix}
                    {item.contentFileName ? `: ${item.contentFileName}` : ''}
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
