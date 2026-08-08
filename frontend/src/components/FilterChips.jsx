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
}) {
  const normalizedItems = items.map(normalizeFilterItem).filter((item) => item.value);
  const selectedSet = new Set(selectedValues.map((value) => String(value).trim().toLowerCase()).filter(Boolean));
  const hasSelection = selectedSet.size > 0;

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
  }

  return (
    <section className={`filter-panel ${className}`.trim()} aria-label={title}>
      <div className="filter-panel__header">
        <div>
          <p className="content-label">{title}</p>
        </div>
        {hasSelection ? (
          <button type="button" className="filter-panel__clear" onClick={clearAll}>
            Clear
          </button>
        ) : null}
      </div>

      {normalizedItems.length > 0 ? (
        <div className="filter-chip-grid" role="group" aria-label={title}>
          <button
            type="button"
            className={!hasSelection ? 'filter-chip is-active' : 'filter-chip'}
            onClick={clearAll}
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
