import { useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { isLoggedIn, setLoggedIn, lockVault } from '@/lib/storage';
import { toast } from '@/hooks/use-toast';

const TIMEOUT_MS = 2 * 60 * 1000; // 2 minutes

export default function InactivityLogout() {
  const navigate = useNavigate();
  const location = useLocation();
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    async function doLogout() {
      if (await isLoggedIn()) {
        await setLoggedIn(false);
        lockVault();
        toast({ title: 'Logged out due to inactivity' });
        navigate('/login');
      }
    }

    function resetTimer() {
      if (timerRef.current) window.clearTimeout(timerRef.current);
      timerRef.current = window.setTimeout(doLogout, TIMEOUT_MS);
    }

    const events: (keyof WindowEventMap)[] = [
      'mousemove',
      'keydown',
      'click',
      'touchstart',
      'scroll',
    ];

    events.forEach((ev) => window.addEventListener(ev, resetTimer, { passive: true } as any));
    resetTimer();

    return () => {
      if (timerRef.current) window.clearTimeout(timerRef.current);
      events.forEach((ev) => window.removeEventListener(ev, resetTimer));
    };
  }, [navigate, location.key]);

  return null;
}
