import { ReactNode, useEffect, useState } from 'react';
import { hasVaultSetup, isLoggedIn, isVaultUnlocked, ensureSessionUnlock } from '@/lib/storage';
import { Navigate, useLocation } from 'react-router-dom';

export default function RequireAuth({ children }: { children: ReactNode }) {
  const location = useLocation();
  const [status, setStatus] = useState<'loading' | 'ok' | 'redirect'>('loading');

  useEffect(() => {
    (async () => {
      const setup = await hasVaultSetup();
      if (!setup) {
        setStatus('redirect');
        return;
      }
      const logged = await isLoggedIn();
      if (!logged) {
        setStatus('redirect');
        return;
      }
      await ensureSessionUnlock();
      if (!isVaultUnlocked()) {
        setStatus('redirect');
        return;
      }
      setStatus('ok');
    })();
  }, []);

  if (status === 'loading') return null;
  if (status === 'redirect') return <Navigate to="/login" state={{ from: location }} replace />;
  return <>{children}</>;
}
