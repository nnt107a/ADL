import AccessDeniedState from './AccessDeniedState';
import LoadingState from './LoadingState';
import useAdminSession from '../hooks/useAdminSession';
import { useLocale } from '../context/LocaleContext';

export default function ProtectedAdminRoute({ children }) {
  const { isAdmin, checking } = useAdminSession();
  const { copy } = useLocale();

  if (checking) {
    return <LoadingState label={copy.admin.sessionChecking} />;
  }

  if (!isAdmin) {
    return (
      <section className="section section-light">
        <div className="container">
          <AccessDeniedState title={copy.admin.accessDeniedTitle} message={copy.admin.accessDeniedMessage} />
        </div>
      </section>
    );
  }

  return children;
}
