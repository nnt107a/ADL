export default function PageHeader({ kicker, title, summary, children }) {
  return (
    <header className="section page-header">
      <div className="container">
        <p1 className="section-kicker">{kicker}</p1>

        <div className="page-header-grid">
          <div className="page-header-left">
            <h1 className="page-title">{title}</h1>
          </div>

          <div className="page-summary-wrap">
            <p className="section-lead">{summary}</p>
            {children}
          </div>
        </div>
      </div>
    </header>
  );
}