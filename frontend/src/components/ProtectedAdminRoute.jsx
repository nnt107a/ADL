import { useEffect, useState } from 'react';
import ErrorState from './ErrorState';
import LoadingState from './LoadingState';

export default function ProtectedAdminRoute({ children }) {
  const [status, setStatus] = useState('checking');

  async function checkAdminSession() {
    try {
      setStatus('checking');
      const response = await fetch('/api/admin/session', {
        credentials: 'same-origin',
      });

      setStatus(response.ok ? 'allowed' : 'denied');
    } catch {
      setStatus('denied');
    }
  }

  useEffect(() => {
    checkAdminSession();

    window.addEventListener('adl-admin-session-granted', checkAdminSession);

    return () => {
      window.removeEventListener('adl-admin-session-granted', checkAdminSession);
    };
  }, []);

  if (status === 'checking') {
    return <LoadingState label="Checking admin session" />;
  }

  if (status === 'denied') {
    return (
      <section className="section section-light">
        <div className="container">
          <ErrorState
            title="Admin access required"
            message="Press L five times within 10 seconds while focused on the website, then this route will unlock for the current browser session."
          />
        </div>
      </section>
    );
  }

  return children;
}
