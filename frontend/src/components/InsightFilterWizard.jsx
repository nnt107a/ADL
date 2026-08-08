import { getServiceOptions, normalizeServiceSelections } from '../utils/serviceFilters';

export default function InsightFilterWizard({
  label = 'Insight services',
  description = 'Choose the services that best match this insight. The list comes from the site service catalog, so new services appear automatically.',
  services = [],
  selectedValues = [],
  onChange,
}) {
  const options = getServiceOptions(services);
  const selectedSet = new Set(normalizeServiceSelections(selectedValues, services));

  function toggle(value) {
    if (typeof onChange !== 'function') {
      return;
    }

    const nextSelected = new Set(selectedSet);

    if (nextSelected.has(value)) {
      nextSelected.delete(value);
    } else {
      nextSelected.add(value);
    }

    onChange(Array.from(nextSelected));
  }

  function clearAll() {
    if (typeof onChange === 'function') {
      onChange([]);
    }
  }

  return (
    <div className="field filter-wizard">
      <span>{label}</span>
      <p className="state-copy">{description}</p>

      {options.length > 0 ? (
        <>
          <div className="filter-panel__header filter-panel__header--compact">
            <p className="state-copy">Select from the service list below.</p>
            {selectedSet.size > 0 ? (
              <button type="button" className="filter-panel__clear" onClick={clearAll}>
                Clear
              </button>
            ) : null}
          </div>
          <div className="filter-chip-grid filter-chip-grid--editor" role="group" aria-label={label}>
            {options.map((option) => {
              const isActive = selectedSet.has(option.value);

              return (
                <button
                  key={option.value}
                  type="button"
                  className={isActive ? 'filter-chip is-active' : 'filter-chip'}
                  onClick={() => toggle(option.value)}
                  aria-pressed={isActive}
                >
                  <span>{option.label}</span>
                </button>
              );
            })}
          </div>
        </>
      ) : (
        <p className="state-copy">No services are available yet.</p>
      )}
    </div>
  );
}
