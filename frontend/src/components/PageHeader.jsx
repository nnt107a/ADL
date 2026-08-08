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
  kickerColor = '',
  titleColor = '',
  summaryColor = '',
}) {
  const headerStyle = {
    ...(backdropImage
      ? {
          '--page-header-backdrop-image': `url("${backdropImage}")`,
        }
      : {}),
    ...(kickerColor
      ? {
          '--page-header-kicker-color': kickerColor,
        }
      : {}),
    ...(titleColor
      ? {
          '--page-header-title-color': titleColor,
        }
      : {}),
    ...(summaryColor
      ? {
          '--page-header-lead-color': summaryColor,
        }
      : {}),
  };

  return (
    <header
      className={`section page-header ${featured ? 'page-header--feature' : ''}`.trim()}
      style={Object.keys(headerStyle).length ? headerStyle : undefined}
    >
      {featured ? (
        <div
          className={`page-header-backdrop ${backdropClassName}`.trim()}
          aria-hidden="true"
        />
      ) : null}

      <div className="container">
        <p className="section-kicker">
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
            {/* <p className="section-lead" style={{ color: `var(--page-header-lead-color)` }}>
              {summary}
            </p> */}
            {children}
          </div>
        </div>
      </div>
    </header>
  );
}
