export default function MediaPlaceholder({ label, size, note, className = '' }) {
  return (
    <figure className={`media-placeholder ${className}`.trim()}>
      <div className="media-placeholder-frame">
        <span className="media-placeholder-label">{label}</span>
        <strong className="media-placeholder-size">{size}</strong>
      </div>
      {note ? <figcaption className="media-placeholder-note">{note}</figcaption> : null}
    </figure>
  );
}
