import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from '@/hooks/use-toast';
import { hashPassword } from '@/lib/security';
import { getMasterHash, setMasterHash, setLoggedIn } from '@/lib/storage';

export default function Onboarding() {
  const navigate = useNavigate();

  useEffect(() => {
    (async () => {
      const existing = await getMasterHash();
      if (existing) navigate('/login');
    })();
  }, [navigate]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const pw = String(form.get('password') || '');
    const confirm = String(form.get('confirm') || '');
    if (pw.length < 6) {
      toast({ title: 'Password too short', description: 'Use at least 6 characters.' });
      return;
    }
    if (pw !== confirm) {
      toast({ title: 'Passwords do not match' });
      return;
    }
    const hash = await hashPassword(pw);
    await setMasterHash(hash);
    await setLoggedIn(false);
    toast({ title: 'Master password set' });
    navigate('/login');
  }

  useEffect(() => { document.title = 'Set Master Password • KeyGuard Glow'; }, []);

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <Card className="w-full max-w-md card-glass">
        <CardHeader>
          <CardTitle>Set Master Password</CardTitle>
          <CardDescription>Secures access to your banks and cards</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" name="password" type="password" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirm">Confirm Password</Label>
              <Input id="confirm" name="confirm" type="password" required />
            </div>
            <Button type="submit" className="w-full" variant="glossy" size="lg">Save Password</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
