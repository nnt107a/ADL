export default function PageHeader({
  kicker,
  title,
  summary,
  children,
  rightAlignedSummary = false,
  featured = false,
  backdropClassName = '',
  titleClassName = '',
}) {
  return (
    <header className={`section page-header ${featured ? 'page-header--feature' : ''}`.trim()}>
      {featured ? (
        <div
          className={`page-header-backdrop ${backdropClassName}`.trim()}
          aria-hidden="true"
        />
      ) : null}
      <div className="container">
        <p className="section-kicker" style={{ color: '#006797', fontSize: 'clamp(1.5rem, 2vw, 1.75rem)' }}>
          {kicker}
        </p>

        <div className="page-header-grid">
          {title ? (
            <div className="page-header-left">
              <h1 className={`page-title ${titleClassName}`.trim()}>{title}</h1>
            </div>
          ) : (
            <div className="page-header-left" />
          )}

          <div className={`page-summary-wrap ${rightAlignedSummary ? 'page-summary-wrap--right' : ''}`}>
            <p className="section-lead">{summary}</p>
            {children}
          </div>
        </div>
      </div>
    </header>
  );
}
