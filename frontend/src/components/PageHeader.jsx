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

      <div className="container page-header-container">
        <div className="page-header-center-content">
          {kicker ? (
            <p className="section-kicker page-header-kicker">
              {kicker}
            </p>
          ) : null}

          {title ? (
            <h1 className={`page-title page-header-title ${titleClassName}`.trim()}>
              {title}
            </h1>
          ) : null}
        </div>

        {children ? (
          <div
            className={`page-summary-wrap ${
              rightAlignedSummary ? 'page-summary-wrap--right' : ''
            }`}
          >
            {children}
          </div>
        ) : null}
      </div>
    </header>
  );
}
