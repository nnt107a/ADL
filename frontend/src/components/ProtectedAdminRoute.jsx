import AccessDeniedState from './AccessDeniedState';
import LoadingState from './LoadingState';
import useAdminSession from '../hooks/useAdminSession';

export default function ProtectedAdminRoute({ children }) {
  const { isAdmin, checking } = useAdminSession();

  if (checking) {
    return <LoadingState label="Checking admin session" />;
  }

  if (!isAdmin) {
    return (
      <section className="section section-light">
        <div className="container">
          <AccessDeniedState />
        </div>
      </section>
    );
  }

  return children;
}
