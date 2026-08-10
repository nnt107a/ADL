import { useMemo, useState } from 'react';
import PageHeader from '../components/PageHeader';
import PageSEO from '../components/PageSEO';
import { Link } from 'react-router-dom';
import LoadingState from '../components/LoadingState';
import ErrorState from '../components/ErrorState';
import LazyImage from '../components/LazyImage';
import ArticleSearchBar from '../components/ArticleSearchBar';
import Pagination from '../components/Pagination';
import FilterChips from '../components/FilterChips';
import useApiResource from '../hooks/useApiResource';
import useAdminSession from '../hooks/useAdminSession';
import useArticleSearch from '../hooks/useArticleSearch';
import { useLocale } from '../context/LocaleContext';
import { pageBackdrops, pageHeaderThemes } from '../data/pageAssets';
import { getServiceLabel, getServiceOptions, normalizeServiceSelections } from '../utils/serviceFilters';
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

export default function KnowledgePage() {
  const { isAdmin, checking } = useAdminSession();
  const { copy, locale } = useLocale();
  const page = copy.pages.knowledge;
  const [selectedFilters, setSelectedFilters] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const { data: articles, loading, error } = useApiResource(`/api/insights?lang=${locale}`, {
    initialData: [],
  });
  const serviceOptions = useMemo(() => getServiceOptions(copy.data.services), [copy.data.services]);

  const filterOptions = useMemo(() => {
    const counts = new Map();

    for (const article of articles) {
      const articleFilters = normalizeServiceSelections(article?.filters || [], copy.data.services);

      for (const filter of articleFilters) {
        counts.set(filter, (counts.get(filter) || 0) + 1);
      }
    }

    return serviceOptions
      .map((service) => ({
        value: service.value,
        label: service.label,
        count: counts.get(service.value) || 0,
      }))
      .sort((a, b) => a.label.localeCompare(b.label));
  }, [articles, copy.data.services, serviceOptions]);

  const filteredArticles = useMemo(() => {
    if (selectedFilters.length === 0) {
      return articles;
    }

    const selectedKeys = new Set(normalizeServiceSelections(selectedFilters, copy.data.services));

    return articles.filter((article) => {
      const articleFilters = normalizeServiceSelections(article?.filters || [], copy.data.services);
      return articleFilters.some((filter) => selectedKeys.has(filter));
    });
  }, [articles, selectedFilters, copy.data.services]);

  const { query, setQuery, results: searchResults } = useArticleSearch(filteredArticles);

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
    const section = document.querySelector('.section.section-alt');
    if (section) {
      section.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  function handleSearch(value) {
    setQuery(value);
    setCurrentPage(1);
  }

  function handleFilterChange(newFilters) {
    setSelectedFilters(newFilters);
    setCurrentPage(1);
  }

  return (
    <>
      <PageSEO
        title={page.title || 'Insights & Legal Knowledge'}
        description={page.summary || 'Explore AD Legal\'s legal insights, expert analysis, and knowledge articles on Vietnamese law, finance, and business.'}
        url="https://adlegal.vn/insight"
        locale={locale}
      />
      <PageHeader
        kicker={page.kicker}
        title={page.title}
        summary={page.summary}
        featured
        backdropImage={pageBackdrops.insight}
        {...pageHeaderThemes.insight}
        kickerColor = 'white'
        titleColor = 'white'
        summaryColor = 'white'
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
            <>
              <div className="container">
                <FilterChips
                  title={page.filterTitle || 'Filter insights'}
                  items={filterOptions}
                  selectedValues={selectedFilters}
                  onChange={handleFilterChange}
                  allLabel={page.filterAll || 'All insights'}
                  emptyLabel={page.filterEmpty || 'No filters available yet'}
                  searchQuery={query}
                  onSearchChange={handleSearch}
                  searchPlaceholder={page.searchPlaceholder || 'Search insights...'}
                  resultCount={totalItems}
                />
              </div>

              {paginatedItems.length > 0 ? (
                <>
                  <div className="container cards-grid insights-grid">
                    {paginatedItems.map((article) => (
                      <article className="insight-card" key={article._id}>
                        <div className="insight-meta">
                          <time>{formatPublishedAt(article.publishedAt)}</time>
                        </div>
                        {article.imageUrl ? (
                          <div className="insight-card-image">
                            <LazyImage src={resolveImageUrl(article.imageUrl)} alt={article.title || ''} />
                          </div>
                        ) : null}
                        <h3>{article.title}</h3>
                        <p>{article.excerpt}</p>
                        <Link to={`/insight/${article.slug}`}>{page.readMore}</Link>
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
                  <p className="state-label">{page.noMatchTitle || 'No matching insights'}</p>
                  <p className="state-copy">{page.noMatchCopy || 'Try clearing one or more filters to see more articles.'}</p>
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
