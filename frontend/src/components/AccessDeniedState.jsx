export default function AccessDeniedState({
  title = 'Page not found',
  message = 'The page you requested is unavailable.',
}) {
  return (
    <div className="container state-panel state-panel-error">
      <p className="state-label">404</p>
      <h2>{title}</h2>
      <p className="state-copy">{message}</p>
    </div>
  );
}
