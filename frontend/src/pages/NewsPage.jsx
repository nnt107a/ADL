import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import PageHeader from '../components/PageHeader';
import PageSEO from '../components/PageSEO';
import LoadingState from '../components/LoadingState';
import ErrorState from '../components/ErrorState';
import LazyImage from '../components/LazyImage';
import ArticleSearchBar from '../components/ArticleSearchBar';
import Pagination from '../components/Pagination';
import useApiResource from '../hooks/useApiResource';
import useAdminSession from '../hooks/useAdminSession';
import useArticleSearch from '../hooks/useArticleSearch';
import { useLocale } from '../context/LocaleContext';
import { pageBackdrops, pageHeaderThemes } from '../data/pageAssets';
import { resolveImageUrl } from '../utils/imageUrl';

const PAGE_SIZE = 6;

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

  const { query, setQuery, results: searchResults } = useArticleSearch(items);
  const [currentPage, setCurrentPage] = useState(1);

  // Reset to page 1 when search changes
  const displayItems = searchResults;
  const totalItems = displayItems.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / PAGE_SIZE));
  const safePage = Math.min(currentPage, totalPages);
  const paginatedItems = useMemo(
    () => displayItems.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE),
    [displayItems, safePage]
  );

  function handlePageChange(newPage) {
    setCurrentPage(newPage);
    // Scroll to top of grid
    const section = document.querySelector('.section.section-alt');
    if (section) {
      section.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  function handleSearch(value) {
    setQuery(value);
    setCurrentPage(1);
  }

  return (
    <>
      <PageSEO
        title={page.title || 'News & Updates'}
        description={page.summary || 'Stay up to date with the latest news, announcements, and updates from AD Legal.'}
        url="https://adlegal.vn/news"
        locale={locale}
      />
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
            <>
              <div className="container">
                <div className="filter-panel filter-panel--search-only">
                  <div className="filter-panel__header">
                    <div className="filter-panel__title-group">
                      <p className="content-label">{page.title || 'News & Updates'}</p>
                      {query && typeof totalItems === 'number' ? (
                        <span className="filter-panel__result-badge">
                          {totalItems} {totalItems === 1 ? 'article' : 'articles'}
                        </span>
                      ) : null}
                    </div>

                    <div className="filter-panel__controls">
                      <ArticleSearchBar
                        value={query}
                        onChange={handleSearch}
                        placeholder={page.searchPlaceholder || 'Search news...'}
                        className="filter-panel__search"
                      />
                      {query ? (
                        <button type="button" className="filter-panel__clear" onClick={() => handleSearch('')}>
                          Reset
                        </button>
                      ) : null}
                    </div>
                  </div>
                </div>
              </div>

              {paginatedItems.length > 0 ? (
                <>
                  <div className="container cards-grid insights-grid">
                    {paginatedItems.map((item) => (
                      <article className="insight-card" key={item._id}>
                        <div className="insight-meta">
                          <time>{formatPublishedAt(item.publishedAt)}</time>
                        </div>
                        {item.imageUrl ? (
                          <Link to={`/news/${item.slug}`} className="insight-card-image">
                            <LazyImage src={resolveImageUrl(item.imageUrl)} alt={item.title || ''} />
                          </Link>
                        ) : null}
                        <h3>
                          <Link to={`/news/${item.slug}`} className="insight-card-title-link">
                            {item.title}
                          </Link>
                        </h3>
                        <p>{item.excerpt}</p>
                        <Link to={`/news/${item.slug}`} className="insight-card-readmore">
                          {page.readMore || 'Read more'}
                        </Link>
                      </article>
                    ))}
                  </div>

                  <div className="container">
                    <Pagination
                      currentPage={safePage}
                      totalItems={totalItems}
                      pageSize={PAGE_SIZE}
                      onPageChange={handlePageChange}
                    />
                  </div>
                </>
              ) : (
                <div className="container state-panel">
                  <p className="state-label">{page.noMatchTitle || 'No matching news'}</p>
                  <p className="state-copy">{page.noMatchCopy || 'Try a different search term.'}</p>
                </div>
              )}
            </>
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
