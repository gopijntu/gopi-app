import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Banknote, CreditCard } from 'lucide-react';
import { isLoggedIn } from '@/lib/storage';

export default function Home() {
  const navigate = useNavigate();

  useEffect(() => {
    (async () => {
      if (!(await isLoggedIn())) navigate('/login');
    })();
    document.title = 'KeyGuard Glow • Home';
  }, [navigate]);

  return (
    <main className="min-h-screen flex items-center justify-center p-6">
      <div className="max-w-xl w-full text-center space-y-6">
        <h1 className="text-3xl font-semibold">KeyGuard Glow</h1>
        <p className="text-muted-foreground">Securely manage your bank and card details</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Button variant="glossy" size="xl" className="h-28 flex flex-col" onClick={() => navigate('/banks')}>
            <Banknote className="size-7" />
            Banks
          </Button>
          <Button variant="glossy" size="xl" className="h-28 flex flex-col" onClick={() => navigate('/cards')}>
            <CreditCard className="size-7" />
            Cards
          </Button>
        </div>
      </div>
    </main>
  );
}
