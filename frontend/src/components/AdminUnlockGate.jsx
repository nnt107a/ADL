import { useEffect } from 'react';

const ADMIN_UNLOCK_KEY = 'l';
const REQUIRED_PRESSES = 5;
const TIME_WINDOW_MS = 10000;

function isEditableTarget(target) {
  const tagName = target?.tagName?.toLowerCase();
  return target?.isContentEditable || ['input', 'textarea', 'select'].includes(tagName);
}

export default function AdminUnlockGate() {
  useEffect(() => {
    let firstPressAt = 0;
    let pressCount = 0;

    async function grantAdmin() {
      const response = await fetch('/api/grant-admin', {
        method: 'POST',
        credentials: 'same-origin',
      }).catch(() => undefined);

      if (response?.ok) {
        window.dispatchEvent(new CustomEvent('adl-admin-session-granted'));
      }
    }

    function handleKeyDown(event) {
      if (event.repeat || isEditableTarget(event.target)) {
        return;
      }

      const key = String(event.key || '').toLowerCase();

      if (key !== ADMIN_UNLOCK_KEY) {
        firstPressAt = 0;
        pressCount = 0;
        return;
      }

      const now = Date.now();

      if (!firstPressAt || now - firstPressAt > TIME_WINDOW_MS) {
        firstPressAt = now;
        pressCount = 1;
        return;
      }

      pressCount += 1;

      if (pressCount >= REQUIRED_PRESSES) {
        firstPressAt = 0;
        pressCount = 0;
        grantAdmin();
      }
    }

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  return null;
}
