import ArticleSearchBar from './ArticleSearchBar';

function normalizeFilterItem(item) {
  if (typeof item === 'string') {
    return { value: item, label: item, count: 0 };
  }

  return {
    value: String(item?.value ?? item?.label ?? '').trim(),
    label: String(item?.label ?? item?.value ?? '').trim(),
    count: Number(item?.count ?? 0) || 0,
  };
}

export default function FilterChips({
  title = 'Filters',
  items = [],
  selectedValues = [],
  onChange,
  allLabel = 'All',
  emptyLabel = 'No filters available yet',
  className = '',
  searchQuery = '',
  onSearchChange,
  searchPlaceholder = 'Search...',
  resultCount,
}) {
  const normalizedItems = items.map(normalizeFilterItem).filter((item) => item.value);
  const selectedSet = new Set(selectedValues.map((value) => String(value).trim().toLowerCase()).filter(Boolean));
  const hasSelection = selectedSet.size > 0;
  const hasSearch = Boolean(searchQuery);

  function toggle(value) {
    if (typeof onChange !== 'function') {
      return;
    }

    const normalizedValue = String(value).trim();
    const key = normalizedValue.toLowerCase();

    if (!normalizedValue) {
      return;
    }

    if (selectedSet.has(key)) {
      onChange(selectedValues.filter((current) => String(current).trim().toLowerCase() !== key));
      return;
    }

    onChange([...selectedValues, normalizedValue]);
  }

  function clearAll() {
    if (typeof onChange === 'function') {
      onChange([]);
    }
    if (typeof onSearchChange === 'function') {
      onSearchChange('');
    }
  }

  return (
    <section className={`filter-panel ${className}`.trim()} aria-label={title}>
      <div className="filter-panel__header">
        <div className="filter-panel__title-group">
          <p className="content-label">{title}</p>
          {(hasSelection || hasSearch) && typeof resultCount === 'number' ? (
            <span className="filter-panel__result-badge">
              {resultCount} {resultCount === 1 ? 'article' : 'articles'}
            </span>
          ) : null}
        </div>

        <div className="filter-panel__controls">
          {typeof onSearchChange === 'function' ? (
            <ArticleSearchBar
              value={searchQuery}
              onChange={onSearchChange}
              placeholder={searchPlaceholder}
              className="filter-panel__search"
            />
          ) : null}

          {hasSelection || hasSearch ? (
            <button type="button" className="filter-panel__clear" onClick={clearAll}>
              Reset filters
            </button>
          ) : null}
        </div>
      </div>

      {normalizedItems.length > 0 ? (
        <div className="filter-chip-grid" role="group" aria-label={title}>
          <button
            type="button"
            className={!hasSelection ? 'filter-chip is-active' : 'filter-chip'}
            onClick={() => typeof onChange === 'function' && onChange([])}
          >
            {allLabel}
          </button>

          {normalizedItems.map((item) => {
            const isActive = selectedSet.has(item.value.toLowerCase());

            return (
              <button
                key={item.value}
                type="button"
                className={isActive ? 'filter-chip is-active' : 'filter-chip'}
                onClick={() => toggle(item.value)}
                aria-pressed={isActive}
              >
                <span>{item.label}</span>
                {item.count > 0 ? <span className="filter-chip__count">{item.count}</span> : null}
              </button>
            );
          })}
        </div>
      ) : (
        <p className="state-copy">{emptyLabel}</p>
      )}
    </section>
  );
}
