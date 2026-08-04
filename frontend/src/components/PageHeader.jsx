export default function PageHeader({
  kicker,
  title,
  summary,
  children,
  rightAlignedSummary = false,
  featured = false,
  backdropImage = '',
  backdropClassName = '',
  titleClassName = '',
}) {
  const hasTitle = !!title;

  return (
    <header
      className={`section page-header ${featured ? 'page-header--feature' : ''}`.trim()}
    >
      {featured ? (
        <div
          className={`page-header-backdrop ${backdropClassName}`.trim()}
          style={
            backdropImage
              ? {
                  '--page-header-backdrop-image': `url("${backdropImage}")`,
                }
              : undefined
          }
          aria-hidden="true"
        />
      ) : null}

      <div className="container">
        <p
          className="section-kicker"
          style={{
            color: '#006797',
            fontSize: 'clamp(1.5rem, 2vw, 1.75rem)',
            maxWidth: '32ch',
          }}
        >
          {kicker}
        </p>

        <div
          className="page-header-grid"
          style={
            !title
              ? {
                  display: 'grid',
                  gridTemplateColumns: '1fr auto',
                  alignItems: 'start',
                }
              : undefined
          }
        >
          {title ? (
            <div className="page-header-left">
              <h1 className={`page-title ${titleClassName}`.trim()}>
                {title}
              </h1>
            </div>
          ) : (
            <div />
          )}

          <div
            className={`page-summary-wrap ${
              rightAlignedSummary ? 'page-summary-wrap--right' : ''
            }`}
            style={
              !title
                ? {
                    flex: '0 0 42rem',
                    marginLeft: 'auto',
                  }
                : undefined
            }
          >
            <p className="section-lead">{summary}</p>
            {children}
          </div>
        </div>
      </div>
    </header>
  );
}
