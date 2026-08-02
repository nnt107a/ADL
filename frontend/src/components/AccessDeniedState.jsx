import { useLocale } from '../context/LocaleContext';

export default function AccessDeniedState({ title, message }) {
  const { copy } = useLocale();

  return (
    <div className="container state-panel state-panel-error">
      <p className="state-label">404</p>
      <h2>{title || copy.ui.notFoundTitle}</h2>
      <p className="state-copy">{message || copy.ui.notFoundMessage}</p>
    </div>
  );
}
