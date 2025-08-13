import { useEffect } from 'react';
import { isLoggedIn, ensureSessionUnlock } from '@/lib/storage';

export default function AutoUnlock() {
  useEffect(() => {
    (async () => {
      if (await isLoggedIn()) {
        await ensureSessionUnlock();
      }
    })();
  }, []);
  return null;
}
