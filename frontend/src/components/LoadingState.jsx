export default function LoadingState({ label = 'Loading content' }) {
  return (
    <div className="container state-panel">
      <p className="state-label">{label}</p>
      <p className="state-copy">Please wait a moment while the page data loads.</p>
    </div>
  );
}
