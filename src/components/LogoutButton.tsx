import { LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { setLoggedIn, lockVault } from '@/lib/storage';
import { toast } from '@/hooks/use-toast';

export default function LogoutButton() {
  const navigate = useNavigate();

  async function handleLogout() {
    await setLoggedIn(false);
    lockVault();
    toast({ title: 'Logged out' });
    navigate('/login');
  }

  return (
    <Button variant="outline" onClick={handleLogout} className="gap-2">
      <LogOut className="size-4" /> Logout
    </Button>
  );
}
