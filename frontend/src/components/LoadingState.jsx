import { useLocale } from '../context/LocaleContext';

export default function LoadingState({ label }) {
  const { copy } = useLocale();

  return (
    <div className="container state-panel">
      <p className="state-label">{label || copy.ui.loading}</p>
      <p className="state-copy">{copy.ui.loadingWait}</p>
    </div>
  );
}
