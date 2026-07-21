import { useEffect, useState } from 'react';

export default function useAdminSession() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    let ignore = false;

    async function checkAdminSession() {
      try {
        if (!ignore) {
          setChecking(true);
        }

        const response = await fetch('/api/admin/session', {
          credentials: 'same-origin',
        });

        if (!ignore) {
          setIsAdmin(response.ok);
        }
      } catch {
        if (!ignore) {
          setIsAdmin(false);
        }
      } finally {
        if (!ignore) {
          setChecking(false);
        }
      }
    }

    checkAdminSession();

    window.addEventListener('adl-admin-session-granted', checkAdminSession);

    return () => {
      ignore = true;
      window.removeEventListener('adl-admin-session-granted', checkAdminSession);
    };
  }, []);

  return { isAdmin, checking };
}
