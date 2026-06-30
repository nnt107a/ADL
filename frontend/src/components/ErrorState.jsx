export default function ErrorState({ title = 'Content unavailable', message }) {
  return (
    <div className="container state-panel state-panel-error">
      <p className="state-label">Error</p>
      <h2>{title}</h2>
      <p className="state-copy">{message}</p>
    </div>
  );
}
