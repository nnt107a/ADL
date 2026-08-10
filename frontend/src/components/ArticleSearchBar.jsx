export default function ArticleSearchBar({
  value = '',
  onChange,
  placeholder = 'Search articles...',
  resultCount,
  totalCount,
  className = '',
}) {
  return (
    <div className={`article-search-bar ${className}`.trim()}>
      <div className="article-search-input-wrapper">
        <svg
          className="article-search-icon"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
        <input
          type="search"
          className="article-search-input"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          aria-label={placeholder}
          autoComplete="off"
          spellCheck="false"
        />
        {value ? (
          <button
            type="button"
            className="article-search-clear"
            onClick={() => onChange('')}
            aria-label="Clear search"
          >
            ✕
          </button>
        ) : null}
      </div>

      {value && typeof resultCount === 'number' ? (
        <p className="article-search-count">
          {resultCount} of {totalCount} {totalCount === 1 ? 'result' : 'results'}
        </p>
      ) : null}
    </div>
  );
}
