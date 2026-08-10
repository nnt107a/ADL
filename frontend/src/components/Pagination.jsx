import { useMemo } from 'react';

/**
 * Floating Pill Pagination Bar component.
 * Displays clean text navigation, page numbers with an active circle indicator,
 * and a results summary on the right.
 */
export default function Pagination({
  currentPage = 1,
  totalItems = 0,
  pageSize = 6,
  onPageChange,
  className = '',
  itemLabel = 'articles',
}) {
  const totalPages = useMemo(() => Math.max(1, Math.ceil(totalItems / pageSize)), [totalItems, pageSize]);

  if (totalPages <= 1) {
    return null;
  }

  const startItem = (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(totalItems, currentPage * pageSize);

  const pages = useMemo(() => {
    const result = [];
    const maxVisible = 7;

    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) {
        result.push(i);
      }
      return result;
    }

    result.push(1);

    let start = Math.max(2, currentPage - 1);
    let end = Math.min(totalPages - 1, currentPage + 1);

    if (currentPage <= 3) {
      end = Math.min(5, totalPages - 1);
    }
    if (currentPage >= totalPages - 2) {
      start = Math.max(2, totalPages - 4);
    }

    if (start > 2) {
      result.push('...');
    }

    for (let i = start; i <= end; i++) {
      result.push(i);
    }

    if (end < totalPages - 1) {
      result.push('...');
    }

    result.push(totalPages);

    return result;
  }, [currentPage, totalPages]);

  return (
    <nav className={`pagination-pill-bar ${className}`.trim()} aria-label="Page navigation">
      <div className="pagination-controls">
        <button
          type="button"
          className="pagination-nav-btn pagination-prev"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage <= 1}
          aria-label="Previous page"
        >
          <span className="pagination-chevron" aria-hidden="true">‹</span> Previous
        </button>

        <div className="pagination-numbers">
          {pages.map((page, index) =>
            page === '...' ? (
              <span className="pagination-ellipsis" key={`ellipsis-${index}`}>
                ...
              </span>
            ) : (
              <button
                type="button"
                key={page}
                className={`pagination-num ${page === currentPage ? 'is-active' : ''}`}
                onClick={() => onPageChange(page)}
                aria-current={page === currentPage ? 'page' : undefined}
                aria-label={`Page ${page}`}
              >
                {page}
              </button>
            )
          )}
        </div>

        <button
          type="button"
          className="pagination-nav-btn pagination-next"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage >= totalPages}
          aria-label="Next page"
        >
          Next <span className="pagination-chevron" aria-hidden="true">›</span>
        </button>
      </div>

      <div className="pagination-summary">
        Showing {startItem}–{endItem} of {totalItems} {itemLabel}
      </div>
    </nav>
  );
}
