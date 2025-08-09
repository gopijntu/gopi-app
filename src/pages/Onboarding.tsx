import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from '@/hooks/use-toast';
import { hashPassword } from '@/lib/security';
import { getMasterHash, setMasterHash, setLoggedIn, setFirstRunSetup } from '@/lib/storage';

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
    const q1 = String(form.get('q1') || '');
    const a1 = String(form.get('a1') || '');
    const q2 = String(form.get('q2') || '');
    const a2 = String(form.get('a2') || '');

    if (pw.length < 6) {
      toast({ title: 'Password too short', description: 'Use at least 6 characters.' });
      return;
    }
    if (pw !== confirm) {
      toast({ title: 'Passwords do not match' });
      return;
    }
    if (!q1 || !a1 || !q2 || !a2) {
      toast({ title: 'Please fill both security questions and answers' });
      return;
    }

    // Store initial setup (vault key + wrapped with password and answers)
    await setFirstRunSetup({ password: pw, q1, a1, q2, a2 });

    // Also keep a hash for quick password verification (no plaintext storage)
    const hash = await hashPassword(pw);
    await setMasterHash(hash);
    await setLoggedIn(false);
    toast({ title: 'Setup complete' });
    navigate('/login');
  }

  useEffect(() => { document.title = 'First-time Setup • KeyGuard Glow'; }, []);

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <Card className="w-full max-w-md card-glass">
        <CardHeader>
          <CardTitle>First-time Setup</CardTitle>
          <CardDescription>Create a password and two security questions</CardDescription>
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

            <div className="space-y-2">
              <Label htmlFor="q1">Security Question 1</Label>
              <Input id="q1" name="q1" placeholder="e.g., Your first school?" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="a1">Answer 1</Label>
              <Input id="a1" name="a1" type="password" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="q2">Security Question 2</Label>
              <Input id="q2" name="q2" placeholder="e.g., Your birthplace?" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="a2">Answer 2</Label>
              <Input id="a2" name="a2" type="password" required />
            </div>

            <Button type="submit" className="w-full" variant="glossy" size="lg">Save Setup</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
