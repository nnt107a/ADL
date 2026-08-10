import { useLocale } from '../context/LocaleContext';

export default function ErrorState({ title, message }) {
  const { copy } = useLocale();

  let displayMessage = message;
  if (typeof message === 'string') {
    const lower = message.toLowerCase();
    if (lower.includes('failed to fetch') || lower.includes('failed to load data') || lower.includes('networkerror')) {
      displayMessage = copy?.ui?.failedToFetch || 'Failed to fetch data. Please check your network connection or try again later.';
    }
  }

  return (
    <div className="container state-panel state-panel-error">
      <p className="state-label">{copy?.ui?.error || 'Error'}</p>
      <h2>{title || copy?.ui?.error || 'Error'}</h2>
      <p className="state-copy">{displayMessage || copy?.ui?.noItems || 'No items found.'}</p>
    </div>
  );
}
