import { Link, useNavigate, useParams } from 'react-router-dom';
import { useState } from 'react';
import PageHeader from '../components/PageHeader';
import LoadingState from '../components/LoadingState';
import ErrorState from '../components/ErrorState';
import useApiResource from '../hooks/useApiResource';
import useAdminSession from '../hooks/useAdminSession';
import { useLocale } from '../context/LocaleContext';
import { getServiceLabel, normalizeServiceSelections } from '../utils/serviceFilters';

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

export default function InsightDetailPage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { isAdmin } = useAdminSession();
  const { copy, locale } = useLocale();
  const page = copy.pages.insightDetail;
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState('');
  const { data: item, loading, error } = useApiResource(slug ? `/api/insights/${slug}?lang=${locale}` : '', {
    initialData: null,
    enabled: Boolean(slug),
  });
  const serviceSelections = normalizeServiceSelections(item?.filters || [], copy.data.services);

  async function handleDelete() {
    if (!slug) {
      return;
    }

    const confirmed = window.confirm(`Delete "${item?.title || 'this insight article'}"? ${copy.ui.deleteThis}`);

    if (!confirmed) {
      return;
    }

    try {
      setDeleting(true);
      setDeleteError('');

      const response = await fetch(`/api/admin/insights/${slug}`, {
        method: 'DELETE',
        credentials: 'same-origin',
      });

      const body = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(body?.message || `Request failed with status ${response.status}`);
      }

      navigate('/insight');
    } catch (deleteFailure) {
      setDeleteError(deleteFailure.message || 'Failed to delete insight article.');
    } finally {
      setDeleting(false);
    }
  }

  return (
    <>
      <PageHeader
        kicker={page.kicker}
        title={item?.title || page.titleFallback}
        summary={item?.publishedAt ? `${page.publishedPrefix} ${formatPublishedAt(item.publishedAt)}` : page.apiSummary}
        rightAlignedSummary={true}
      >
        <div className="page-header-action page-header-action-detail">
          <Link className="page-header-back-link" to="/insight">
            ← {page.backToList}
          </Link>
          {slug && isAdmin ? (
            <div className="page-header-admin-actions">
              <Link
                className="page-header-admin-link page-header-admin-link-edit"
                to={`/insight/edit?slug=${encodeURIComponent(slug)}`}
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
              <p className="content-label">{item.type || 'Insight'}</p>
              {item.excerpt ? <p className="state-copy">{item.excerpt}</p> : null}
              {serviceSelections.length > 0 ? (
                <div className="insight-detail-filters" aria-label="Insight filters">
                  {serviceSelections.map((filter) => (
                    <span className="insight-card-filter" key={`${item._id || item.slug}-${filter}`}>
                      {getServiceLabel(filter, copy.data.services)}
                    </span>
                  ))}
                </div>
              ) : null}

              {item.imageUrl ? <img src={item.imageUrl} alt="" /> : null}

              {item.content ? <div className="news-content" dangerouslySetInnerHTML={{ __html: item.content }} /> : null}
            </article>
          </div>
        ) : null}
      </section>
    </>
  );
}
